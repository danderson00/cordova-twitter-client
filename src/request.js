var stringify = require('querystring').stringify

module.exports = function (config, sign, token) {
  var executeAndParse = function (options, method) {
    return executeRequest(options, method).then(function(response) {
      if(response.status >= 200 && response.status < 300)
        return response.text().then(function (text) {
          if(text)
            return JSON.parse(text)
        })

      return response.text().then(function (error) {
        throw new Error('Unable to request from Twitter API: ' + error)
      })
    })
  }

  var executeRequest = function (options, method) {
    var url, body, domain = options.domain || 'api.twitter.com'

    if(typeof options === 'string') {
      method = method || 'GET'
      url = 'https://' + domain + '/1.1/' + options

    } else {
      method = options.method || 'GET'
      url = 'https://' + domain + '/1.1/' + options.endpoint

      if(options.parameters) {
        if(options.parameterType === 'form') {
          body = objectToFormData(options.parameters)
        } else {
          url += '?' + stringify(options.parameters)
        }
      }
    }

    var headers = sign({ url: url, method: method }, token)

    return config.fetch(url, { method: method, headers: headers, body: body })
  }

  executeAndParse.execute = executeRequest
  return executeAndParse
}

function objectToFormData(source) {
  return Object.keys(source).reduce(function(result, property) {
    result.append(property, source[property])
    return result
  }, new FormData())
}