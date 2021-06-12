const debug = require('debug')('module:http')
const axios = require('axios')

module.exports = function (url, method, headers, body) {
  debug('===// API CALL //===')
  debug('url:', url)
  debug('method:', method)
  debug('headers:', JSON.stringify(headers))
  debug('body:', JSON.stringify(body))

  const request = {
    url: url,
    method: method,
    headers: headers,
    body: body
  }

  return axios({
    method: method,
    url: url,
    data: body,
    headers: headers
  }).then(function (res) {
    debug('Axios Response', JSON.stringify(res.data))

    return Promise.resolve({
      headers: res.headers,
      data: res.data,
      status: res.status,
      request: request
    })
  })
}
