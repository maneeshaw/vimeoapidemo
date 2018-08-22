require('./babel-register')
require('dotenv').load()

// endpoints
let ottSignin = require('./endpoints/ottsignin')
let ottProfile = require('./endpoints/ottprofile')
let watchVideo = require('./endpoints/watchvideo')
let profile = require('./endpoints/profile')

let express = require('express')
let passport = require('passport')
let Strategy = require('passport-local').Strategy
let db = require('./db')
let session = require('express-session')
let cookie = require('cookie-parser')
let parser = require('body-parser')
// let async = require('async')
let vhx = require('vhx')(process.env.VHX_API_KEY)

const uuid = require('uuid')

const app = express()

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */

app.use(require('morgan')('combined'))
app.use(require('cookie-parser')())
app.use(parser.urlencoded({ extended: true }))
app.use(
  require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
)

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(express.static('public'))

/** bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(parser.json())

passport.use(
  new Strategy(function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return cb(err)
      }
      if (!user) {
        return cb(null, false)
      }
      if (user.password !== password) {
        return cb(null, false)
      }
      return cb(null, user)
    })
  })
)

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) {
      return cb(err)
    }
    cb(null, user)
  })
})

/* Express App - Session
..............................*/
app.use(cookie())
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    genid: function() {
      return uuid.v4()
    },
    secret: process.env.SESSION_SECRET
  })
)

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize())
app.use(passport.session())

// Define routes.

const SUBSCRIBERS = 71341
const REGISTERED = 69075
const PUBLIC = 69078

const homepageCollections = [SUBSCRIBERS, REGISTERED, PUBLIC]
let homeData
app.get('/', async function(req, res) {
  if (homeData) {
    return res.render('home', homeData)
  }
  let collections = await new Promise((res, rej) => {
    vhx.collections.all({}, function(err, collections) {
      console.error(err)
      res(collections._embedded.collections)
    })
  })
  collections = collections.filter(c => homepageCollections.includes(c.id))
  let collectionIdxs = []
  let items = []

  await new Promise((res2, rej) => {
    collections.forEach(async (collection, i) => {
      let item = await new Promise((res, rej) => {
        vhx.collections.items({ collection: collection.id }, (err, items) => {
          console.error(err)
          res(items._embedded.items)
        })
      })

      collectionIdxs.push(i)
      items.push(item)
      if (collectionIdxs.length === collections.length) res2()
    })
  })

  let carousel
  items.forEach((itemsData, i) => {
    let collection = collections[collectionIdxs[i]]
    if (collection.id === PUBLIC) {
      carousel = itemsData
    }
    collection.items = itemsData
  })

  homeData = {
    user: req.user,
    collections,
    carousel: carousel,
    session: req.session
  }
  console.log(homeData.user)
  res.render('home', homeData)
})

app.get('/carouselplayer', function(req, res) {
  const url = 'https://api.vhx.tv/videos/' + req.query.id
  vhx.videos.retrieve(url, function(err, video) {
    console.error(err)
    res.render('carouselplayer', {
      carouselitemid: req.query.id,
      carouselitemname: video.title,
      carouselitemdescription: video.description
    })
  })
})

app.get('/login', function(req, res) {
  res.render('login')
})

app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/profile')
  }
)

app.get('/signup', function(req, res) {
  res.send('signup')
})

app.post('/signup', function(req, res) {
  console.log(req.body)
  let redirect = req.body.redirect ? req.body.redirect : '/'
  if (req.body.customer) {
    console.log(req.body)
    vhx.customers.create(
      {
        name: req.body.customer.name,
        email: req.body.customer.email,
        product: 'https://api.vhx.tv/products/35191'
      },
      function(err, customer) {
        console.error(err)
        req.session.customer_href =
          'https://api.vhx.tv/customers/' + customer.id
        res.redirect(redirect)
      }
    )
  }
})

app.get('/subscribe', function(req, res) {
  res.render('subscribe')
})

// app.get('/collections', function(req, res) {
//   res.render('collections')
// })

app.post('/ottsignin', ottSignin)

app.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), profile)

app.get('/ottprofile', ottProfile)

app.get('/userauth', function(req, res) {
  res.render('userauth')
})

app.get('/items.json', function(req, res) {
  vhx.collections.items(
    {
      collection: req.query.id
    },
    function(err, items) {
      console.error(err)
      res.render('/', {
        // partial: 'home/items',
        data: {
          items: items._embedded.items
        }
      })
    }
  )
})

app.get('/watch/:video_id', watchVideo)

console.log('App is ready!')
app.listen(3000)
