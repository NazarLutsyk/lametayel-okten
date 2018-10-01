lametayel.controller('newtripCtrl', ['$scope', '$http', '$timeout', '$stateParams', '$state', '$rootScope', 'server', 'analytics', function ($scope, $http, $timeout, $stateParams, $state, $rootScope, server, analytics) {
    //hide the datepicker - if the user come from new-trip page
    $(".bootstrap-datetimepicker-widget").hide()

    analytics.sendPageView('Create_New_Trip')
    $rootScope.sendPageAppsee('create list')

    $rootScope.ff = false;

    $scope.showPlaceValidation = false;
    $rootScope.mylist = false;
    $scope.pageClass = 'page-new-trip';
    /** for back btn**/
    $rootScope.personPicked = $rootScope.personPicked ? $rootScope.personPicked : [];
    $rootScope.chosenPlaceData = $rootScope.chosenPlaceData ? $rootScope.chosenPlaceData : undefined;
    $scope.placeTerm = $rootScope.chosenPlaceData ? $rootScope.chosenPlaceData.DEST_DISPLAY_NAME : undefined;
    $scope.placeTermByServer = $scope.placeTerm ? true : false;
    $rootScope.who = $rootScope.who ? $rootScope.who : undefined;
    /** end  for back btn**/

    $scope.witchOne = '';
    $scope.stopCalc = false;
    $scope.padFromSide = 13;
    $scope.canGoNext = false;
    $scope.widthScreen = window.innerWidth - $scope.padFromSide * 2;
    $scope.validMessage = "";
    if ($scope.widthScreen % 2 == 1) {
        $scope.widthScreen = $scope.widthScreen - 1;
    }
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

    $scope.initListData = function () {
        if (!$rootScope.people) {
            //get the travelers -types
            server.request("api_packing_list_get_filters", "&token=" + $rootScope.token + "&type=gender&&data_type=json").then(function (data) {
                console.log(data.FILTERS.FILTER);
                $rootScope.people = data.FILTERS.FILTER;
            });
        }




    }
    $scope.setDate = function () {
        $scope.dateChosenArr ? '' : $scope.dateChosenArr = [false, false]
        if ($rootScope.dateFromForBack) {
            $rootScope.dateFrom = $rootScope.dateFromForBack;
            $scope.dateChosenArr[0] = false;
            $timeout(function () {
                $scope.dateFromStringToDisplay = dateFormat($rootScope.dateFrom, "dd/mm/yyyy")
            }, 0);


        }
        else {
            $scope.dateChosenArr[0] = true;

        }
        if ($rootScope.dateUntilForBack) {
            $rootScope.dateuntil = $rootScope.dateUntilForBack;
            $scope.dateChosenArr[1] = false;
            $timeout(function () {
                $scope.dateUntilStringToDisplay = dateFormat($rootScope.dateuntil, "dd/mm/yyyy")
                if ($scope.dateUntilStringToDisplay != undefined) {
                    $rootScope.ff = true;
                }
            }, 0);


        }
        else {
            $scope.dateChosenArr[1] = true;

        }

    }
    $scope.setDate()

    $scope.initListData()

    $scope.gofocus = function (num) {
        $($('.geoInput')[num]).focus();
    }


    $scope.getInputFocus = function () {
        $scope.inputFocus = true;
        $scope.showAutocomplete = true;
    }

    $scope.getInputBlur = function () {
        $scope.inputFocus = false;
        $scope.shadow = false;
        $timeout(
        function () {
            $scope.showAutocomplete = false
              //if there is no place
        if (!$scope.placeTermByServer == true || !$rootScope.chosenPlaceData) {

            $scope.showPlaceValidation = true;

        }
        else {
            $scope.showPlaceValidation = false;
        }
        }, 500);

       

        //$scope.places = [];
    }

    $scope.startDate = function () {
      
        //set the date that chosen - for back btn
        $rootScope.dateFromForBack = angular.copy($scope.dateFrom);
        $scope.checkAllFieldsFilled()
    }
    $scope.dateUntilChange = function () {
        $rootScope.dateUntilForBack = angular.copy($scope.dateuntil);
        $scope.checkAllFieldsFilled()
    }

    $scope.equalDate = function (d1, d2) {

        if (d1.getFullYear() != d2.getFullYear()) { return false; }
        if (d1.getMonth() != d2.getMonth()) { return false; }
        if (d1.getDate() != d2.getDate()) { return false; }
        return true;
    }

    $scope.checkAllFieldsFilled = function () {
        var completed = true;

        //if there is no place
        if (!$scope.placeTermByServer == true || !$rootScope.chosenPlaceData) {
            $scope.canGoNext = false;
            completed = false;
            return false;

        }


        //if there is no people chosen
        if ($.inArray(true, $rootScope.personPicked) == -1) {
            $scope.canGoNext = false;
            completed = false;
            return false;

        }
        ////if there is no date
        if (!$scope.dateFrom || !$scope.dateuntil) {
            $scope.canGoNext = false;
            $scope.validMessage = ""
            completed = false;
            return false;

        }
        //if the date is without value
        else if ($scope.dateFrom.length == 0 || $scope.dateuntil.length == 0) {
            $scope.canGoNext = false;
            $scope.validMessage = ""
            completed = false;
            return false;
        }
        //if the until date is befor the from date
        if ($scope.equalDate($scope.dateuntil, $scope.dateFrom)) {
            $scope.validMessage = "";
        }
        else if (!($scope.dateuntil.getTime() > $scope.dateFrom.getTime())) {
            $scope.canGoNext = false;
            completed = false;
            $scope.validMessage = 'תאריך העזיבה צריך להיות לאחר תאריך ההגעה'
            return false;
        }
        else if ($scope.dateuntil.getTime() >= $scope.dateFrom.getTime()) {
            $scope.validMessage = ""
        }
        if (completed == true) {
            $scope.validMessage = ""
            $scope.canGoNext = true;
        }
        //to do: prevent contimnue if the place not chosen and if the user edit the place that he chose
        if (!$rootScope.chosenPlaceData || !$rootScope.chosenPlaceData.DEST_NAME) {
            $scope.canGoNext = false;
            completed = false;
            return false;
        }

    }
    $scope.checkAllFieldsFilled()

    $scope.showValidationTexts = function () {
        var completed = true;

        //if there is no place
        if (!$scope.placeTermByServer == true || !$rootScope.chosenPlaceData) {

            $scope.showPlaceValidation = true;

        }
        else {
            $scope.showPlaceValidation = false;
        }


        //if there is no people chosen
        if ($.inArray(true, $rootScope.personPicked) == -1) {
            $scope.showPeopleValidation = true;

        }
        ////if there is no date
        if (!$scope.dateFrom) {
            $scope.dateFromValidation = true;

        }
        else {
            $scope.dateFromValidation = false;
        }
        if ( !$scope.dateuntil) {
            $scope.dateUntilValidation = true;

        }
         else {
            $scope.dateUntilValidation = false;
        }
        //if the until date is befor the from date
        if ($scope.dateuntil && $scope.dateFrom) {
            if (!($scope.dateuntil.getTime() > $scope.dateFrom.getTime())) {

                $scope.validMessage = "תאריך העזיבה צריך להיות לאחר תאריך ההגעה"

            }
            else {
                $scope.validMessage = ''
            }
        }


        //if there is one validation text show the general validation text
        if ($scope.showPlaceValidation || $scope.showPeopleValidation || $scope.validMessage) {
            $scope.showGeneralValidation = true;
        }
        else {
            $scope.showGeneralValidation = false;
        }

        ////to do: prevent contimnue if the place not chosen and if the user edit the place that he chose
        //if (!$rootScope.chosenPlaceData || !$rootScope.chosenPlaceData.DEST_NAME) {

        //}

        //if the until date is befor the from date
        //if ($scope.equalDate($scope.dateuntil, $scope.dateFrom)) {
        //    $scope.validMessage = "";
        //}
        //else if (!($scope.dateuntil.getTime() > $scope.dateFrom.getTime())) {
        //    $scope.canGoNext = false;
        //    completed = false;
        //    $scope.validMessage = 'תאריך העזיבה צריך להיות לאחר תאריך ההגעה'
        //    return false;
        //}
        //else if ($scope.dateuntil.getTime() >= $scope.dateFrom.getTime()) {
        //    $scope.validMessage = ""
        //}


    }

    $scope.goToActivities = function () {
        $rootScope.who = $scope.who
        if ($scope.checkAllFieldsFilled() == false) {
            //alert('עליך להשלים את כל המידע הנדרש על מנת להתקדם')
            console.log('not complete')
            $scope.showValidationTexts()
        }
        else {
            var peopleCsv = "";
            $.each($rootScope.personPicked, function (key, value) {
                if (value) {
                    peopleCsv += parseFloat(key + 1) + ',';
                }
            });
            //placetid: $scope.chosenPlaceData.DEST_TID
            console.log('trans to activities')
            $state.transitionTo('activities', { placetid: $rootScope.chosenPlaceData.DEST_TID, placename: $rootScope.chosenPlaceData.DEST_NAME, datefrom: dateFormat($scope.dateFrom, "dd.mm.yyyy"), dateuntil: dateFormat($scope.dateuntil, "dd.mm.yyyy"), people: peopleCsv, placeurl: $rootScope.chosenPlaceData.URL, isnewList: true, who: $rootScope.who });
        }

    }

    $scope.choosePerson = function (person, i) {

        $rootScope.personPicked[i] = !$rootScope.personPicked[i];
        $scope.checkAllFieldsFilled()
    }

    $scope.doFrom = function (index, num, checker) {
        switch (num) {
            case 1:
                if (!checker) {
                    $timeout(function () {
                        $scope.dateChosenArr[index] = true;
                    }, 0);
                }
                break;
            case 0:
                $timeout(function () {
                    $scope.dateChosenArr[index] = false;
                }, 0);
                break;
        }
        var x;
        $scope.checkAllFieldsFilled()

    }

    $scope.$on('dateChange', function (event, data) {
        var dateObj = data.data;
        var date = dateFormat(dateObj, "dd/mm/yyyy");
        var day = $rootScope.getHebrewDay(dateFormat(dateObj, 'dddd'))
        var time = dateFormat(dateObj, 'HH:MM')
        //if the date change is from 
        if (data.type.indexOf('from') > -1 && $rootScope.activeDatePicker.indexOf('from') > -1) {


            $timeout(function () {
                $scope.dateFrom = data.data
                $scope.dateFromStringToDisplay = date
                $scope.doFrom(0, 1, $scope.dateFrom)
            }, 0);


            $timeout(function () {
                $scope.startDate()
                $("#datetimepicker2").click()
            }, 10);
            //open the until datepicker
            //
        }
        else if (data.type.indexOf('until') > -1 && $rootScope.activeDatePicker.indexOf('until') > -1) {
            $scope.dateuntil = data.data

            $timeout(function () {
                $scope.dateUntilStringToDisplay = date
            }, 0);
            $scope.doFrom(1, 1, $scope.dateuntil)

            $scope.dateUntilChange()
        }


    });

    $scope.getPlacesByTerm = function () {

        $scope.placeTermByServer = false; //check if the user chose place from server - promise that the place has data
        $scope.checkAllFieldsFilled()
        if ($scope.placeTerm.length > 2) {
            $scope.showSpiner = true;
            $scope.shadow = true;
            server.request("api_dest_autocomplete", "&token=" + $rootScope.token + "&term=" + $scope.placeTerm + "&types=1,2,3&il=1&data_type=json").then(function (data) {
                $scope.showSpiner = false;
                var x = data;
                $scope.places = data.dests.dest;
                //if the user chose a place that not exist in the database
                if (!$scope.places) {
                    $scope.checkAllFieldsFilled()
                    $rootScope.chosenPlaceData = undefined;
                    //shoe the validation

                    //if there is no place
                    $scope.showPlaceValidation = true;

                }
                else {
                    //if there is no place
                    $scope.showPlaceValidation = false;
                }

            });
        }
        else {
            $scope.places = []
        }


    }
    $scope.chosenPlace = function (item) {
        $scope.placeTermByServer = true;
        //set the place name as the chosen place
        $rootScope.chosenPlaceData = item;
        $scope.placeTerm = item.DEST_DISPLAY_NAME
        $rootScope.isIsraelTravel = item.DEST_PARENT_TID == $rootScope.israelTid || item.DEST_TID == $rootScope.israelTid ? true : false;
        //clean the places list
        $scope.places = [];
        $scope.showAutocomplete = false
        $scope.checkAllFieldsFilled();
    }
} ])


