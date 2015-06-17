var app = angular.module("lightRail");

app.service('stripeService', function($http, $q) {
  this.updateSubscription = function(card) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/api/update/subscription/:subscriberID',
      data: {
        number: card.number,
        cvc: card.cvc,
        expirationMonth: card.expirationMonth,
        expirationYear: card.expirationYear
      }
    }).then(function(res) {
      deferred.resolve(res.data);
    }).catch(function(res) {
      deferred.reject(res.data);
    });
    return deferred.promise;
  };
});
