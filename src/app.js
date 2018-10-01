var lametayel = angular.module('lametayel', ['ui.router', 'itemSwipe', 'ngJoyRide', 'ui.bootstrap', 'angularRangeSlider', 'angucomplete-alt', 'ui.sortable', 'ngDraggable', 'ngMaterialDatePicker']); //,'ngMaterialDatePicker'  ,'ngAnimate'

lametayel.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    "use strict";

    $urlRouterProvider.otherwise("/my-lists");

    $stateProvider
    .state('my-lists', {
        url: '/my-lists',
        views: {
            "main": {
                controller: 'mylistsCtrl',
                templateUrl: './components/mylists/mylists.html'
            }
        }

    })

    .state('new-trip', {
        url: '/new-trip',
        views: {
            "main": {
                controller: 'newtripCtrl',
                templateUrl: './components/new_trip/newtrip.html'
            }
        }

    })

    .state('activities', {
        url: '/activities/:id/:placetid/:placename/:datefrom/:dateuntil/:people/:placeurl/:activities/:weather/:customCats/:isnewList/:who',
        views: {
            "main": {
                controller: 'activitiesCtrl',
                templateUrl: './components/activities/activities.html'
            }
        }

    })

    .state('trip-list', {
        url: '/trip-list/:id/:placetid/:people/:weather/:activities/:customCats/:byAddActivity',
        views: {
            "main": {
                controller: 'triplistCtrl',
                templateUrl: './components/triplist/triplist.html'
            }
        }

    })
    .state('first-level-list', {
        url: '/first-level-list/:id/:placetid/:people/:weather/:activities/:customCats/:byAddActivity',
        views: {
            "main": {
                controller: 'firstLevelCtrl',
                templateUrl: './components/firstLevelList/firstLevelList.html'
            }
        }

    })
    


    .state('item', {
        url: '/item',
        views: {
            "main": {
                controller: 'itemCtrl',
                templateUrl: './components/item/item.html'
            }
        }

    })


} ]);



lametayel.filter('trustHtml', ['$sce', function ($sce) {
    return function (val) {
        if (val != null) {
            return $sce.trustAsHtml(val.toString());
        }
    };
} ])

lametayel.filter('encodeURIComponent', function () {
    return window.encodeURIComponent;
});

lametayel.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
lametayel.directive('onLongPress', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $elm, $attrs) {
            $elm.bind('touchstart', function (evt) {
                // Locally scoped variable that will keep track of the long press
                $scope.longPress = true;

                // We'll set a timeout for 600 ms for a long press
                $timeout(function () {
                    if ($scope.longPress) {
                        // If the touchend event hasn't fired,
                        // apply the function given in on the element's on-long-press attribute
                        $scope.$apply(function () {
                            $scope.$eval($attrs.onLongPress)
                        });
                    }
                }, 600);
            });

            $elm.bind('touchend', function (evt) {
                // Prevent the onLongPress event from firing
                $scope.longPress = false;
                // If there is an on-touch-end function attached to this element, apply it
                if ($attrs.onTouchEnd) {
                    $scope.$apply(function () {
                        $scope.$eval($attrs.onTouchEnd)
                    });
                }
            });
        }
    };
})
/*directive to replace click with touchstart*/
//lametayel.directive("ngMobileClick", [function () {

//    return function (scope, elem, attrs) {

//        elem.bind("touchstart click", function (e) {

//            e.preventDefault();

//            e.stopPropagation();



//            scope.$apply(attrs["ngMobileClick"]);

//        });

//    }


//} ])
//lametayel.directive('ngMobileClick', function() {
//  return {
//        restrict: 'A',
//        link: function(scope, elm, attrs) {
//            var ontouchFn = scope.$eval(attrs.onTouch);
//            elm.bind('touchstart', function(evt) {
//                scope.$apply(function() {
//                    ontouchFn.call(scope, evt.which);
//                });
//            });
//            elm.bind('click', function(evt){
//                    scope.$apply(function() {
//                        ontouchFn.call(scope, evt.which);
//                    });
//            });
//        }
//    };
//});