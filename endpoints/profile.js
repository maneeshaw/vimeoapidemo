let request = require('request')
let vhx = require('vhx')(process.env.VHX_API_KEY)

module.exports = (req, res) => {
  const customerurl = 'https://api.vhx.tv/videos/' + req.user.ottid

  vhx.customers.retrieve(customerurl, function(err, customer) {
    console.error(err)

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
      res.render('profile', {
        user: req.user,
        otturl,
        customer,
        watchlist: JSON.parse(body)._embedded.items
      })
    })
  })
}
