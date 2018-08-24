let request = require('request')

module.exports = function(req, res) {
  let options = {
    method: 'POST',
    url: 'https://mydemo.vhx.tv/LOGIN',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: {
      email: req.body.email,
      password: req.body.password,
      client_id:
        '36c626548a36c62ec32e656addee067cb44ab04fa61ab98bed43da2242f7aba3',
      client_secret:
        '8b136880d1eacf81bce0bce316d3be4f014eb8150907ab812268384ba0445bd3'
    },
    json: true
  }
  request(options, function(error, response, body) {
    if (error) throw new Error(error)
    let customerID = response.headers['x-user-id']
    // console.log('headers', response.headers)
    console.log('signin body', body)
    // let data = JSON.parse(body)
    res.redirect('/ottprofile?customerID=' + customerID)
  })
}
