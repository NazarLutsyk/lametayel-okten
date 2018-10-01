lametayel.directive('header', ['$state', '$rootScope', '$timeout', 'share', function ($state, $rootScope, $timeout, share) {
    return {
        restrict: 'E',
        templateUrl: './directives/header/header.html',
        link: function (scope, el, attrs) {
            scope.$state = $state;
            scope.mylist = $rootScope.mylist

            $rootScope.backPressed = function () {

                //if the menu open - close it
                if ($rootScope.showMenu == true) {
                    $rootScope.showMenuFunc()
                }
                //if the date picker is open - close it
                else if ($(".md-dialog-backdrop").length > 0) {
                    $(".dtp-btn-cancel").click();
                }
                //else- check what to do - by state
                else {
                    switch ($state.$current.self.name) {
                        case 'new-trip':
                            history.back();
                            break;
                        case 'activities':
                            history.back();
                            break;
                        case 'trip-list':
                            $rootScope.$broadcast('backbtnclick');
                            break;
                        case 'first-level-list':
                            $rootScope.$broadcast('backbtnclick');
                            break;
                        case 'my-lists':
                            navigator.app.exitApp();
                            break;

                    }
                }

            }

            $(document).on('click', '.header-menu ul li', function () {
                $('.header-menu').removeClass('open');
            });

            scope.sharePlaceGeneral = function (item) {
                console.log(item);
                placeAns = 'השתמשתי באפליקציית למטייל כדי לתכנן את הנסיעה שלי ל';
                placeAns = placeAns + $rootScope.placeListData.name + ', מהתאריך: ';
                placeAns = placeAns + $rootScope.placeListData.startDate + ' עד ל:';
                placeAns = placeAns + $rootScope.placeListData.endDate + '.';
                share.share({ title: placeAns });
                // $rootScope.$broadcast('shareList', { data: placeAns });
                console.log(placeAns);
            }
            scope.getTitle = function () {
                var title = "";
                //if the user in activities page 
                //and in add activity status - set the title as:
                if ($rootScope.addActStatus == true) {
                    title = "הוסף פעילויות"
                }
                else {
                    title = "הטיול שלי ל";
                    title += $rootScope.placename;
                }

                return title;
            }


        },
        replace: true
    };

} ]);