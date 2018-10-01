var isIOS = false;
lametayel.run(function ($rootScope, $state, $stateParams, $timeout, $http, server, $interval, analytics) {
    "use strict";

    $rootScope.initWT = function () {
        $rootScope.initWTByBroadcast = true;
        $rootScope.$broadcast('initWT');
    };
    if (localStorage.getItem('firstTime')) {
        localStorage.setItem("firstTime", "true");
    }
    if (localStorage.getItem('WTSeen')) {
        localStorage.setItem('WTSeen', true);
    }
    //set analytics
    // analytics.initAnalytics();

    $rootScope.endSwiper = false;
    $rootScope.noBanner = true;
    $rootScope.swiper3 = false;

    $rootScope.killInterval = function () {
        $interval.cancel(stopTime);
        console.log(stopTime);
    };
    // $rootScope.updateTime   = function () {
    try {
        if (typeof Appsee != 'undefined') {
            //  Appsee.start("5ef1b854b5bf4958aa2c18a2bcc29a8e");
            $rootScope.killInterval();
        } else {
            //do nothing
        }
    } catch (err) {
        console.log(err);
    }

    var stopTime;
    stopTime = $interval($rootScope.updateTime, 1000);

    $rootScope.sendPageAppsee = function (page) {
        console.log('appsee: ' + page)
        if (typeof Appsee != 'undefined') {
            // Appsee.startScreen(page);
        }
    }

    $(function () {
        FastClick.attach(document.body);
    });
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            //for input focus - push display up - not remove
            $('.wrap-page-list, .scrollPage, body').scrollTop(0)
        })
    /*if is ios - add css*/
    if (isIOS) {
        $('<link rel="stylesheet" type="text/css" href="css/ios.css" />').appendTo("head");
    }

    /*end for input push*/
    $rootScope.domainApi = "https://www.lametayel.co.il/api/?"
    //$rootScope.info = mylistsData;
    $rootScope.token = "1162bd653d2ecda6ecf673a06db8fa2c";
    $rootScope.israelTid = 281;
    $rootScope.zoneid = 259;

    //listen to no Internet access
    //window.addEventListener('offline', function () {
    //    alert('offline')
    //    $rootScope.$broadcast('showPopup', { type: "noNetwork" });
    //});

    $rootScope.openLink = function (link) {
        if (!link.length) {
            return;
        }
        if (localStorage.getItem('firstTime') === null) {
            localStorage.setItem("firstTime", "true");
            $rootScope.urlToGo = link;
            // $rootScope.$broadcast('showPopup', { type: "inappBrowser" });
        } else {
            var url = decodeURIComponent(link);
            if (isIOS)
                location.href = url;
            else
                window.open(url, '_blank');
        }
    }

    $rootScope.goToLink = function () {
        window.open(decodeURIComponent($rootScope.urlToGo), '_blank');
        $rootScope.showPopupLink = false;
        $rootScope.showMask = false;
        $rootScope.showPopup = false;
        localStorage.setItem("firstTime", "false");
    }

    $rootScope.hideMask = function () {
        $rootScope.showMask = false;
        $rootScope.showDoubleCheck = false;
        $rootScope.$broadcast('hidePopup');
        $rootScope.$broadcast('hideSubMenu');
    }
    $rootScope.openMask = function () {
        $rootScope.showMask = false;
    }
    //clear list data from some controllers
    $rootScope.clearListData = function () {
        $rootScope.personPicked = [];
        $rootScope.dateUntilForBack = undefined;
        $rootScope.dateFromForBack = undefined;
        $rootScope.chosenPlaceData = undefined;
        $rootScope.who = undefined;
    }

    $rootScope.getRandomId = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    $rootScope.getHebrewDay = function (day) {
        var hebrewDay = ''
        switch (day) {
            case 'Sunday':
                hebrewDay = "א'";
                break;
            case 'Monday':
                hebrewDay = "ב'";
                break;
            case 'Tuesday':
                hebrewDay = "ג'";
                break;
            case 'Wednesday':
                hebrewDay = "ד'";
                break;
            case 'Thursday':
                hebrewDay = "ה'";
                break;
            case 'Friday':
                hebrewDay = "ו'";
                break;
            case 'Saturday':
                hebrewDay = "ז'";
                break;

        }
        return hebrewDay;
    }

    $rootScope.advBaner = function () {
        server.request("get_static_banner", "&token=" + $rootScope.token + "&zone=" + $rootScope.zoneid + "&data_type=json").then(function (data) {
            $rootScope.baner = data;

            if (data && data[0] && data[0] == "No Banner Found") {
                $rootScope.noBanner = true;
            }
            else {
                $rootScope.noBanner = false;
            }
            console.log(data);
        });
    }
    // if ($rootScope.endSwiper) {
    $rootScope.advBaner();
    //  }

    document.addEventListener("backbutton", function (e) {
        e.preventDefault()
        $rootScope.backPressed(e)

    }, false);

});

lametayel.directive("keepScroll", function () {

    return {

        controller: function ($scope) {
            var element = null;

            this.setElement = function (el) {
                element = el;
            }

            this.addItem = function (item) {
                if (!isIOS) {
                    // console.log("Adding item", item, item.clientHeight);
                    element.scrollTop = (element.scrollTop + item.clientHeight + 1);
                }
                //1px for margin from your css (surely it would be possible
                // to make it more generic, rather then hard-coding the value)
            };

        },

        link: function (scope, el, attr, ctrl) {

            ctrl.setElement(el[0]);

        }

    };

})
    .directive("scrollItem", function () {

        return {
            require: "^keepScroll",
            link: function (scope, el, att, scrCtrl) {
                if (!isIOS) {
                    scrCtrl.addItem(el[0]);
                }
            }
        }
    })
