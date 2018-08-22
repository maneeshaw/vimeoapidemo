let http = require('https')

module.exports = function(req, res) {
  let options = {
    method: 'POST',
    hostname: 'mydemo.vhx.tv',
    path: 'LOGIN',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic dUpYUjJwR0h2MUVwV2J4S21lWU02QWtUQ0trUloxblI6Og==',
      'Cache-Control': 'no-cache'
    }
  }
  let reqVHX = http.request(options, function(resVHX) {
    let chunks = []
    resVHX.on('data', function(chunk) {
      chunks.push(chunk)
    })
    resVHX.on('end', function() {
      let body = Buffer.concat(chunks)
      console.log(body.toString())
    })
  })
  reqVHX.write(
    JSON.stringify({
      email: reqVHX.body.email,
      password: reqVHX.body.password,
      client_id:
        '36c626548a36c62ec32e656addee067cb44ab04fa61ab98bed43da2242f7aba3',
      client_secret:
        '8b136880d1eacf81bce0bce316d3be4f014eb8150907ab812268384ba0445bd3'
    })
  )
  reqVHX.end()
  res.redirect('/profile')
}
