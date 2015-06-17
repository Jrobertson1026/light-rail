//*** DEPENDENCIES ***//
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var env = require('dotenv').load();
var flash = require('express-flash')

//*** CONTROLLERS ***//
var UserCtrl = require('./controllers/UserCtrl.js');
var SubscriberCtrl = require('./controllers/SubscriberCtrl.js');
var AdminCtrl = require('./controllers/AdminCtrl.js');

//*** MODELS ***//
var User = require('./models/User.js');
var Subscriber = require('./models/Subscriber.js');
var Admin = require('./models/Admin.js');

/*Stripe Variables*/
var PLATFORM_SECRET_KEY = process.env.PLATFORM_SECRET_KEY;
var PLATFORM_PUBLISHABLE_KEY = process.env.PLATFORM_PUBLISHABLE_KEY;

var stripe = require('stripe')(PLATFORM_SECRET_KEY);
stripe.accounts.create({
  country: "US",

});


//var stripeToken = req.body.stripeToken;

var charge = stripe.charges.create({
  amount: 800,
  currency: "usd",
  //source: stripeToken,
  description: "Example Charge"
}, function(err, charge) {
  if (err && err.type === "StripeCardError") {
    alert("card has been declined")
  }
});

// var customerId = getStripeCustomerId(user);

var stripeOptions = {
  apiKey: PLATFORM_SECRET_KEY || '',
  stripePubKey: PLATFORM_PUBLISHABLE_KEY || '',
  defaultPlan: 'free',
  plans: ['free', '1_listings_Yr', '1_listing_Month'],
  planData: {
    'free': {
      name: 'Free',
      price: 0
    },
    '1_listings_Yr': {
      name: '1_listings_Yr',
      price: 800
    },
    '1_listing_Month': {
      name: '1_listing_Month',
      price: 80
    },
  }
}


//*** EXPRESS ***//
var app = express();

//*** MIDDLEWARE ***//
app.use(session({
  secret: 'lightRail devs are awesome',
  saveUninitialized: true,
  resave: true
}));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());



//Passport Strategy
passport.use('user-local', new LocalStrategy({
  usernameField: 'email'
}, function(email, password, done) {
  //define how to match user credentials to db values
  User.findOne({
    email: email
  }, function(err, user) {
    console.log("test 1");
    if (err) {
      return done(new Error('This user does not exist'));
    }
    if (user) {
      if (!user.verifyPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      console.log("user found", user);
      return done(null, user);
    }
  })
}));
passport.use('subscriber-local', new LocalStrategy({
  usernameField: 'email'
}, function(email, password, done) {
  Subscriber.findOne({
    email: email
  }, function(err, subscriber) {
    console.log('test 2');
    if (err) {
      return done(err);
    }
    if (!subscriber) {
      return done(null, false, {
        message: 'Incorrect email.'
      });
    }
    if (!subscriber.verifyPassword(password)) {
      return done(null, false, {
        message: 'Incorrect password.'
      });
    }
    console.log("subscriber found", subscriber);
    return done(null, subscriber);
  });
}));

passport.use('admin-local', new LocalStrategy({
  usernameField: 'email'
}, function(email, password, done) {
  Admin.findOne({
    email: email
  }, function(err, admin) {
    if (err) {
      return done(err);
    }
    if (!admin) {
      return done(null, false, {
        message: 'Incorrect email.'
      });
    }
    if (!admin.verifyPassword(password)) {
      return done(null, false, {
        message: 'Incorrect password.'
      });
    }
    console.log("adminfound", admin);
    return done(null, admin);
  });
}));


passport.serializeUser(function(user, done) {
  done(null, user._id)
});


passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if (err) done(err);
    if (user) {
      done(null, user);
    } else if (!user) {
      Subscriber.findById(id, function(err, user) {
        if (err) done(err);
        done(null, user);
      })
    } else {
      Admin.findById(id, function(err, user) {
        if (err) done(err);
        done(null, user);
      })
    }
  })
});

var isAuthed = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(403).end();
  }
  return next();
}


//*** ENDPOINTS ****//

//** General User **//
app.post('/api/register/user', UserCtrl.createUser);
app.post('/api/login/user', passport.authenticate('user-local', {
  failureRedirect: '/login/user'
}), UserCtrl.loginUser);
app.get('/api/user/isLoggedIn', UserCtrl.isLoggedIn);

//** Subscriber ** //

app.post('/api/register/subscriber', SubscriberCtrl.createSubscriber);
app.post('/api/login/subscriber', passport.authenticate('subscriber-local', {
  failureRedirect: '/login/subscriber'
}), SubscriberCtrl.loginSubscriber);
app.get('/api/subscriber/isLoggedIn', SubscriberCtrl.isLoggedIn);


//** Admin ** //

app.post('/api/register/admin', AdminCtrl.createAdmin);
app.post('/api/login/admin', passport.authenticate('admin-local', {
  failureRedirect: '/login/admin'
}), AdminCtrl.loginAdmin);
app.get('/api/admin/isLoggedIn', AdminCtrl.isLoggedIn);



//** Stripe ** //

/*
//allows you to save the subscribers cards set this up under user endpoint
stripe.customers.create({
  source: stripeToken,
  description: "payinguser@example.com",
}).then(function(customer) {
  return stripe.charges.create({
    amount: 800000, // amount in cents
    currency: "usd",
    customer: customer.id
  });
}).then(function(charge) {
  saveStripeCustomerId(user, charge.customer);
});


// creates a new subscription set this up under user endpoint
stripe.plans.create({
  amount: 800000,
  interval: "year",
  name: "Yearly Apartment Subscription",
  currency: 'usd',
  id: 'yrlyAptSub'
}, function(err, plan) {
  // async call
});


//subscribes a customer to a plan set this up under user endpoint

stripe.customers.create({
  source: stripeToken,
  plan: 'yrlAptSub',
  email: 'payinguser@example.com'
}, function(err, customer) {
     // async call here
});*/







// Connections
var port = 9001;
var mongoUri = 'mongodb://localhost:27017/lightRail';

mongoose.connect(mongoUri);
mongoose.connection.once('open', function() {
  console.log('Connected to MongoDB at ', mongoUri);
});

app.listen(port, function() {
  console.log('Listening on port ', port);
});
