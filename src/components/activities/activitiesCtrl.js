lametayel.controller('activitiesCtrl', ['$scope', '$stateParams', 'server', '$rootScope', '$state', '$filter', 'analytics', function ($scope, $stateParams, server, $rootScope, $state, $filter, analytics) {
    //hide the datepicker - if the user come from new-trip page
    $(".bootstrap-datetimepicker-widget").hide()

    analytics.sendPageView('Activities')
    $rootScope.sendPageAppsee('activities')

    $scope.pageClass = 'page-activities';
    $scope.stopCalc = false;
    $scope.activityChosen = []
    $scope.weatherChosen = []
    $scope.customCatChosen = []


    //init data
    $scope.initData = function () {
        //if the user here for add activitiy 
        if ($stateParams.isnewList == "false") {
            $rootScope.addActStatus = true; //come to add activity
            $scope.activitiesByPast = $stateParams.activities
            $scope.categoriesByPast = $stateParams.customCats
            $scope.listId = $stateParams.id;
            $scope.placetid = $stateParams.placetid;
            $scope.datefrom = $stateParams.datefrom.split('.').join('/');
            $scope.dateuntil = $stateParams.dateuntil.split('.').join('/');
            $scope.people = $stateParams.people;
            $scope.placeurl = $stateParams.placeurl;
            $rootScope.placename = $stateParams.placename;
            $scope.weather = $stateParams.weather;
            $scope.customCats = $stateParams.customCats;
            $scope.getActivities();
            $scope.getCustomCategories()

        }
        else {
            $rootScope.addActStatus = false; //new list - doesnt come to add activity
            $scope.placetid = $stateParams.placetid;
            $scope.datefrom = $stateParams.datefrom.split('.').join('/');
            $scope.dateuntil = $stateParams.dateuntil.split('.').join('/');
            $scope.people = $stateParams.people;
            $scope.placeurl = $stateParams.placeurl;
            $rootScope.placename = $stateParams.placename;
            $rootScope.who = $stateParams.who;
            $scope.getWeather();
            $scope.getActivities();
            $scope.getPlaceImage();
            $scope.getCustomCategories()
        }


    }
    $scope.getWeather = function () {
        // 8 = summer , 7 = ma'avar , 6 = winter , 5 = extreme cold
        server.request("api_weather_conditions", "&token=" + $rootScope.token + "&tid=" + $scope.placetid + "&start_date=" + $scope.datefrom + "&end_date=" + $scope.dateuntil + "&data_type=json").then(function (data) {
            //console.log(data);
            //if the data.DRESS_FOR.CLOTHES is a array or a string - check the type, and cause the $scope.weatherChosen be an array
            $scope.weatherChosen = data.DRESS_FOR.CLOTHES ? Object.prototype.toString.call(data.DRESS_FOR.CLOTHES) === '[object Array]' ? data.DRESS_FOR.CLOTHES : data.DRESS_FOR.CLOTHES.length > 1 ? data.DRESS_FOR.CLOTHES.split(',') : [data.DRESS_FOR.CLOTHES] : [];


            $scope.weatherDisplayByServer = angular.copy($scope.weatherChosen);
            switch ($scope.weatherChosen[0]) {
                case "5":
                    $scope.weatherDisplayByServer = "קר מאוד";
                    break;
                case "6":
                    $scope.weatherDisplayByServer = "קר";
                    break;
                case "7":
                    $scope.weatherDisplayByServer = "נעים";
                    break;
                case "8":
                    $scope.weatherDisplayByServer = "חם";
                    break;
            }
            //check if all the data return
            $scope.checkHideLoader()

            //$scope.weatherName($scope.weatherChosen);

        });
    }
    $scope.checkHideLoader = function () {

        //if its a add activity status - hide the loader if the activities return from server
        if ($rootScope.addActStatus) {
            if ($scope.activArray) {
                $scope.showLoader = false;
            }
        }
        //else - check if  activity and weather return
        else {
            if ($scope.weatherDisplayByServer && $scope.activArray) {
                $scope.showLoader = false;
            }
        }


    }
    //get the activities
    $scope.getActivities = function () {
        server.request("api_packing_list_get_filters", "&token=" + $rootScope.token + "&type=activities&data_type=json").then(function (data) {
            //console.log(data);
            $scope.activArray = data.FILTERS.FILTER;
            //check if all the data return
            $scope.checkHideLoader()

            //if the user here to add activity - remove the activities that chosen in past
            if ($rootScope.addActStatus) {
                var activitiesByPastArr = $scope.activitiesByPast.split(',')
                var activArrayArrIds = $scope.activArray.map(function (a) { return a.ID; }); //all the custom categories arr IDS
                for (var i = 0; i < activitiesByPastArr.length; i++) {
                    var itemIndex = $.inArray(activitiesByPastArr[i], activArrayArrIds);
                    //if the index exist - remove the activity from activities array
                    if (itemIndex > -1) {
                        $scope.activArray.splice(itemIndex, 1);
                        activArrayArrIds.splice(itemIndex, 1);
                    }
                }

            }



        });
    }

    $scope.getCustomCategories = function () {

        if (localStorage.getItem('customCategories') && JSON.parse(localStorage.getItem('customCategories'))) {
            $scope.catArray = JSON.parse(localStorage.getItem('customCategories')) //all the custom categories arr
            //if the user here to add category - remove the categories that chosen in past
            if ($rootScope.addActStatus) {

                var categoriesByPastArr = $filter('filter')($rootScope.placeListData.list, { isCustomCat: true });
                $scope.categoriesByPastArrIds = categoriesByPastArr.map(function (a) { return a.id; }); // get the categories that chosen in past IDS
                var catArrayArrIds = $scope.catArray.map(function (a) { return a.id; }); //all the custom categories arr IDS
                for (var i = 0; i < $scope.categoriesByPastArrIds.length; i++) {
                    //get the index of the chosen in past cat id in the all cat ids
                    var itemIndex = $.inArray($scope.categoriesByPastArrIds[i], catArrayArrIds);
                    //if the index exist - remove the activity from activities array
                    if (itemIndex > -1) {
                        $scope.catArray.splice(itemIndex, 1);
                        catArrayArrIds.splice(itemIndex, 1);
                    }
                }

            }

        }
    }


    $scope.getPlaceImage = function () {
        // 8 = summer , 7 = ma'avar , 6 = winter , 5 = extreme cold
        server.request("api_dest_img", "&token=" + $rootScope.token + "&tid=" + $scope.placetid + "&data_type=json").then(function (data) {

            $scope.placeImg = data.IMG.SRC
            //check if all the data return
            $scope.checkHideLoader()
        });
    }
    $scope.initData();

    $scope.showLoader = true;

    //check if element pick (weather or activity)
    $scope.isPicked = function (item, type) {
        var arrayToFindIn = [];

        var id;
        if (type == 'weather') {
            arrayToFindIn = $scope.weatherChosen;
            id = item.id;
        }
        else if (type == 'activity') {
            arrayToFindIn = $scope.activityChosen;
            id = item.ID;
        }
        else if (type == 'customCat') {
            arrayToFindIn = $scope.customCatChosen;
            id = item.id;
        }
        if ($.inArray(id, arrayToFindIn) > -1) {
            return true;
        }
        else {
            return false
        }
    }
    $scope.weatherClick = function (item) {
        var itemIndex = $.inArray(item.id, $scope.weatherChosen);
        //if the index exist - remove it
        if (itemIndex > -1) {
            $scope.weatherChosen.splice(itemIndex, 1);
        }
        //else -chose it
        else {
            $scope.weatherChosen.push(item.id)
        }
    }
    $scope.activityClick = function (item) {
        var itemIndex = $.inArray(item.ID, $scope.activityChosen);
        //if the index exist - remove it
        if (itemIndex > -1) {
            $scope.activityChosen.splice(itemIndex, 1);
        }
        //else -chose it
        else {
            $scope.activityChosen.push(item.ID)
        }
    }
    $scope.customCatClick = function (item) {
        var itemIndex = $.inArray(item.id, $scope.customCatChosen);
        //if the index exist - remove it
        if (itemIndex > -1) {
            $scope.customCatChosen.splice(itemIndex, 1);
        }
        //else -chose it
        else {
            $scope.customCatChosen.push(item.id)
        }
    }



    $scope.widthScreen = window.innerWidth - 26;
    if ($scope.widthScreen % 2 == 1) {
        $scope.widthScreen = $scope.widthScreen - 1;
    }
    $scope.padFromSide = 13;
    $scope.betweenFour = 4;
    $scope.betweenThree = 10;
    //pick the width and height of the boxces in the page
    while (!$scope.stopCalc) {
        if (($scope.widthScreen - 2 * $scope.betweenThree) % 3 == 0 && ($scope.widthScreen) % 4 == 0) {
            $scope.stopCalc = true;
            $scope.toFour = ($scope.widthScreen - 3 * $scope.betweenFour) / 4;
            $scope.toThree = ($scope.widthScreen - 2 * $scope.betweenThree) / 3;
        } else {
            $scope.widthScreen = $scope.widthScreen - 2;
            $scope.padFromSide = $scope.padFromSide + 1;
        }
    }

    $scope.createList = function () {


        //if the user create a regular list
        if (!$rootScope.addActStatus) {
            //check if the user chosen activities -validation
            if (!($scope.activityChosen.length > 0)) {
             
                $scope.showActivitiesValidation = true;

            }
            else {
                $scope.showActivitiesValidation = false;
            }
            //check if the user chosen weather -validation
            if (!($scope.weatherChosen.length > 0)) {
                $scope.showWeatherValidation = true;

            }
            else {
                $scope.showWeatherValidation = false;
            }
            //if there is no weather ot activities -return
            if (!($scope.activityChosen.length > 0 && $scope.weatherChosen.length > 0)) {
                return;
            }
            else  {
                var weatherChosen = "";
                $.each($scope.weatherChosen, function (key, value) {
                    if (value) {
                        weatherChosen += value + ',';
                    }
                });
                var activityChosen = "";
                $.each($scope.activityChosen, function (key, value) {
                    if (value) {
                        activityChosen += value + ',';
                    }
                });

                var customCatChosen = "";
                $.each($scope.customCatChosen, function (key, value) {
                    if (value) {
                        customCatChosen += value + ',';
                    }
                });
                //set the new list in the localstorage
                var newListObj = {}
                newListObj.name = $rootScope.placename;
                newListObj.id = $rootScope.getRandomId();
                //newListObj.id = $scope.placetid;
                newListObj.placetid = $scope.placetid;
                newListObj.startDate = $scope.datefrom;
                newListObj.endDate = $scope.dateuntil;
                newListObj.img = $scope.placeImg;
                newListObj.activities = activityChosen;
                newListObj.weather = weatherChosen;
                newListObj.people = $scope.people;
                newListObj.placeurl = $scope.placeurl;
                newListObj.percent = 0;
                newListObj.who = $rootScope.who
                var listPlacesIds = localStorage.getItem("listPlacesIds");
                //if there is more places in list
                if (listPlacesIds) {
                    //get the plcaes list arr
                    listPlacesIdsArr = JSON.parse(listPlacesIds);
                }
                else {
                    //else - init the plcaes list arr
                    listPlacesIdsArr = []
                }
                listPlacesIdsArr.push(newListObj);
                localStorage.setItem("listPlacesIds", JSON.stringify(listPlacesIdsArr))

                localStorage.setItem("list" + newListObj.id, JSON.stringify(newListObj))
                //  $state.transitionTo('trip-list', { id: newListObj.id, placetid: $scope.placetid, people: $scope.people, weather: weatherChosen, activities: activityChosen, customCats: customCatChosen });
                $state.transitionTo('first-level-list', { id: newListObj.id, placetid: $scope.placetid, people: $scope.people, weather: weatherChosen, activities: activityChosen, customCats: customCatChosen });
            }

        }

        //if the user want to add new activities 
        else {

            var activityChosen = "";
            $.each($scope.activityChosen, function (key, value) {
                if (value) {
                    activityChosen += value + ',';
                }
            });
            var customCatChosen = "";
            $.each($scope.customCatChosen, function (key, value) {
                if (value) {
                    customCatChosen += value + ',';
                }
            });
            //   customCatChosen += $scope.categoriesByPastArrIds;
            activityChosen += $scope.activitiesByPast;
            //  $state.transitionTo('trip-list', { id: $scope.listId, placetid: $scope.placetid, people: $scope.people, weather: $scope.weather, activities: activityChosen, customCats: customCatChosen, byAddActivity: true });
            $state.transitionTo('first-level-list', { id: $scope.listId, placetid: $scope.placetid, people: $scope.people, weather: $scope.weather, activities: activityChosen, customCats: customCatChosen, byAddActivity: true });
        }

        $scope.clearListData();
    }
    $scope.forecastArray = [
    	{ toBe: 'חם', id: '8' },
    	{ toBe: 'נעים', id: '7' },
    	{ toBe: 'קר', id: '6' },
    	{ toBe: 'קר מאוד', id: '5' }
    ];
    //$scope.activArray = [
    //	{ witch: 'עירוני', fontIcon: 'filter-9' },
    //	{ witch: 'בטבע', fontIcon: 'filter-10' },
    //	{ witch: 'טיול מאורגן', fontIcon: 'filter-11' },
    //	{ witch: 'עסקים', fontIcon: 'cat-1' },
    //	{ witch: 'בטן-גב', fontIcon: 'cat-22' },
    //	{ witch: 'תרמילאי', fontIcon: 'cat-21' },
    //	{ witch: 'הפלגה/קרוז', fontIcon: 'filter-15' },
    //	{ witch: 'קמפים', fontIcon: 'cat-20' },
    //	{ witch: 'ג\'פים', fontIcon: 'cat-17' },
    //	{ witch: 'אופניים', fontIcon: 'cat-18' },
    //	{ witch: 'סקי', fontIcon: 'cat-19' }
    //];





} ])

