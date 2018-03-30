'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies



function persist(event) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient(
        {
            region: 'us-east-1'
        }
    );

    const timestamp = new Date().toISOString();
    const table = process.env.DYNAMODB_TABLE;
    const id = `${event.symbol}${event.haltTime.getTime() / 1000}`
    const item = Object.assign(
        {
            id: id,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        event
    )
    //convert all dates to ISO string as it is how they are stored in Mongo
    for (var propt in item) {
        if (typeof (item[propt].toISOString) === 'function') {
            item[propt] = item[propt].toISOString()
        }
    }

    //get item
    return dynamoDb.get({
        TableName: table,
        Key: { id: id }
    }).promise()
        .then(data => {
            //console.log(`get: ${JSON.stringify(data)}`);
            //save if item does not exist
            if (!data.Item) {
                return dynamoDb.put({
                    TableName: table,
                    Item: item,
                }).promise().then()
            }
            return new Promise((resolve) => {
                resolve({status: "old"});
            });
        })
};

module.exports = {
    persist: persist,
}