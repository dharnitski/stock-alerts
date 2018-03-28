'use strict';
const parseString = require('xml2js').parseString;
const moment = require('moment');

function transform(response) {


    {/* <rss version="2.0" xmlns: ndaq="http://www.nasdaqtrader.com/">
    <channel>
        <title>NASDAQTrader.com</title>
        <link>http://www.nasdaqtrader.com</link>
        <description>NASDAQ Trade Halts</description>
        <copyright>Copyright 2018. All rights reserved.</copyright>
        <pubDate>Sat, 24 Mar 2018 15:37:29 GMT</pubDate>
        <ttl>1</ttl>
        <ndaq: numItems>1</ndaq: numItems>
            <item>
      <title>WG</title>
      <pubDate>Mon, 26 Mar 2018 04:00:00 GMT</pubDate>
      <ndaq:HaltDate>03/26/2018</ndaq:HaltDate>
      <ndaq:HaltTime>13:00:42</ndaq:HaltTime>
      <ndaq:IssueSymbol>WG</ndaq:IssueSymbol>
      <ndaq:IssueName>Willbros Group, Inc.</ndaq:IssueName>
      <ndaq:Market>NYSE</ndaq:Market>
      <ndaq:ReasonCode>T1</ndaq:ReasonCode>
      <ndaq:PauseThresholdPrice />
      <ndaq:ResumptionDate />
      <ndaq:ResumptionQuoteTime />
      <ndaq:ResumptionTradeTime />
      <description><![CDATA[<table width="100%" cellpadding="5"><tr><th align="left">Halt Date</th><th align="left">Halt Time</th><th align="left">Issue Symbol</th><th align="left">Issue Name</th><th align="left">Market</th><th align="left">Reason Code</th><th align="left">Pause Threshold Price</th><th align="left">Resumption Date</th><th align="left">Resumption Quote Time</th><th align="left">Resumption Trade Time</th></tr><tr><td valign="top">03/26/2018                    </td><td valign="top">13:00:42                      </td><td valign="top">WG</td><td valign="top">Willbros Group, Inc. </td><td valign="top">NYSE</td><td valign="top">T1</td><td valign="top"></td><td valign="top"></td><td valign="top"></td><td valign="top"></td></tr></table>]]></description>
    </item>
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
                items: items(channel.item)
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


// [ { title: [Array],
//     pubDate: [Array],
//     'ndaq:HaltDate': [Array],
//     'ndaq:HaltTime': [Array],
//     'ndaq:IssueSymbol': [Array],
//     'ndaq:IssueName': [Array],
//     'ndaq:Market': [Array],
//     'ndaq:ReasonCode': [Array],
//     'ndaq:PauseThresholdPrice': [Array],
//     'ndaq:ResumptionDate': [Array],
//     'ndaq:ResumptionQuoteTime': [Array],
//     'ndaq:ResumptionTradeTime': [Array],
//     description: [Array] },

{/* <item>
      <title>ABIL</title>
      <pubDate>Mon, 26 Mar 2018 04:00:00 GMT</pubDate>
      <ndaq:HaltDate>03/26/2018</ndaq:HaltDate>
      <ndaq:HaltTime>10:29:47</ndaq:HaltTime>
      <ndaq:IssueSymbol>ABIL</ndaq:IssueSymbol>
      <ndaq:IssueName>Ability Inc.</ndaq:IssueName>
      <ndaq:Market>NASDAQ</ndaq:Market>
      <ndaq:ReasonCode>LUDP</ndaq:ReasonCode>
      <ndaq:PauseThresholdPrice />
      <ndaq:ResumptionDate>03/26/2018</ndaq:ResumptionDate>
      <ndaq:ResumptionQuoteTime>10:29:47</ndaq:ResumptionQuoteTime>
      <ndaq:ResumptionTradeTime>10:34:47</ndaq:ResumptionTradeTime>
      <description><![CDATA[<table width="100%" cellpadding="5"><tr><th align="left">Halt Date</th><th align="left">Halt Time</th><th align="left">Issue Symbol</th><th align="left">Issue Name</th><th align="left">Market</th><th align="left">Reason Code</th><th align="left">Pause Threshold Price</th><th align="left">Resumption Date</th><th align="left">Resumption Quote Time</th><th align="left">Resumption Trade Time</th></tr><tr><td valign="top">03/26/2018                    </td><td valign="top">10:29:47                      </td><td valign="top">ABIL</td><td valign="top">Ability Inc.</td><td valign="top">NASDAQ</td><td valign="top">LUDP</td><td valign="top"></td><td valign="top">03/26/2018                    </td><td valign="top">10:29:47                      </td><td valign="top">10:34:47                      </td></tr></table>]]></description>
</item> */}
function items(from) {
    if (!from) {
        return []
    }

    return from.map(item => fromItem(item));
}

function fromItem(item) {
    const result = {
        symbol: item['ndaq:IssueSymbol'][0],
        name: item['ndaq:IssueName'][0],
        market: item['ndaq:Market'][0],
        reasonCode: item['ndaq:ReasonCode'][0],
        haltTime: parseTime(item['ndaq:HaltDate'][0] + ' ' + item['ndaq:HaltTime'][0]),
    }
    if (item['ndaq:ResumptionDate'][0]) {
        result.resumptionQuoteTime = parseTime(item['ndaq:ResumptionDate'][0] + ' ' + item['ndaq:ResumptionQuoteTime'][0]);
        result.resumptionTradeTime = parseTime(item['ndaq:ResumptionDate'][0] + ' ' + item['ndaq:ResumptionTradeTime'][0]);
    }

    return result
}

function parseTime(str) {
    // does not respect winter time
    // const str = item['ndaq:HaltDate'][0] +  ' ' + item['ndaq:HaltTime'][0] + ' -0500';
    // return moment(str, "MM/DD/YYYY HH:mm:ss Z");

    //ToDo: code uses local time and works only in EST timezone
    return moment(str, "MM/DD/YYYY HH:mm:ss");
}

module.exports = {
    transform: transform,
}