var login = require('./login')
var sign = require('./sign')
var request = require('./request')

module.exports = function (config) {
  var signer = sign(config)
  
  return {
    login: function () {
      return login(config, signer).then(function (token) {
        return {
          request: request(config, signer, token),
          token: token,
          sign: signer
        }
      })
    },
    fromToken: function (token) {
      return {
        request: request(config, signer, token),
        token: token,
        sign: signer
      }
    },
    sign: signer
  }
}