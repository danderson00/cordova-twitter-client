const OAuth = require('oauth-1.0a')
const crypto = require('crypto')

module.exports = function (config) {
  const oauth = OAuth({
    consumer: { key: config.consumerKey, secret: config.consumerSecret },
    signature_method: 'HMAC-SHA1',
    hash_function: function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64')
    }
  })

  return function (request, token) {
    return oauth.toHeader(oauth.authorize(request, token))
  }
}