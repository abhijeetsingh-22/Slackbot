require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const getTweets = require('./src/tweetsScrapper');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/', async function (req, res) {
  if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    res.sendStatus(200);
    let url = req.body.response_url;
    request.post(url);
    const numt = +req.body.text || 20;
    const arr = await getTweets(numt);
    console.log('tweets array length', arr.length);
    var text = '';
    var txtLength = 0;

    arr.forEach(async (element, i) => {
      var reply = '';
      reply = element.replyTo.length > 0 ? 'Replying to' : '';
      for (var k = 0; k < element.replyTo.length; k++) {
        reply = reply + ' ' + element.replyTo[k] + ' ';
      }
      text =
        text +
        `(_${i + 1}_) *Elon Musk*\n _${element.time}_\n${reply} \n ${
          element.text
        }\n\n\n`;
      txtLength++;
    });

    var body = JSON.stringify({
      channel: req.body.channel_id,
      response_type: 'in_channel',
      text: text,
    });
    var options = {
      url: url,
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SLACK_AUTH_TOKEN}`,
      },
    };

    await request.post(options, function (error, response, body) {
      console.log(response.toJSON().body);
      res.json();
    });
  } else {
    res.json({ err: 'Unauthorized request ' });
  }
});

app.listen(process.env.PORT || PORT, () => {
  console.log('server running on prot ' + PORT);
});
