var login = require('./login')
var sign = require('./sign')
var request = require('./request')
var upload = require('./upload')
var middleware = require('./middleware')

module.exports = function (config) {
  if(!config)
    throw new Error('No configuration supplied')

  config.fetch = config.fetch || (typeof fetch !== 'undefined' && fetch)

  if(!config.fetch)
    throw new Error('No fetch implementation specified')

  var signer = sign(config)
  
  return {
    login: function () {
      return login(config, signer).cordova().then(constructApi)
    },
    fromToken: constructApi,
    middleware: middleware(config, signer)
  }

  function constructApi(token) {
    var executeRequest = request(config, signer, token)
    return {
      request: executeRequest,
      upload: upload(executeRequest),
      token: token,
      sign: signer
    }
  }
}