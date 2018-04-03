'use strict';
/* global describe it beforeEach */

var AWS = require('aws-sdk-mock');
const expect = require('chai').expect;

const persist = require('../../service/dynamodb').persist;

describe('Dymamo', () => {
    process.env.DYNAMODB_TABLE = 'stock-parser-dev';

    const item = {
        symbol: 'WG',
        name: 'Willbros Group, Inc.',
        market: 'NYSE',
        reasonCode: 'T1',
        haltTime: new Date('2018-03-26T17:00:42.000Z')
    };

    describe('create new', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
                callback(null, {});
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                expect(params.TableName).to.equal('stock-parser-dev');
                expect(params.Item.id).to.equal('WG1522083642');
                expect(params.Item.createdAt).to.not.empty;
                expect(params.Item.updatedAt).to.not.empty;
                expect(params.Item.symbol).to.equal('WG');
                expect(params.Item.name).to.equal('Willbros Group, Inc.');
                expect(params.Item.market).to.equal('NYSE');
                expect(params.Item.reasonCode).to.equal('T1');
                expect(params.Item.haltTime).to.equal('2018-03-26T17:00:42.000Z');
                callback(null, { name: 'a' });
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        })

        it('should persist', (done) => {
            persist(item).then(actual => {
                expect(actual.name).to.equal('a');
                done();
            })
        })
    })

    describe('update', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
                callback(null, { "Item": { "symbol": "WG", "updatedAt": "2018-03-30T01:34:54.320Z", "createdAt": "2018-03-30T01:34:54.320Z", "id": "WG1522083642", "name": "Willbros Group, Inc.", "reasonCode": "T1", "market": "NYSE", "haltTime": "2018-03-26T17:00:42.000Z" } });
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                fail('put should not be called')
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        })

        it('should persist', (done) => {
            persist(item).then(actual => {
                expect(actual.status).to.equal('exist');
                done();
            })
        })
    })

    describe('skip empty field', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
                fail('get should not be called')
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                fail('put should not be called')
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        })

        const noSymbol = {
            //test items have empty symbol
            symbol: '',
            name: 'Willbros Group, Inc.',
            market: 'NYSE',
            reasonCode: 'T1',
            haltTime: new Date('2018-03-26T17:00:42.000Z')
        };

        it('should persist', (done) => {
            persist(noSymbol).then(actual => {
                expect(actual.status).to.equal('skip');
                done();
            })
        })
    })

    // describe('integration ', () => {
    //     it('should persist', (done) => {
    //         persist(item).then(actual => {
    //             done();
    //         })
    //     })
    // })
})
