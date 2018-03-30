'use strict';
/* global describe it beforeEach */

const fs = require("fs");
const nock = require('nock');
const expect = require('chai').expect;

const transform = require('../../upload/transform').transform;

describe('Transform', () => {

    describe('from empty list', () => {

        const empty = fs.readFileSync('./parser/test/testdata/empty.xml', 'utf8');

        it('should return', (done) => {
            transform(empty).then(actual => {
                {/* <title>NASDAQTrader.com</title>
        <link>http://www.nasdaqtrader.com</link>
        <description>NASDAQ Trade Halts</description>
        <copyright>Copyright 2018. All rights reserved.</copyright>
        <pubDate>Sat, 24 Mar 2018 15:37:29 GMT</pubDate>
        <ttl>1</ttl>
        <ndaq: numItems>0</ndaq: numItems> */}
                expect(actual.channel.title).to.equal('NASDAQTrader.com');
                expect(actual.channel.link).to.equal('http://www.nasdaqtrader.com');
                expect(actual.channel.description).to.equal('NASDAQ Trade Halts');
                expect(actual.channel.pubDate.toISOString()).to.equal('2018-03-24T15:37:29.000Z');
                expect(actual.channel.numItems).to.equal(0);
                expect(actual.channel.items).to.be.empty;
                
                done();
            })
        })
    })

    describe('from 3 items', () => {

        const empty = fs.readFileSync('./parser/test/testdata/3items.xml', 'utf8');

        it('should return', (done) => {
            transform(empty).then(actual => {
                expect(actual.channel.numItems).to.equal(3);

                const first = actual.channel.items[0]
                expect(first.symbol).to.equal('WG');
                expect(first.name).to.equal('Willbros Group, Inc.');
                expect(first.market).to.equal('NYSE');
                expect(first.reasonCode).to.equal('T1');
                expect(first.haltTime.toISOString()).to.equal('2018-03-26T17:00:42.000Z');
                expect(first.resumptionQuoteTime).to.be.undefined;
                expect(first.resumptionTradeTime).to.be.undefined;

                const second = actual.channel.items[1]
                expect(second.symbol).to.equal('ABIL');
                expect(second.name).to.equal('Ability Inc.');
                expect(second.market).to.equal('NASDAQ');
                expect(second.reasonCode).to.equal('LUDP');
                expect(second.haltTime.toISOString()).to.equal('2018-03-26T14:29:47.000Z');
                expect(second.resumptionQuoteTime.toISOString()).to.equal('2018-03-26T14:29:47.000Z');
                expect(second.resumptionTradeTime.toISOString()).to.equal('2018-03-26T14:34:47.000Z');

                const third = actual.channel.items[2]
                expect(third.symbol).to.equal('LNCE');
                expect(third.name).to.equal('Snyders-Lance, Inc.');
                expect(third.market).to.equal('NASDAQ');
                expect(third.reasonCode).to.equal('T12');
                expect(third.haltTime.toISOString()).to.equal('2018-03-26T13:21:18.000Z');
                expect(third.resumptionQuoteTime).to.be.undefined;
                expect(third.resumptionTradeTime).to.be.undefined;

                done();
            })
        })
    })
})
