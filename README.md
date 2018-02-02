# cordova-twitter-client

A simple, promise based twitter client for Apache Cordova that vastly simplifies interactions with the Twitter API.

You should be aware that this embeds your Twitter application secrets in your cordova app.

## Installation

    npm i --save cordova-twitter-client

If the InAppBrowser plugin is not already installed:

    cordova plugin add cordova-plugin-inappbrowser

## Usage

```Javascript
const twitter = require('cordova-twitter-client')

const config = {
  callbackUrl: '<CALLBACK_URL>',
  consumerKey: '<CONSUMER_KEY>',
  consumerSecret: '<CONSUMER_SECRET>',
  accessToken: '<ACCESS_TOKEN>',
  accessTokenSecret: '<ACCESS_TOKEN_SECRET>',
}

document.addEventListener('deviceready', onDeviceReady, false)

function onDeviceReady() {
  twitter(config).login()
    .then(api => api.request('statuses/user_timeline.json?screen_name=danderson00&count=20' /*, 'GET' */))
    .then(results => writeToDocument(results.map(x => x.text).join('\n')))
    .catch(error => writeToDocument(error.message))

  function writeToDocument(text) {
    const element = document.createElement('span')
    element.innerText = text
    document.body.appendChild(element)
  }
}
```

You can also pass an options object:

```Javascript
api.request({
  endpoint: 'statuses/update.json',
  method: 'POST',
  parameters: {
    status: 'A tweet from the API!'
  }
})
```

Or create a client from a stored token:

```Javascript
import { storeToken } from 'some-storage-mechanism'

twitter(config).login()
  .then(({ token }) => storeToken(token))
```

```Javascript
import { retrieveToken } from 'some-storage-mechanism'

const api = twitter(config).fromToken(retrieveToken())
api.request({ /* ... */ })
```