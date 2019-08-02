'use strict';

// Declare app level module which depends on views, and components
angular.module('curve', [
  'ngRoute',
  'curve.dashboard'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/viewDashboard'});
}]).
factory('setupService', function() {
  var setupData = {
    pi: Math.PI,
    items: [
        {
            name: "Feature 1",
            ten: 12,
            fifty: 17,
            ninety: 20
        },
        {
            name: "Feature 2",
            ten: 10,
            fifty: 11,
            ninety: 14
        },
        {
            name: "Feature 3",
            ten: 8,
            fifty: 12,
            ninety: 16
        },
        {
            name: "Feature 4",
            ten: 14,
            fifty: 17,
            ninety: 21
        }
    ],
    units: "Team weeks"
  };

  var getData = function() {
    return setupData;
  }

  return {
    getData: getData
  };

});
