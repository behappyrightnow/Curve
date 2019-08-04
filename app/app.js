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
    startDate: new Date(2019,9,21),
    pi: Math.PI,
    items: [
       {
          "name":"Users persist",
          "ten":1,
          "fifty":2,
          "ninety":3
       },
       {
          "name":"Matters by recency",
          "ten":2,
          "fifty":3,
          "ninety":5
       },
       {
          "name":"Client Matters List by recency",
          "ten":4,
          "fifty":8,
          "ninety":14
       },
       {
          "name":"Group Incomplete Entries",
          "ten":4,
          "fifty":8,
          "ninety":12
       },
       {
          "name":"No Internet Notification",
          "ten":3,
          "fifty":5,
          "ninety":10
       },
       {
          "name":"Larger Clicking Targets",
          "ten":2,
          "fifty":3,
          "ninety":5
       },
       {
          "name":"PTA Code",
          "ten":1,
          "fifty":2,
          "ninety":3
       },
       {
          "name":"Stretch",
          "ten":4,
          "fifty":6,
          "ninety":10
       },
       {
          "name":"Undo Release",
          "ten":5,
          "fifty":9,
          "ninety":13,
          "editing":true
       },
       {
          "name":"Explainable AI",
          "ten":5,
          "fifty":10,
          "ninety":17
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
