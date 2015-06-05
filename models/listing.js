var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var listingSchema = new Schema ({
  apartments: [{
    type: Schema.Types.ObjectId,
    ref: 'GeneralUser'
  }],
  hotels: [{
    type: Schema.Types.ObjectId,
    ref: 'GeneralUser'
  }],
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'GeneralUser'
  }],
  houses: [{
    type: Schema.Types.ObjectId,
    ref: 'GeneralUser'
  }],
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'GeneralUser'
  }]
});

mongoose.model('listing', listingSchema);
module.exports = listingSchema;







