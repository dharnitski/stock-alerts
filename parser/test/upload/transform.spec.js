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
                done();
            })
        })
    })
})
