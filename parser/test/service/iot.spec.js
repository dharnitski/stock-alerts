'use strict';
/* global describe it */

const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;

const iot = require('../../service/iot');

describe('IOT', () => {
    describe('integration ', () => {
        it('iot', async () => {
            const actual = await iot.handler({ message: 'hello' });
            expect(actual).to.deep.equal({});
        });
    });

    describe('publish', () => {
        beforeEach(() => {
            AWS.mock('IotData', 'publish', (params, callback) => {
                expect(params.topic).to.equal('/stock-alerts/alert');
                expect(params.payload).to.equal('{"message":"hello"}');
                callback(null, { 'name': 'test' });
            });
        });
        afterEach(() => {
            AWS.restore('IotData');
        });

        it('iot', async () => {
            const actual = await iot.handler({ message: 'hello' });
            expect(actual).to.deep.equal({ 'name': 'test' });
        });
    });
});
