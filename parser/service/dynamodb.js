'use strict';

const AWS = require('aws-sdk');

function db() {
    return new AWS.DynamoDB.DocumentClient(
        {
            region: 'us-east-1',
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

/**
 * gets events for one day and returns promise
 *
 * @param {string} haltDate date in string format '2018-03-26'
 * @param {Object[]} events halt events for this date
 * @return {Promise}
 */
function persistDay(haltDate, events) {
    const table = process.env.DYNAMODB_TABLE;
    const dynamoDb = db();
    return dynamoDb.query({
        TableName: table,
        KeyConditionExpression: 'haltDate = :haltDate',
        ExpressionAttributeValues: {
            ':haltDate': haltDate,
        },
    }).promise().then((saved) => {
        return Promise.all(events.map((event) => saveOne(event, saved.Items, dynamoDb)));
        // { Items: [], Count: 0, ScannedCount: 0 }
        // { Items:
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
    });
}

const StatusAdd = 'add';

/**
 * Checked if event is in already saved (in saved list)
 * and put it into DynamoDB if it is not
 * @param {Object} event Incoming event
 * @param {Object[]} saved Existing events in dynamodb
 * @param {AWS.DynamoDB.DocumentClient} dynamoDb Data Storage
 * @return {Promise}
 */
function saveOne(event, saved, dynamoDb) {
    // skip test events
    if (!event.symbol || !event.name) {
        console.warn('skip test event: ', event);
        return {
            status: 'skip',
            reason: 'test event - empty symbol or name',
            data: event,
        };
    }
    const table = process.env.DYNAMODB_TABLE;
    const timestamp = new Date().toISOString();

    // item to save into DynamoDB
    // code below adds some DynamoDB specific fields.
    const item = Object.assign(
        {
            haltDate: formatDate(event),
            sort: formatTime(event),
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        event
    );
    // convert all dates to ISO string as it is how they are stored in DynamoDB
    for (const propt in item) {
        if (typeof (item[propt].toISOString) === 'function') {
            item[propt] = item[propt].toISOString();
        }
    }

    let match;
    saved.forEach((existing) => {
        if (event.symbol === existing.symbol
            && event.market === existing.market
            && event.haltTime.toISOString() === existing.haltTime) {
            match = existing;
        }
    });
    if (!match) { // add new item
        return dynamoDb.put({
            TableName: table,
            Item: item,
        }).promise()
            .then(() => saveResult(StatusAdd, event));
    }
    // todo: update if changes detected
    return saveResult('exists', event);
}


/**
 * Generate save result object
 *
 * @param {string} status Action execution status
 * @param {object} item Object to save
 * @return {object} Result
 */
function saveResult(status, item) {
    return {
        status: status,
        data: item,
    };
}

function persist(events) {
    // group by events by date as date is primary key in db
    const grouped = groupBy(events, (e) => formatDate(e));

    return Promise.all(Object.getOwnPropertyNames(grouped)
        .map((g) => persistDay(g, grouped[g])))
        // flatten array or arrays
        .then((r) => r.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []));
};

module.exports = {
    persist: persist,
    list: list,
    StatusAdd: StatusAdd,
};
