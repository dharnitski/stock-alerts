'use strict';

const request = require('request');
const parseString = require('xml2js').parseString;


module.exports.handler = (event, context, callback) => {

  const url =
    "https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts";


  request(url, (error, response, body) => {
    if (error) {
      callback(error);
      return
    }

    if (response.statusCode != 200) {
      callback(new Error(`got ${response.statusCode} from with body: ${body}`));
      return
    }

    parseString(body, (error, result) => {
      if (error) {
        callback(error);
        return
      }

      callback(null, result)
    });
  })

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
