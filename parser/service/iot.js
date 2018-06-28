const AWS = require('aws-sdk');
exports.handler = async (event) => {
    const iotData = new AWS.IotData({
        endpoint: process.env.IOT_ENDPOINT,
        region: 'us-east-1',
    });
    const iotParams = {
        // region: 'us-east-1',
        payload: JSON.stringify(event),
        topic: process.env.IOT_TOPIC,
    };
    return await iotData.publish(iotParams).promise();
};
