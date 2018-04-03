var loginModule = require('./login')
var url = require('url')

var keyCookieName = 'CORDOVA-TWITTER-CLIENT-KEY'
var secretCookieName = 'CORDOVA-TWITTER-CLIENT-SECRET'

module.exports = function (config, sign) {
  var clientModule = require('./index')
  var login = loginModule(config, sign)
  var appHandlerUrl = config.appHandlerUrl ? url.parse(config.appHandlerUrl) : url.parse('/')

  return function (req, res, next) {
    if(endsWith(req.path, '/twitter/login')) {
      initiateLogin()
    } else if (endsWith(req.path, '/twitter/callback')) {
      handleCallback()
    } else if (req.path.indexOf('/twitter/api/') > -1) {
      callApi()
    } else {
      next()
    }

    function initiateLogin() {
      login.obtainRequestToken()
        .then(function (token) {
          res.redirect('https://api.twitter.com/oauth/authenticate?' + token)
        })
    }

    function handleCallback() {      
      login.obtainAccessToken({
        oauth_token: req.query.oauth_token,
        oauth_verifier: req.query.oauth_verifier
      }).then(function (token) {
        var query = 
          (appHandlerUrl.search ? (appHandlerUrl.search + '&') : '') + 
          (config.cookies === false ? ('key=' + token.key + '&secret=' + token.secret) : '')

        if(config.cookies !== false) {
          res.cookie(keyCookieName, token.key)
          res.cookie(secretCookieName, token.secret)
        }

        res.redirect(url.format({
          protocol: appHandlerUrl.protocol,
          domain: appHandlerUrl.domain,
          pathname: appHandlerUrl.pathname,
          search: query,
          hash: appHandlerUrl.hash
        }))
      })
    }

    function callApi() {
      var endpoint = req.path.substring(req.path.indexOf('/twitter/api/') + 13)
      var client = clientModule(config)
      var api = client.fromToken(token())
      
      api.request.execute({
        method: req.method,
        endpoint: endpoint + '?' + querystring()
      }).then(function (response) {
        res.status(response.status)
        response.body.pipe(res)
      }).catch(function (error) {
        console.error('An error occurred requesting from twitter API:', error)
        res.status(500).send('An error occurred')
      })

      function querystring() {
        return Object.keys(req.query).reduce(function (querystring, key) {
          return (key === 'key' || key === 'secret') 
            ? querystring
            : querystring.concat(key + '=' + req.query[key])
        }, []).join('&')
      }

      function token() {
        return {
          key: req.cookies[keyCookieName] || req.query.key,
          secret: req.cookies[secretCookieName] || req.query.secret
        }
      }
    }
  }
}

function endsWith(source, query) {
  return source.substring(source.length - query.length) === query
}