const fetch = require('node-fetch')
const express = require('express')
const app = express()

const twitter = require('../src')
const config = {
  "fetch": fetch,
  "callbackUrl": "http://localhost:8000/twitter/callback",
  "consumerKey": "",
  "consumerSecret": "",
  "accessToken": "",
  "accessTokenSecret": ""
}

app.use(twitter(config).middleware)
app.use('/', express.static(__dirname + '/content'))
app.listen(8000, () => console.log('Listening on 8000...'))
