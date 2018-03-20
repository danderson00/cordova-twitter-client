var loginModule = require('./login')

module.exports = function (config, sign) {
  var clientModule = require('./index')
  var login = loginModule(config, sign)

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
        res.redirect(config.appHandlerUrl + '?key=' + token.key + '&secret=' + token.secret)
      })
    }

    function callApi() {
      var endpoint = req.path.substring(req.path.indexOf('/twitter/api/') + 13)
      var client = clientModule(config)
      var api = client.fromToken({
        key: req.query.key,
        secret: req.query.secret
      })
      
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
    }
  }
}

function endsWith(source, query) {
  return source.substring(source.length - query.length) === query
}