$.log = function (message) {
    var $logger = $("#logger");
    $logger.html($logger.html() + "\n * " + message);
}

/*
document.getElementById("item_list").addEventListener("click", function (e) {
var target = e.target;

target.classList.toggle("iconize");
target.classList.toggle("iconize2");
}, false);
*/

//$scope.people = [
//    { "id": "1", "type": "אישה", "img": "img/woman-user-icon.png", "img-onClick": "img/woman-user-icon.png" },
//    { "id": "2", "type": "גבר", "img": "img/man-icon.png", "img-onClick": "img/man-icon.png" },
//    { "id": "3", "type": "ילד", "img": "img/icon-child.png", "img-onClick": "img/icon-child.png" },
//    { "id": "4", "type": "תינוק", "img": "img/baby.png", "img-onClick": "img/baby.png" }
//];


// $scope.places = [{ DEST_NAME: 'ברצלונה' }, { DEST_NAME: 'איסטנבול' }, { DEST_NAME: 'רומא' }, { DEST_NAME: 'ניו-יורק' }, { DEST_NAME: 'בולטימור' }, { DEST_NAME: 'בנקוק' }, { DEST_NAME: 'טוקיו' }, { DEST_NAME: 'לונדון' }, { DEST_NAME: 'סן-פרנסיסקו' }, { DEST_NAME: 'אילת' }, { DEST_NAME: 'קהיר' }, { DEST_NAME: 'עמאן' }, { DEST_NAME: 'פריז' }, { DEST_NAME: 'מינכן' }, { DEST_NAME: 'ברטיסלבה' }, { DEST_NAME: 'צענה' }, { DEST_NAME: 'ציריך' }, { DEST_NAME: 'פומפיי'}];
