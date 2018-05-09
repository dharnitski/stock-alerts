'use strict';
/* global describe it beforeEach */

const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;

const persist = require('../../service/dynamodb').persist;
// const dailyEvents = require('../../service/dynamodb').dailyEvents;

describe('Dymamo', () => {
    process.env.DYNAMODB_TABLE = 'stock-alerts-dev';

    const item = {
        symbol: 'WG',
        name: 'Willbros Group, Inc.',
        market: 'NYSE',
        reasonCode: 'T1',
        haltTime: new Date('2018-03-26T17:00:42.000Z'),
    };

    describe('create new', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                expect(params.TableName).to.equal('stock-alerts-dev');
                expect(params.KeyConditionExpression).to.equal('haltDate = :haltDate');
                expect(params.TableName).to.equal('stock-alerts-dev');
                expect(params.ExpressionAttributeValues[':haltDate']).to.equal('2018-03-26');
                callback(null, {Items: [], Count: 0, ScannedCount: 0});
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                expect(params.TableName).to.equal('stock-alerts-dev');
                expect(params.Item.haltDate).to.equal('2018-03-26');
                expect(params.Item.sort).to.equal('17:00:42.000Z_NYSE_WG');
                expect(params.Item.createdAt).to.not.empty;
                expect(params.Item.updatedAt).to.not.empty;
                expect(params.Item.symbol).to.equal('WG');
                expect(params.Item.name).to.equal('Willbros Group, Inc.');
                expect(params.Item.market).to.equal('NYSE');
                expect(params.Item.reasonCode).to.equal('T1');
                expect(params.Item.haltTime).to.equal('2018-03-26T17:00:42.000Z');
                callback(null, {name: 'a'});
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        });

        it('should persist', (done) => {
            persist([item]).then((actual) => {
                expect(actual[0].name).to.equal('a');
                done();
            });
        });
    });

    describe('not matching item', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback(null,
                    {
                        Items:
                            [{
                                symbol: 'wrong-symbol',
                                updatedAt: '2018-04-10T02:31:09.618Z',
                                createdAt: '2018-04-10T02:31:09.618Z',
                                haltDate: '2018-03-26',
                                sort: '17:00:42.000Z_NYSE_WG',
                                name: 'Willbros Group, Inc.',
                                reasonCode: 'T1',
                                market: 'NYSE',
                                haltTime: '2018-03-26T17:00:42.000Z',
                            }],
                        Count: 1,
                        ScannedCount: 1,
                    });
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                callback(null, {name: 'a'});
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        });

        it('should persist', (done) => {
            persist([item]).then((actual) => {
                expect(actual[0].name).to.equal('a');
                done();
            });
        });
    });

    describe('update', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback(null,
                    {
                        Items:
                            [{
                                symbol: 'WG',
                                updatedAt: '2018-04-10T02:31:09.618Z',
                                createdAt: '2018-04-10T02:31:09.618Z',
                                haltDate: '2018-03-26',
                                sort: '17:00:42.000Z_NYSE_WG',
                                name: 'Willbros Group, Inc.',
                                reasonCode: 'T1',
                                market: 'NYSE',
                                haltTime: '2018-03-26T17:00:42.000Z',
                            }],
                        Count: 1,
                        ScannedCount: 1,
                    });
            });

            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                fail('put should not be called');
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        });

        it('should persist', (done) => {
            persist([item]).then((actual) => {
                expect(actual[0].status).to.equal('exist');
                done();
            });
        });
    });

    describe('skip empty field', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
                callback(null, {Items: [], Count: 0, ScannedCount: 0});
            });
            AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
                fail('put should not be called');
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        });

        const noSymbol = {
            // test items have empty symbol
            symbol: '',
            name: 'Willbros Group, Inc.',
            market: 'NYSE',
            reasonCode: 'T1',
            haltTime: new Date('2018-03-26T17:00:42.000Z'),
        };

        it('should skip', (done) => {
            persist([noSymbol]).then((actual) => {
                expect(actual[0].status).to.equal('skip');
                done();
            });
        });
    });

    describe('integration ', () => {

        // it('query', (done) => {
        //     dailyEvents().then(actual => {
        //         expect(actual.Items[0].id).to.equal('test');
        //         done();
        //     })
        // })

        // it('persist', (done) => {
        // persist([item]).then(actual => {
        //     expect(actual.Count).to.equal('test');
        //     done();
        // })
        // })
    });
});
