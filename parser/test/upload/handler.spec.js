'use strict';
/* global describe it beforeEach */


const nock = require('nock');
const expect = require('chai').expect;
const fs = require('fs');

const myLambda = require('../../upload/handler');

describe('Upload', () => {
    describe('handler', () => {
        afterEach(() => {
            nock.cleanAll();
        });

        describe('nasdaqtrader returned empty list', () => {
            beforeEach(() => {
                const empty = fs.readFileSync('./parser/test/testdata/empty.xml', 'utf8');
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(200, empty);
            });

            it('should process halts', async () => {
                const actual = await myLambda.handler({});
                expect(actual).to.deep.equal([]);
            });
        });

        describe('nasdaqtrader returns 500', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(500, 'some error');
            });

            it('should return error', async (done) => {
                try {
                    await myLambda.handler({});
                    done('Should throw an error');
                } catch (error) {
                    expect(error.message).to.equal('got 500 from with body: some error');
                    done();
                }
            });
        });

        describe('nasdaqtrader returns bad body', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .reply(200, 'not xml');
            });

            it('should return error', async (done) => {
                try {
                    await myLambda.handler({});
                    done('Should throw an error');
                } catch (error) {
                    expect(error.message).to.include('Non-whitespace before first tag');
                    done();
                }
            });
        });

        describe('nasdaqtrader throws an error', () => {
            beforeEach(() => {
                nock('https://www.nasdaqtrader.com/rss.aspx')
                    .get('?feed=tradehalts')
                    .replyWithError({ 'message': 'something awful happened', 'code': 'AWFUL_ERROR' });
            });

            it('should return error', async (done) => {
                try {
                    await myLambda.handler({});
                    done('Should throw an error');
                } catch (error) {
                    expect(error.message).to.equal('request to https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts failed, reason: something awful happened');
                    done();
                }
            });
        });

        // describe('integration test', () => {
        //     it('should process halts', (done) => {
        //         process.env.DYNAMODB_TABLE = 'stock-alerts-dev';
        //         myLambda.handler({}, { /* context */ }, (err, result) => {
        //             try {
        //                 expect(err).to.not.exist;
        //                 expect(result).to.exist;
        //                 //expect(result).to.equal('NASDAQTrader.com');
        //                 done();
        //             }
        //             catch (error) {
        //                 done(error);
        //             }
        //         });
        //     });
        // });
    });
});
