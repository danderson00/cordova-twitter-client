module.exports = function (config, sign, token) {
  return function (endpoint, method) {
    method = method || 'GET'
    var url = 'https://api.twitter.com/1.1/' + endpoint
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