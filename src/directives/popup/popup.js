lametayel.directive('popup', ['$state', '$rootScope', '$timeout', 'share', function ($state, $rootScope, $timeout, share) {
    return {
        restrict: 'E',
        templateUrl: './directives/popup/popup.html',
        link: function (scope, el, attrs) {

            $rootScope.showPopupLink = false;

            scope.closePopup = function () {
                $rootScope.showMask = false;
                $rootScope.showPopupLink = false;
                $rootScope.showPopup = false;

            }



            $rootScope.$on('showPopup',
        function (event, data) {

            $timeout(function () {
                //if the popup type is remind - show the push popup
                if (data.type == "remind") {
                    $rootScope.showMask = true;
                    $rootScope.popupType = 'push';
                    scope.reminItem = data.item;
                    $rootScope.showPopup = true;
                }
                //if the popup type is slow network
                else if (data.type == "slowNetwork") {
                    //if this popup not  display yet
                    if (!localStorage.getItem('slowPopup')) {
                        $rootScope.showMask = true;
                        $rootScope.popupType = 'slow';
                        localStorage.setItem('slowPopup', true)
                        $rootScope.showPopup = true;
                    }

                }
                //if the popup type is slow network
                else if (data.type == "noNetwork") {
                    //if this popup not  display yet
                    // if (!localStorage.getItem('noNetwork')) {
                    $rootScope.showMask = true;
                    $rootScope.popupType = 'noNetwork';
                    localStorage.setItem('noNetwork', true)
                    $rootScope.showPopup = true;


                    // }

                }
                else if (data.type == "inappBrowser") {
                    //if this popup not  display yet
                    $rootScope.showMask = true;
                    $rootScope.popupType = 'inappBrowser';
                    $rootScope.showPopup = true;
    
                }
            }, 0);


        })
            $rootScope.$on('hidePopup',
        function (event, data) {



            $timeout(function () {
                $rootScope.showMask = false;

                $rootScope.showPopup = false;
            }, 0);


        })



        },
        replace: true
    };

} ]);