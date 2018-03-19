var loginModule = require('./login')

module.exports = function (config, sign) {
  var login = loginModule(config, sign)

  return function (req, res, next) {
    if(endsWith(req.path, '/twitter/login')) {
      initiateLogin()
    } else if (endsWith(req.path, '/twitter/callback')) {
      handleCallback()
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
  }
}

function endsWith(source, query) {
  return source.substring(source.length - query.length) === query
}