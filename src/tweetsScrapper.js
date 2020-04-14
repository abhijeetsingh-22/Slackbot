const request = require('request-promise');

const cheerio = require('cheerio');
const json2csv = require('json2csv').Parser;
const fs = require('fs');
var url = 'https://mobile.twitter.com/elonmusk';
var tweets = [];

async function getTweets(REQ_NUM = 10) {
  console.log('about to send request', REQ_NUM);
  while (tweets.length < REQ_NUM) {
    var options = {
      method: 'GET',
      url: url,
      headers: {
        Referer: 'https://www.google.com/',
        Cookie: process.env.TWITTER_COOKIES,
      },
    };
    const response = await request(options);
    let $ = cheerio.load(response);
    let tw = $('tbody');
    tw.each((i, e) => {
      const time = $(e)
        .children('tr.tweet-header')
        .children('td.timestamp')
        .children('a')
        .text()
        .trim();

      const tbody = $(e).children('tr.tweet-container').children('td');
      const replyTo = [];

      $(tbody)
        .children('div.tweet-reply-context.username')
        .children('a')
        .each((i, rp) => {
          replyTo.push($(rp).text().trim());
        });
      const text = $(tbody)
        .children('div.tweet-text')
        .children('div')
        .text()
        .trim();
      if (tweets.length < REQ_NUM && text) tweets.push({ text, replyTo, time });
    });
    url = `https://mobile.twitter.com/${$(
      '#main_content > div.timeline > div > a'
    ).attr('href')}`;
  }

  const j2cp = new json2csv();
  const csv = j2cp.parse(tweets);
  console.log('No of Tweets Scrapped', tweets.length);
  fs.writeFileSync('./tweets.csv', csv, 'utf-8');
  return tweets;
}

module.exports = getTweets;
