const AWS = require('aws-sdk');
exports.handler = async (event) => {
    const iotData = new AWS.IotData({
        endpoint: 'a1kq7r55rfrhuj.iot.us-east-1.amazonaws.com',
        region: 'us-east-1',
    });
    const iotParams = {
        // region: 'us-east-1',
        payload: JSON.stringify(event),
        topic: `/stock-alerts/alert`,
    };
    return await iotData.publish(iotParams).promise();
};
