var Subscriber = require('../models/Subscriber');
var PLATFORM_SECRET_KEY = process.env.PLATFORM_SECRET_KEY;
var stripe = require('stripe')(PLATFORM_SECRET_KEY)
var Apartment = require('../models/Apartment');


module.exports = {

  createSubscriber: function(req, res) {
    stripe.customers.create({
      source: token, // obtained with Stripe.js
      plan: "free",
      email: req.body.email
    }, function(err, customer) {
      console.log(customer);
      var obj = {};
      /*var newSubscriber = new Subscriber(req.body);
newSubscriber.save(function(err, result) {
  console.log('err: ', err);

  if (err) {
    if (err.code === 500) return res.status(500).json(err);
    if (err.code === 11000) return res.status(11000).json(err);
  }
});
res.send(result);
*/
    });
  },

  loginSubscriber: function(req, res) {
    return res.json({
      loggedIn: true
    });
    return res.json(req.user);
  },

  isLoggedIn: function(req, res) {
    if (req.isAuthenticated()) {
      return res.status(200).json(req.user);
    } else {
      return res.status(204).json('Not Authenticated')
    }
  },

  getListings: function(req, res) {
    Apartment.find({
        subscriber_id: req.query.id
      })
      .exec(function(err, apartments) {
        if (!err) {
          return res.status(200).json(apartments);
        }

        return res.status(500).json(err);
      })
  },

  addListing: function(req, res) {
    var apartment = new Apartment(req.body);
    // apartment.subscriber_id = req.user._id
    apartment.save(function(err, apartment) {
      if (err) {
        if (err.code === 500) return res.status(500).json(err);
        if (err.code === 11000) return res.status(11000).json(err);
      }

      res.status(200).json(apartment);
    });
  }

};
