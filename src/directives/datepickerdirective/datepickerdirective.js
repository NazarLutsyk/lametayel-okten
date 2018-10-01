lametayel.directive('datepickerdirective', ['$state', '$rootScope', '$timeout', 'pushnotification', function ($state, $rootScope, $timeout, pushnotification) {
    return {
        restrict: 'E',
        templateUrl: './directives/datepickerdirective/datepickerdirective.html',
        link: function (scope, el, attrs) {

            scope.dateChange = function () {
                var x = scope.dateTime;
                console.log(x)
            }
            scope.$watch(
                    "dateTime",
                    function dateChange(newValue, oldValue) {
                        //  if(newValue.length > 0){
                        if (newValue) {
                            $rootScope.$broadcast('dateChange', { data: newValue, type: attrs.type });
                            $rootScope.activeDatePicker = '';
                        }


                        //}
                        //else{
                        //    
                        //}
                    }
                );

            scope.blurInput = function () {
                $('textarea').blur()
            }


            scope.$on('dateFocus', function (event, data) {
                var x


            });

            scope.setActiveDatepicker = function () {
              //  $rootScope.activeDatePicker = attrs.type;
            }

        },
        replace: true
    };

} ]);