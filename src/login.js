var FormData = require('form-data')
var parse = require('querystring').parse

module.exports = function (config, sign) {
  return obtainRequestToken()
    .then(obtainVerifier)
    .then(obtainAccessToken)

  function obtainRequestToken() {
    let request = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: config.callbackUrl }
    }

    let token = {
      key: config.accessToken,
      secret: config.accessTokenSecret
    }

    let headers = sign(request, token)

    return config.fetch(request.url, {
      method: request.method,
      headers: headers
    })
    .then(function(response) {
      return response.text().then(function(text) {
        if(response.status !== 200)
          throw new Error('Could not obtain request token: ' + text)
        return text
      })
    })
  }

  function obtainVerifier(token) {
    return new Promise(function (resolve, reject) {
      var browser = cordova.InAppBrowser.open('https://api.twitter.com/oauth/authenticate?' + token, '_blank', 'location=no')

      browser.addEventListener('loadstart', completeAuthentication)
      browser.addEventListener('loaderror', completeAuthentication)
      
      function completeAuthentication(e) {
        if(e.url.indexOf(config.callbackUrl) === 0) {
          browser.close()          
          var result = parse(e.url.substring(config.callbackUrl.length + 1))

          if(result.denied)
            reject(new Error('Login denied'))
          else
            resolve(result)
        }
      }
    })
  }

  function obtainAccessToken(params) {
    request = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST'
    }

    var headers = sign(request, { key: params.oauth_token })

    var data = new FormData()
    data.append('oauth_verifier', params.oauth_verifier)

    return config.fetch(request.url, {
      method: request.method,
      headers: headers,
      body: data
    })
    .then(function(response) {
      return response.text().then(function(text) {
        if(response.status !== 200)
          throw new Error('Could not obtain access token: ' + text)

        var result = parse(text)        
        return {
          key: result.oauth_token,
          secret: result.oauth_token_secret
        }
      })
    })
  }
}