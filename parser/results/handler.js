'use strict';

const list = require('../service/dynamodb').list

module.exports.handler = (event, context, callback) => {
    list().then(
        result => {
            const response = {
                statusCode: 200,
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
