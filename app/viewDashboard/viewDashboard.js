'use strict';

angular.module('curve.dashboard', ['ngRoute', 'curve'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewDashboard', {
    templateUrl: 'viewDashboard/viewDashboard.html',
    controller: 'ViewDashboardCtrl'
  });
}])

.controller('ViewDashboardCtrl', ['$scope', '$http','setupService','$location',function($scope, $http, setupService, $location) {
    $scope.data = setupService.getData();
    $scope.data.items = $scope.data.items.map(function(item) {
        item["editing"] = false;
        return item;
    });
    var p = [0.1, 0.5, 0.9];
    function sum() {
        var aMatrix = [];
        var a1Vector = $scope.data.items.map(function(item) { return item.fifty; });
        var a2Vector = $scope.data.items.map(function(item) {
            return (1/2.0)* (1/(Math.log((1-p[0])/p[0])))*(item.ninety-item.ten);
        });
        var a3Vector = $scope.data.items.map(function(item) {
            return (1/((1-2*p[0])*(Math.log((1-p[0])/p[0]))))*(1-2*(item.fifty-item.ten)/(item.ninety-item.ten))*(item.ninety-item.ten);
        });
        var aMatrix = [a1Vector, a2Vector, a3Vector];
        var meanVector = a1Vector.map(function(a1, i) {
            return a1+a3Vector[i]/2;
        });
        var pi = $scope.data.pi;
        var piSquare = Math.pow(pi, 2);
        var varianceVector = a2Vector.map(function(a2, i) {
            var a2square = Math.pow(a2, 2);
            var a3square = Math.pow(a3Vector[i], 2);
            return (piSquare * a2square)/3 + a3square/12 + (piSquare*a3square)/36;
        });
        var skewnessVector = a2Vector.map(function(a2, i) {
            var a2square = Math.pow(a2, 2);
            var a3cube = Math.pow(a3Vector[i], 3);
            return piSquare * a2square * a3Vector[i] + (piSquare * a3cube) / 24;
        });
        var stdSkew = skewnessVector.map(function(skewness,i) {
            return skewness / Math.pow(varianceVector[i],3/2.0);
        });

        function reduceFunction(acc, item) {
            return acc+item;
        }
        var sumMean = meanVector.reduce(reduceFunction);
        var sumVariance = varianceVector.reduce(reduceFunction);
        var sumSkewness = skewnessVector.reduce(reduceFunction);
        var sumStdSkew = sumSkewness/Math.pow(sumVariance,3/2.0);
        var sumA3 = sumSkewness === 0 ? 0 : 2 * Math.sqrt(sumVariance/(3*(1/12.0+piSquare/72))) * Math.cos((Math.acos(-sumSkewness/(6*(1/12.0+piSquare/72.0))/Math.pow((sumVariance/(3*((1/12.0)+piSquare/72))),3/2))+4*pi)/3);
        var sumA2 = sumSkewness === 0 ? Math.sqrt(3 * sumVariance)/ pi : Math.sqrt(sumSkewness/(piSquare*sumA3)-Math.pow(sumA3,2)/24);
        var sumA1 = sumMean - sumA3 / 2;
        var sumVector = p.map(function(probability) {
            return sumA1+sumA2*Math.log(probability/(1-probability))+sumA3*(probability-0.5)* Math.log(p[0]/(1-probability));
        });
        return {
            name: 'Sum',
            ten:sumVector[0],
            fifty:sumVector[1],
            ninety:sumVector[2]
        }
    }

    function zip(arr1, arr2) {
        var arr3 = arr1.map(function(item) {
            return item;
        });
        for (var i=0;i<arr2.length;i++) {
            arr3.push(arr2[i]);
        }
        return arr3;
    }

    function draw() {
        $scope.sum = sum();
        var cdfSeries = zip($scope.data.items,[$scope.sum]).map(function(item,i) {
            var yVector = [];
            var sum = 0;
            for(var i=0;i<1000;i++) {
                yVector.push(i/1000);
            }
            return {
                name: item.name,
                data: yVector.map(function(y, j) {
                    return [j === 0? 0 :
                        Math.exp(Math.log(item.fifty)+(1/2)*(1/(Math.log((1-p[0])/p[0])))*Math.log((item.ninety)/(item.ten))*Math.log(y/(1-y))+(1/((1-2*p[0])*(Math.log((1-p[0])/p[0]))))*Math.log(((item.ninety)*(item.ten))/(Math.pow(item.fifty,2)))*(y-0.5)*Math.log(y/(1-y))),y];
                })
            };
        });
        var pdfSeries = zip($scope.data.items,[$scope.sum]).map(function(item,index) {
            var yVector = [];
            var sum = 0;
            for(var i=0;i<1000;i++) {
                yVector.push(i/1000);
            }
            return {
                name: item.name,
                data: yVector.map(function(y, j) {
                    return [cdfSeries[index].data[j][0], j === 0? 0 :
                        (1/((1/2)*(1/(Math.log((1-p[0])/p[0])))*Math.log((item.ninety)/(item.ten))/(y*(1-y))+(1/((1-2*p[0])*(Math.log((1-p[0])/p[0]))))*Math.log(((item.ninety)*(item.ten))/Math.pow(item.fifty,2))*((y-0.5)/(y*(1-y))+Math.log(y/(1-y)))))*Math.exp(-(Math.log(item.fifty)+(1/2)*(1/(Math.log((1-p[0])/p[0])))*Math.log((item.ninety)/(item.ten))*Math.log(y/(1-y))+(1/((1-2*p[0])*(Math.log((1-p[0])/p[0]))))*Math.log(((item.ninety)*(item.ten))/Math.pow(item.fifty,2))*(y-0.5)*Math.log(y/(1-y))))];
                })
            };
        });
        Highcharts.chart('pdf', {
            chart: {
                type: 'line',
                zoomType: 'xy'
            },
            title: {
                text: 'Probability Distribution Function'
            },
            subtitle: {
                text: 'Source: Input Features'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Team Weeks'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'PDF'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x} cm, {point.y} kg'
                    }
                }
            },
            series: pdfSeries
        });

        Highcharts.chart('cdf', {
            chart: {
                type: 'line',
                zoomType: 'xy'
            },
            title: {
                text: 'Cumulative Distribution Function'
            },
            subtitle: {
                text: 'Source: Input Features'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Team Weeks'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Probability'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x} cm, {point.y} kg'
                    }
                }
            },
            series: cdfSeries
        });
    }
    draw();
    $scope.addRow = function() {
        $scope.data.items.push({name:"New", ten:0, fifty:0, ninety: 0, editing: false});
        draw();
    };

    $scope.edit = function(index) {
        console.log("Toggle editing for "+index);
        $scope.data.items[index].editing = !$scope.data.items[index].editing;
    }

    $scope.update = function(index) {
        var item  = $scope.data.items[index];
        item.ten = Number(item.ten);
        item.fifty = Number(item.fifty);
        item.ninety = Number(item.ninety);
        item.editing = false;
        draw();
    }

    $scope.remove = function(index) {
        $scope.data.items = $scope.data.items.filter(function(item, i) {
            return index !== i;
        });
        draw();
    }
}]);