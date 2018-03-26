'use strict';
/* global describe it beforeEach */



const nock = require('nock');
const expect = require('chai').expect;
const fs = require("fs");

const myLambda = require('../../upload/handler');

describe('Upload', () => {

    describe('handler', () => {

        afterEach(() => {
            nock.cleanAll()
        })

        describe('nasdaqtrader returns empty list', () => {
            beforeEach(() => {
                const empty = fs.readFileSync('./parser/test/testdata/empty.xml', 'utf8');
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(200, empty);
            });

            it('should process halts', (done) => {
                myLambda.handler({}, { /* context */ }, (err, result) => {
                    try {
                        expect(err).to.not.exist;
                        expect(result).to.exist;
                        expect(result.channel.title).to.equal('NASDAQTrader.com');
                        done();
                    }
                    catch (error) {
                        done(error);
                    }
                });
            });
        });

        describe('nasdaqtrader returns 500', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(500, 'some error');
            });

            it('should return error', (done) => {
                myLambda.handler({}, { /* context */ }, (err, result) => {
                    try {
                        expect(err).to.exist;
                        expect(err.message).to.equal('got 500 from with body: some error');
                        done();
                    }
                    catch (error) {
                        done(error);
                    }
                });
            });
        });

        describe('nasdaqtrader returns bad body', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(200, 'not xml');
            });

            it('should return error', (done) => {
                myLambda.handler({}, { /* context */ }, (err, result) => {
                    try {
                        expect(err).to.exist;
                        expect(err.message).to.include('Non-whitespace before first tag');
                        done();
                    }
                    catch (error) {
                        done(error);
                    }
                });
            });
        });

        describe('nasdaqtrader throws an error', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .replyWithError({'message': 'something awful happened', 'code': 'AWFUL_ERROR'});
            });

            it('should return error', (done) => {
                myLambda.handler({}, { /* context */ }, (err, result) => {
                    try {
                        expect(err).to.exist;
                        expect(err.message).to.equal('something awful happened');
                        done();
                    }
                    catch (error) {
                        done(error);
                    }
                });
            });
        });

    });
});