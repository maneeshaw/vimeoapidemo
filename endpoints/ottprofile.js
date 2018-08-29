let vhx = require('vhx')(process.env.VHX_API_KEY)
let request = require('request')

module.exports = function(req, res) {
  let customerID = req.query.customerID
  let url = 'https://api.vhx.tv/customers/' + customerID
  vhx.customers.retrieve(url, function(err, customer) {
    if (err || !customer) {
      return res.send('login failed. please try again')
    }
    const otturl = customer._embedded.products[0]._links.browse_page.href
    let watchlistRequest = {
      method: 'GET',
      url: 'https://api.vhx.tv/customers/4597383/watchlist',
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: 'Basic dUpYUjJwR0h2MUVwV2J4S21lWU02QWtUQ0trUloxblI6Og=='
      }
    }
    request(watchlistRequest, function(error, response, body) {
      if (error) throw new Error(error)
      res.render('ottprofile', {
        user: customer,
        otturl,
        customer,
        watchlist: JSON.parse(body)._embedded.items
      })
    })
    console.error(err)
    req.session.customer_href = 'https://api.vhx.tv/customers/' + customerID
  })
}
