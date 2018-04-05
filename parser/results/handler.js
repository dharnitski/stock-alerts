'use strict';

const list = require('../service/dynamodb').list

module.exports.handler = (event, context, callback) => {
    list().then(
        result => {
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(result.Items),
            };
            callback(null, response);
        },
        error => {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: { message: 'Couldn\'t fetch the halts.' },
            });
        }
    )
};
