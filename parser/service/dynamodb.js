'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies


function db() {
    return new AWS.DynamoDB.DocumentClient(
        {
            region: 'us-east-1'
        }
    );
}

function list() {
    const dynamoDb = db();
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
    };
    return dynamoDb.scan(params).promise();
}

// date is used as partition key in dynamodb
// format ISO date (UTF timezone) YYYY-MM-DD
function formatDate(event) {
    return event.haltTime.toISOString().split('T')[0];
}

// time is used as sort key in dynamodb
// format contains UTF time - HH:mm:ss.sssZ and market and symbol to ensure uniqueness
function formatTime(event) {
    return `${event.haltTime.toISOString().split('T')[1]}_${event.market}_${event.symbol}`;
}

function groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

// function dailyEvents(date) {
//     const dynamoDb = db();
//     var params = {
//         ExpressionAttributeValues: {
//             ':id': 'GNPX1523024948' 
//         },

//         //KeyConditionExpression: 'id = :id',
//         KeyConditionExpression: 'begins_with ( id, :id )',
//         //
//         TableName: process.env.DYNAMODB_TABLE
//     };

//     return dynamoDb.query(params).promise();
// }


// gets events for one day and returns promise
function persistDay(haltDate, events) {
    const table = process.env.DYNAMODB_TABLE
    const dynamoDb = db();
    return dynamoDb.query({
        TableName: table,
        KeyConditionExpression: "haltDate = :haltDate",
        ExpressionAttributeValues: {
            ":haltDate": haltDate
        }
    }).promise().then(saved => {
        return Promise.all(events.map(event => saveOne(event, saved.Items, dynamoDb)));
        //{ Items: [], Count: 0, ScannedCount: 0 }
        //{ Items: 
        //      [ { symbol: 'WG',
        //      updatedAt: '2018-04-10T02:31:09.618Z',
        //      createdAt: '2018-04-10T02:31:09.618Z',
        //      haltDate: '2018-03-26',
        //      sort: '17:00:42.000Z_NYSE_WG',
        //      name: 'Willbros Group, Inc.',
        //      reasonCode: 'T1',
        //      market: 'NYSE',
        //      haltTime: '2018-03-26T17:00:42.000Z' } ],
        // Count: 1,
        // ScannedCount: 1 }
    })
}

//event - incoming event
//saved - existing events in dynamodb
function saveOne(event, saved, dynamoDb) {

    //skip test events
    if (!event.symbol) {
        console.log(`skip: ${JSON.stringify(event)}`);
            return { status: "skip", reason: `empty ${propt}` };
    }

    let match;
    saved.forEach(existing => {
        if (event.symbol === existing.symbol
            && event.market === existing.market
            && event.haltTime.toISOString() === existing.haltTime) {
            match = existing;
        }
    });
    const table = process.env.DYNAMODB_TABLE;
    if (!match) { //add new item
        const timestamp = new Date().toISOString();
        const item = Object.assign(
            {
                haltDate: formatDate(event),
                sort: formatTime(event),
                createdAt: timestamp,
                updatedAt: timestamp,
            },
            event
        )
        //convert all dates to ISO string as it is how they are stored in DynamoDB
        for (var propt in item) {
            if (typeof (item[propt].toISOString) === 'function') {
                item[propt] = item[propt].toISOString()
            }
        }

        return dynamoDb.put({
            TableName: table,
            Item: item,
        }).promise()
    }
    //todo: update if changes detected
    return { status: "exist" };
}

function persist(events) {
    // group by events by date as date is primary key db
    const grouped = groupBy(events, (e) => formatDate(e));

    return Promise.all(Object.getOwnPropertyNames(grouped).map(g => persistDay(g, grouped[g])))
        //flatten array or arrays
        .then(r => r.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []));
};

module.exports = {
    // dailyEvents: dailyEvents,
    persist: persist,
    list: list,
}