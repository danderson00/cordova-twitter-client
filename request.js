var stringify = require('querystring').stringify

module.exports = function (config, sign, token) {
  return function (options, method) {
    var url, body

    if(typeof options === 'string') {
      method = method || 'GET'
      url = 'https://api.twitter.com/1.1/' + options

    } else {
      method = options.method || 'GET'
      url = 'https://api.twitter.com/1.1/' + options.endpoint

      if(options.parameters) {
        if(options.parameterType === 'form') {
          body = objectToFormData(options.parameters)
        } else {
          url += '?' + stringify(options.parameters)
        }
      }
    }

    var headers = sign({ url: url, method: method }, token)

    return fetch(url, { method: method, headers: headers, body: body }).then(function(response) {
      if(response.status === 200)
        return response.json()

      return response.text().then(function (error) {
        throw new Error('Unable to request from Twitter API: ' + error)
      })
    })
  }
}

function objectToFormData(source) {
  return Object.keys(source).reduce(function(result, property) {
    result.append(property, source[property])
    return result
  }, new FormData())
}