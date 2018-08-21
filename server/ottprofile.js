let vhx = require('vhx')(process.env.VHX_API_KEY)

export default function(req, res) {
  let customerId = req.query.customerId
  let url = 'https://api.vhx.tv/customers/' + customerId
  vhx.customers.retrieve(url, function(err, customer) {
    console.error(err)
    req.session.customer_href = 'https://api.vhx.tv/customers/' + customerId
    res.render('ottprofile', { user: customer })
  })
  console.log(req.body)
}
