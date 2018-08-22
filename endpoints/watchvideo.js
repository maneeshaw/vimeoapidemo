let vhx = require('vhx')(process.env.VHX_API_KEY)

module.exports = function(req, res) {
  const url = 'https://api.vhx.tv/videos/' + req.params.video_id
  console.log(url)
  vhx.videos.retrieve(url, function(err, video) {
    console.error(err)
    if (!video || !video.id) {
      res.send('Not Found')
      return
    }
    if (video.plans.includes('public')) {
      res.render('publicplayer', {
        itemid: video.id,
        itemname: video.title,
        itemdescription: video.description
      })
      return
    }
    if (!video.plans.includes('public')) {
      vhx.authorizations.create(
        {
          customer: req.session.customer_href,
          video: 'https://api.vhx.tv/videos/' + video.id
        },
        function(err, authorization) {
          console.log('authorization', authorization)
          if (err) {
            res.render('watch/unauthorized')
          } else {
            res.render('watch/player', {
              authorization: authorization
            })
          }
        }
      )
    }
  })
  /* VHX > Authorize Customer
  .....................................
  a call to vhx.collections to get back our collection items
  http://dev.vhx.tv/docs/api/?javascript#authorizations-create
  ..................................... */
}
