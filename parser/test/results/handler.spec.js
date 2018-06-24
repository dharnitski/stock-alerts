'use strict';
/* global describe it beforeEach */

const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;

const myLambda = require('../../results/handler');

describe('Results', () => {
    process.env.DYNAMODB_TABLE = 'stock-alerts-dev';

    const item = {
        symbol: 'WG',
        name: 'Willbros Group, Inc.',
        market: 'NYSE',
        reasonCode: 'T1',
        haltTime: new Date('2018-03-26T17:00:42.000Z')
    };

    describe('get one', () => {
        beforeEach(() => {
            AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
                expect(params.TableName).to.equal('stock-alerts-dev');
                callback(null, { Items: [item] });
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
        })

        it('should return', (done) => {
            myLambda.handler({}, { /* context */ }, (err, result) => {
                try {
                    expect(err).to.not.exist;
                    expect(result).to.exist;
                    expect(result.statusCode).to.equal(200);
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        })
    })

    describe('throw error', () => {
        let old;
        beforeEach(() => {
            old = console.error;
            console.error = () => { };
            AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
                callback(new Error('Boom!'));
            });
        });
        afterEach(() => {
            AWS.restore('DynamoDB.DocumentClient');
            console.error = old;
        })

        it('should return', (done) => {
            myLambda.handler({}, { /* context */ }, (err, result) => {
                try {
                    expect(err).to.not.exist;
                    expect(result).to.exist;
                    expect(result.statusCode).to.equal(501);
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        })
    })
})