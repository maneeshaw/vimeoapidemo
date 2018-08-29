let request = require('request')
const API_SECRET = process.env.LIVESTREAM_API_SECRET

let livedata

module.exports = function(req, res) {
  let options = {
    url:
      'https://livestreamapis.com/v3/accounts/27551527/events/8341479/videos',
    auth: {
      username: API_SECRET
    }
  }
  request.get(options, function(err, response, body) {
    if (err) {
      console.error('livestream api call failed ', err)
      return res.send(err)
    }
    // res.setHeader('Content-Type', 'application/json')
    livedata = Object.assign({}, body)
    res.render('live', livedata)
  })
}
