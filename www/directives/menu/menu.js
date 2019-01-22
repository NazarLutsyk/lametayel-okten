lametayel.directive('menu', ['$state', '$rootScope', '$timeout', 'pushnotification', 'share', function ($state, $rootScope, $timeout, pushnotification, share) {
    return {
        restrict: 'E',
        templateUrl: './directives/menu/menu.html',
        link: function (scope, el, attrs) {
            scope.setting = false;
            $rootScope.showMenu = false;
            scope.fontSize = [
            { value: 0 },
            { value: 1 },
            { value: 2 }
            ]

            if (!localStorage.getItem('checkedListSetting')) {
                //the default - on the original place
                $rootScope.checkedListSetting = 'samePlace';
            }
            else {
                $rootScope.checkedListSetting = localStorage.getItem('checkedListSetting');
            }

            scope.$state = $state;

            myCLassForHtml = localStorage.getItem("fontClassForHtml");
            if (!myCLassForHtml) {
                $('html').removeClass();
                scope.fontSize[0].value = 0;
            } else {
                $('html').addClass(myCLassForHtml);
                switch (myCLassForHtml) {
                    case 'medium':
                        scope.fontSize[0].value = 1;
                        break;
                    case 'large':
                        scope.fontSize[0].value = 2;
                        break;

                }


            }



            var d = true;



            scope.selectSetting = function (listItemSetting) {
                $rootScope.checkedListSetting = listItemSetting;
                localStorage.setItem("checkedListSetting", listItemSetting);
            }


            scope.openSetting = function () {
                scope.setting = true;
            }

            scope.back = function () {
                scope.setting = false;
            }

            $rootScope.closeMenu = function () {
                $(".menu-wrap").removeClass('openMenu');
                $timeout(function () {
                    $rootScope.showMenu = false;
                }, 0);

            }

            scope.shareFreind = function () {
                str = 'השתמשתי באפליקציה של למטייל, ממליץ לכם גם :)';
                share.share({ title: str })
                //$rootScope.$broadcast('shareList',{data:str});
            }

            scope.goToList = function () {
                //pushnotification.push()
                $state.transitionTo('my-lists');
                scope.closeMenu();

            }

            $(".menu-mask").click(function (e) {
                scope.closeMenu();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });



            $rootScope.showMenuFunc = function (e) {
                //if the settings open - return to main menu
                if (scope.setting == true) {
                    $timeout(function () {
                        scope.setting = false;
                    }, 0);
                }
                //else -check if close or open
                else {
                    $timeout(function () {
                        $rootScope.showMenu = !$rootScope.showMenu;
                    }, 0);
                    $timeout(function () {
                        scope.setting = false;
                    }, 500);

                }
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }


            }

            scope.gradeUs = function () {
              try {
                if (isIOS) {
                  window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id1164928192?ls=1&mt=8');

                }
                //android market link
                else {
                  window.open("market://details?id=com.cambium.lamtayelAriza", '_system')
                }
              } catch (e) {
                console.log(e);
              }
            }


            scope.makeNewTrip = function () {
                $rootScope.clearListData()
                $state.transitionTo('new-trip')
                 scope.closeMenu();
           //     analytics.sendAnalyticsEvent('event', 'New_List_Btn')
            }

          scope.matest = function () {
            window.open("mailto:service@lametayel.co.il?Subject=אשמח שתיצרו איתי קשר!&body=!", '_system')
          }



        },
        replace: true
    };

} ]);
