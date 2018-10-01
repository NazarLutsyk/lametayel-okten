lametayel.directive('datepickerdirectiveDate', ['$state', '$rootScope', '$timeout', 'pushnotification', function ($state, $rootScope, $timeout, pushnotification) {
    return {
        restrict: 'E',
        templateUrl: './directives/datepickerdirectiveOnlyDate/datepickerdirectiveOnlyDate.html',
        link: function (scope, el, attrs) {
            //$rootScope.ff = false;
            $('#datetimepicker1').datetimepicker({
                pickTime: false,
                startDate: new Date(),
                 autoClose: true
            });


            el.on('changeDate', function (e) {
                console.log(e);                
                $rootScope.fromDate = e.localDate.toISOString();
                $timeout(function () {
                    $rootScope.ff = true;
                }, 0);
                $rootScope.activeDatePicker = attrs.type;
                $rootScope.$broadcast('dateChange', { data: e.date, type: attrs.type });
                $rootScope.activeDatePicker = '';
                $(".bootstrap-datetimepicker-widget").hide()
                $timeout(function () {
                    var re = '/';
                    $rootScope.newFromDate = $rootScope.fromDate.substring(0,$rootScope.fromDate.indexOf("T"));
                    console.log($rootScope.newFromDate);
                }, 500);

            });

            //$rootScope.startDate = $rootScope.fromDate.toLocaleDateString();
            //console.log($rootScope.startDate)
        },
        replace: true
    };

} ]);

//scope.dateChange = function () {
//               var x = scope.dateTime;
//               console.log(x)
//           }
//           scope.$watch(
//                   "dateTime",
//                   function dateChange(newValue, oldValue) {
//                       //  if(newValue.length > 0){
//                       if (newValue) {
//                           $rootScope.$broadcast('dateChange', { data: newValue, type: attrs.type });
//                           $rootScope.activeDatePicker = '';
//                       }


//                   }
//               );
