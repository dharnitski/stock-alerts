'use strict';
/* global describe it beforeEach */

var expect = require('chai').expect;

const myLambda = require('../../upload/handler');

describe('Upload', () => {

    describe('handler', () => {

        it('should return 200', (done) => {

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
        });
    });
});