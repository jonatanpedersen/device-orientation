var deviceOrientationApp = angular.module('deviceOrientationApp', [
  'ngRoute'
]);

deviceOrientationApp.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
        when('/home', {
            templateUrl: 'home.html',
            controller: 'HomeController'
        }).
        when('/device/:deviceId', {
            templateUrl: 'device.html',
            controller: 'DeviceController'
        }).
        otherwise({
            redirectTo: '/home'
        });
  }]);

deviceOrientationApp.controller('HomeController', function ($scope, $location) {
    $scope.deviceId = '';
    $scope.go = function() {
        $location.path('/device/' + $scope.deviceId);
    };
});

deviceOrientationApp.controller('DeviceController', function ($scope, $routeParams, signalRHubProxy) {
    var deviceOrientationHubProxy = signalRHubProxy('deviceOrientationHub');

    $scope.deviceId = $routeParams.deviceId;
    $scope.deviceOrientation = { alpha: 1, beta: 1, gamma: 1 };
    
    window.ondeviceorientation = function (event) {
        deviceOrientationHubProxy.proxy.invoke('onDeviceOrientation', $scope.deviceId, event.alpha, event.beta, event.gamma);
    };

    deviceOrientationHubProxy.proxy.on('onDeviceOrientation', function (alpha, beta, gamma) {
        $scope.deviceOrientation = {
            alpha: alpha,
            beta: beta,
            gamma: gamma
        };

        $scope.deviceRotation = 'rotate(' + ((beta - 90) * -1) + 'deg)';
        $scope.$apply();
    });

    deviceOrientationHubProxy.connection.start().done(function() {
        deviceOrientationHubProxy.proxy.invoke('subscribe', $scope.deviceId);
    });
});

deviceOrientationApp.factory('signalRHubProxy', ['$rootScope', function ($rootScope) {
    function signalRHubProxyFactory(hubName) {
        var connection = $.hubConnection();
        var proxy = connection.createHubProxy(hubName);

        return {
            on: function (eventName, callback) {
                proxy.on(eventName, function (result) {
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback(result);
                        }
                    });
                });
            },
            off: function (eventName, callback) {
                proxy.off(eventName, function (result) {
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback(result);
                        }
                    });
                });
            },
            invoke: function (methodName, callback) {
                proxy.invoke(methodName)
                    .done(function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
            },
            connection: connection,
            proxy: proxy
        };
    };

    return signalRHubProxyFactory;
}]);