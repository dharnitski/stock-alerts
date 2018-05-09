'use strict';

const request = require('request');
const transform = require('./transform').transform;
const persist = require('../service/dynamodb').persist;


module.exports.handler = (event, context, callback) => {
  // const url = "https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts&haltdate=03282018";
  const url = 'https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts';

  request(url, (error, response, body) => {
    if (error) {
      callback(error);
      return;
    }

    if (response.statusCode != 200) {
      callback(new Error(`got ${response.statusCode} from with body: ${body}`));
      return;
    }

    transform(body)
      .then((data) => {
        return persist(data.channel.items);
      }).then(
        (data) => callback(null, data),
        (err) => callback(err)
      );
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
