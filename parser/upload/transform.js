'use strict';
const parseString = require('xml2js').parseString;

function transform(response) {


    {/* <rss version="2.0" xmlns: ndaq="http://www.nasdaqtrader.com/">
    <channel>
        <title>NASDAQTrader.com</title>
        <link>http://www.nasdaqtrader.com</link>
        <description>NASDAQ Trade Halts</description>
        <copyright>Copyright 2018. All rights reserved.</copyright>
        <pubDate>Sat, 24 Mar 2018 15:37:29 GMT</pubDate>
        <ttl>1</ttl>
        <ndaq: numItems>0</ndaq: numItems>
  </channel>
</rss > */}

    return toJs(response).then(data => {
        const channel = data.rss.channel[0]
        return {
            channel: {
                title: channel.title[0],
                link: channel.link[0],
                description: channel.description[0],
                pubDate: new Date(channel.pubDate[0]),
                numItems: parseInt(channel['ndaq:numItems'][0]),
            }
        }
    })
}

function toJs(response) {
    return new Promise((resolve, reject) => {
        parseString(response, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    transform: transform,
}