const fetch = require('node-fetch')
const express = require('express')
const app = express()

const twitter = require('../src')
const config = {
  "fetch": fetch,
  "callbackUrl": "http://localhost:8000/twitter/callback",
  "appHandlerUrl": "/",
  "consumerKey": "U7wg9Z4MABJvD3x04c4zRdxLx",
  "consumerSecret": "5nHd7isp9OfN7qlkrpz0qEU5Y4embisXqIZ5x3aEhkpZxxIIBQ",
  "accessToken": "21739128-tXjUjOwcWuKKOhky69KkhcBPDUnMlofYJ4dMm6INb",
  "accessTokenSecret": "lK9fcqsE20WJPkiX4gdXythQQOV14nz6xVdmeHXSRdnny"
}

app.use(twitter(config).middleware)
app.use('/', express.static(__dirname + '/content'))
app.listen(8000, () => console.log('Listening on 8000...'))
