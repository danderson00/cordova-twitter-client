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
    var url, querystring, body, domain = options.domain || 'api.twitter.com'

    if(typeof options === 'string') {
      method = method || 'GET'
      url = config.browser
        ? '/twitter/api/' + options
        : 'https://' + domain + '/1.1/' + options
    } else {
      method = options.method || 'GET'
      url = config.browser
        ? '/twitter/api/' + options.endpoint
        : 'https://' + domain + '/1.1/' + options.endpoint
    }

    if(options.parameters) {
      if(options.parameterType === 'form') {
        body = objectToFormData(options.parameters)
      } else {
        querystring = querystring
          ? querystring + '&' + stringify(options.parameters)
          : stringify(options.parameters)
      }
    }

    if(config.browser && token) {
      var tokenString = 'key=' + token.key + '&secret=' + token.secret
      querystring = querystring
        ? querystring + '&' + tokenString
        : tokenString
    }

    var finalUrl = querystring
      ? url + (urlContainsQuery(url) ? '&' : '?') + querystring
      : url

    var headers = config.browser ? undefined : sign({ url: finalUrl, method: method }, token)

    return (config.fetch || fetch)(finalUrl, { method: method, headers: headers, body: body, credentials: 'same-origin' })
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

function urlContainsQuery(url) {
  return url.indexOf('?') > -1
}