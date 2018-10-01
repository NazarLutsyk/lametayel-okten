lametayel.directive('datepickerdirectiveDateTwo', [
    '$state',
    '$rootScope',
    '$timeout',
    'pushnotification',
    function ($state, $rootScope, $timeout, pushnotification) {
        return {
            restrict: 'E',
            templateUrl: './directives/datepickerdirectiveOnlyDate/datepickerdirectiveOnlyDate2.html',
            link: function (scope, el, attrs) {

                $(document)
                    .on('click', '#datetimepicker2', function () {
                        if ($rootScope.ff == true) {
                            $('#datetimepicker2')
                                .datetimepicker({
                                pickTime: false,
                                startDate: new Date($rootScope.fromDate)
                            })
                                .datetimepicker("setDate", new Date($rootScope.fromDate));
                                
                            $('#datetimepicker2').datetimepicker('show');
                        }
                    })

                el.on('changeDate', function (e) {
                    //$timeout(function () {    $rootScope.ff = false; }, 0);
                    $("#datetimepicker2").datetimepicker("destroy");
                    $rootScope.activeDatePicker = attrs.type;
                    $rootScope.$broadcast('dateChange', {
                        data: e.date,
                        type: attrs.type
                    });
                    $rootScope.activeDatePicker = '';
                    $(".bootstrap-datetimepicker-widget").hide()
                });

            },
            replace: true
        };

    }
]);

// scope.dateChange = function () {               var x = scope.dateTime;
// console.log(x)           }           scope.$watch( "dateTime",    function
// dateChange(newValue, oldValue) {                 // if(newValue.length > 0){
//                     if (newValue) { $rootScope.$broadcast('dateChange', {
// data: newValue, type: attrs.type }); $rootScope.activeDatePicker = '';
//                }              }          );