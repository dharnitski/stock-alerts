'use strict';

// import fetch from 'node-fetch';

const fetch = require('node-fetch');
const transform = require('./transform').transform;
const persist = require('../service/dynamodb').persist;
const iot = require('../service/iot');

module.exports.handler = async (event) => {
  // const url = "https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts&haltdate=03282018";
  const url = 'https://www.nasdaqtrader.com/rss.aspx?feed=tradehalts';

  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`got ${res.status} from with body: ${body}`);
  }
  const transformed = await transform(body);
  const persisted = await persist(transformed.channel.items);

  const messages = persisted
    .filter((element) => element.status === 'add')
    .map((element) => iot.handler(element));

  await Promise.all(messages);

  if (process.env.DEBUG_IOT) {
    // debug - send test message for every tick
    const message = {
      status: 'debug',
      data: {
        'symbol': 'DEBUG',
        'name': 'NAME',
        'reasonCode': 'T3',
        'market': 'NYSE',
        'haltTime': new Date().toISOString(),
      },
    };
    await iot.handler(message);
    console.debug(message);
  }

  return persisted;
};


