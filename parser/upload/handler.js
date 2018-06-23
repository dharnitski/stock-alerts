'use strict';

// import fetch from 'node-fetch';

const fetch = require('node-fetch');
const transform = require('./transform').transform;
const persist = require('../service/dynamodb').persist;

module.exports.handler = async (event) => {
  // const url = "https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts&haltdate=03282018";
  const url = 'https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts';

  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`got ${res.status} from with body: ${body}`);
  }
  const transformed = await transform(body);
  return await persist(transformed.channel.items);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
