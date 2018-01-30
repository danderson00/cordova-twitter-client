var stringify = require('querystring').stringify

module.exports = function (config, sign, token) {
  return function (options, method) {
    var url

    if(typeof options === 'string') {
      method = method || 'GET'
      url = 'https://api.twitter.com/1.1/' + options

    } else {
      method = options.method || 'GET'
      url = 'https://api.twitter.com/1.1/' + options.endpoint
      if(options.parameters) {
        url += '?' + stringify(options.parameters)
      }
    }

    var headers = sign({ url: url, method: method }, token)

    return fetch(url, { method: method, headers: headers }).then(function(response) {
      if(response.status === 200)
        return response.json()

      return response.text().then(function (error) {
        throw new Error('Unable to request from Twitter API: ' + error)
      })
    })
  }
}