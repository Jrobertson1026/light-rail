var stripe = require('../controllers/StripeCtrl');
var PLATFORM_SECRET_KEY = process.env.PLATFORM_SECRET_KEY;
var PLATFORM_PUBLISHABLE_KEY = process.env.PLATFORM_PUBLISHABLE_KEY;
//var stripeToken = req.body.stripeToken;


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


module.exports = {

  createCustomer: function(cb) {
    var user = this;

    stripe.customers.create({
      email: user.email
    }, function(err, customer) {
      if (err) return cb(err);
      user.stripe.customerId = customer.id;
      user.save(function(err) {
        if (err) return cb(err);
        return cb(null);
      });
    });
  }

};
