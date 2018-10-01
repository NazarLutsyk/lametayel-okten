lametayel.controller('mylistsCtrl', ['$scope', '$http', '$timeout', '$stateParams', '$state', '$rootScope', '$filter', 'share', '$interval', 'analytics', 'server', function ($scope, $http, $timeout, $stateParams, $state, $rootScope, $filter, share, $interval, analytics, server) {

    //hide the datepicker - if the user come from new-trip page
    $(".bootstrap-datetimepicker-widget").hide()

    analytics.sendPageView('My_Lists')
    $rootScope.sendPageAppsee('my lists')

    $scope.pageClass = 'page-my-lists';
    $rootScope.mylist = true;
    $scope.indexToRemove = null;
    $scope.showOver = false;
    $scope.openMenuIndex = -1;


    $scope.initLists = function () {
        //if there are lists on storage - get it
        if (localStorage.getItem("listPlacesIds")) {
            $timeout(function () {
                $scope.placesList = JSON.parse(localStorage.getItem("listPlacesIds"))
            }, 0)

        }

    }
    $scope.initLists();
    //open category menu
    $scope.openCatMenu = function (activity, i, $event) {
        $scope.openMenuIndex = i;
        //$rootScope.openMask();
        $scope.showOver = true;
        $event.stopPropagation();
    }
    $scope.closeinner = function () {
        $scope.openMenuIndex = -1; $scope.showOver = false;
    }


    $scope.sharePlaceGeneral = function (item) {
        console.log(item);
        placeAns = 'השתמשתי באפליקציית למטייל כדי לתכנן את הנסיעה שלי ל';
        placeAns = placeAns + item.name + ', מהתאריך: ';
        placeAns = placeAns + item.startDate + ' עד ל:';
        placeAns = placeAns + item.endDate + '.';
        share.share({ title: placeAns });
        // $rootScope.$broadcast('shareList', { data: placeAns });
        console.log(placeAns);
    }

    $scope.closeCatMenu = function () {
        $scope.closeAllListMenu();
        //$rootScope.hideMask();
        $scope.openMenuIndex = -1;
        $scope.showOver = false;
    };

    $scope.removeListClick = function (item) {
        //remove the place from plcaes list array
        //detect the plcae index in the placesList array
        var placeIndex = $scope.placesList.map(function (obj) { return obj.id; }).indexOf(item.id);
        $scope.placeToRemove = { index: placeIndex, data: item };
        $rootScope.$broadcast('hideSubMenu');
        $rootScope.showDoubleCheck = true;
        //$rootScope.hideMask()
        //$('.doubleCheck').addClass('open');
        //$rootScope.hideMask();
        $scope.showOver = false;
        $scope.openMenuIndex = -1;

    }

    $scope.duplicateListClick = function (item) {
        //duplicate the list and create new one
        var duplicateData = angular.copy(item);
        var newListID = $rootScope.getRandomId();
        duplicateData.id = newListID;

        var listData = JSON.parse(localStorage.getItem("list" + item.id)).list
        //clear the checked items
        for (var i = 0; i < listData.length; i++) {
            if (listData[i].items) {
                for (var j = 0; j < listData[i].items.length; j++) {
                    listData[i].items[j].checked = false;
                }

            }

        }
        duplicateData.list = listData;
        //save the list data
        localStorage.setItem("list" + duplicateData.id, JSON.stringify(duplicateData))
        //create and save the new list
        var listPlacesIds = localStorage.getItem("listPlacesIds");
        //get the plcaes list arr
        listPlacesIdsArr = JSON.parse(listPlacesIds);
        listPlacesIdsArr.push(duplicateData);
        localStorage.setItem("listPlacesIds", JSON.stringify(listPlacesIdsArr))

        $scope.initLists()
        //$rootScope.hideMask();
        $scope.showOver = false;
        $scope.openMenuIndex = -1;

        $scope.updateNameAndDate(duplicateData)

    }

    $scope.removeList = function () {
        //remove from array
        $timeout(function () {
            $scope.placesList.splice($scope.placeToRemove.index, 1)
            //remove from list array
            localStorage.setItem("listPlacesIds", JSON.stringify($scope.placesList))
            //remove the list itself
            localStorage.removeItem("list" + $scope.placeToRemove.data.id)
            $scope.initLists()
        }, 0);




    }
    $scope.goToList = function (item) {
        $state.transitionTo('trip-list', { id: item.id, placetid: item.placetid, people: item.people, weather: item.weather, activities: item.activities });
        //$state.transitionTo('trip-list', { listIndex: index});
    }

    $scope.makeNewTrip = function () {
        $rootScope.clearListData()
        $state.transitionTo('new-trip')
        analytics.sendAnalyticsEvent('event', 'New_List_Btn')
    }

    $scope.getItOut = function (i) {
        //$('.doubleCheck').removeClass('open');
        $rootScope.showDoubleCheck = false;
        $scope.closeCatMenu();
        $scope.removeList()
    }

    $scope.closeDoubleCheck = function () {
        $rootScope.showDoubleCheck = false;
        $scope.closeCatMenu();
    }



    $scope.closeAllListMenu = function () {
        $('.list-menu').removeClass('open');
    }
    $scope.$on('hideSubMenu', function (event, data) {
        $scope.openMenuIndex = -1
    });


    $scope.initCompletePercents = function (list) {
        var completePercents = 0;
        if (JSON.parse(localStorage.getItem("list" + list.id))) {
            var itemsCheckedCounter = 0;
            var allItemsCounter = 0;
            var placeList = JSON.parse(localStorage.getItem("list" + list.id));
            if (placeList.list) {
                for (var i = 0; i < placeList.list.length; i++) {
                    if (placeList.list[i].deleted == false) {
                        var catItems = $filter('filter')(placeList.list[i].items, { recomanded: false }) //the cat items
                        var catItemsLength = $filter('filter')(catItems, { recomanded: false }).length//the cat items length - without recommanded
                        deletedCounter = $filter('filter')(catItems, { deleted: true }).length // remove the deleted from sum
                        catItemsLength = catItemsLength - deletedCounter; ;
                        allItemsCounter += catItemsLength;
                        itemsCheckedCounter += $filter('filter')(catItems, { checked: true, deleted: false }).length

                    }

                }
                completePercents = itemsCheckedCounter / allItemsCounter * 100
            }
        }
        list.percent = Math.round(completePercents);
        return completePercents;


    }



    $scope.updateNameAndDate = function (list) {
        var x = 5;
        $scope.listToUpdate = list;
        $rootScope.chosenPlaceData = undefined; //init the chosenPlace
        $scope.dateFrom = undefined;//init thr date from
        $scope.dateuntil = undefined;//init thr date from
        $timeout(function () {
           // $scope.showUpdatePoup = true;
                 $scope.showUpdatePoup = true;
                 $scope.$apply()
        }, 100)
                                     
                                     

        // $rootScope.placeDataToUpdate = $scope.listToUpdate.name;
        $scope.placeTerm = {}
        $scope.placeTerm.term = $scope.listToUpdate.name;
        $scope.placeTermByServer = $scope.listToUpdate.name;

        $scope.dateFromStringToDisplay = list.startDate
        $scope.dateUntilStringToDisplay = list.endDate
    }
                                     $scope.closeUpdateDatePopup = function(){
                                        $scope.showUpdatePoup =false
                                     }
    $scope.getPlacesByTerm = function () {

        $scope.placeTermByServer = false; //check if the user chose place from server - promise that the place has data
        $scope.checkAllFieldsFilled()
        if ($scope.placeTerm.term.length > 2) {
            $scope.showSpiner = true;
            $scope.shadow = true;
            server.request("api_dest_autocomplete", "&token=" + $rootScope.token + "&term=" + $scope.placeTerm.term + "&types=1,2,3&il=1&data_type=json").then(function (data) {
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
    $scope.gofocus = function (num) {
        $($('.geoInput')[num]).focus();
    }

    $scope.chosenPlace = function (item) {
        $scope.placeTermByServer = true;
        //set the place name as the chosen place
        $rootScope.chosenPlaceData = item;
        $scope.placeTerm.term = item.DEST_DISPLAY_NAME
        $rootScope.isIsraelTravel = item.DEST_PARENT_TID == $rootScope.israelTid || item.DEST_TID == $rootScope.israelTid ? true : false;
        //clean the places list
        $scope.places = [];
        $scope.showAutocomplete = false
        $scope.checkAllFieldsFilled();
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
        }, 500);

        //$scope.places = [];
    }

    $scope.checkAllFieldsFilled = function () {
        var completed = true;

        //to do: prevent contimnue if the place not chosen and if the user edit the place that he chose
        if (!$rootScope.chosenPlaceData || !$rootScope.chosenPlaceData.DEST_NAME) {
            $scope.canGoNext = false;
            completed = false;
            return false;
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


    $scope.saveChanges = function () {
        //if the place change
        var listPlacesIds = localStorage.getItem("listPlacesIds");
        //get the places list arr
        listPlacesIdsArr = JSON.parse(listPlacesIds);
        //find the item to update
        var listToUpdate = $filter('filter')(listPlacesIdsArr, { id: $scope.listToUpdate.id })[0];
        //detect the index
        var indexInArr = -1;
        for (var i = 0; i < listPlacesIdsArr.length; i++) {
            if (listPlacesIdsArr[i] && (listPlacesIdsArr[i].id == listToUpdate.id)) {
                indexInArr = i;
            }
        }
        if ($rootScope.chosenPlaceData) {
            //get the image from server -by placetid
            server.request("api_dest_img", "&token=" + $rootScope.token + "&tid=" + $rootScope.chosenPlaceData.DEST_TID + "&data_type=json").then(function (data) {

                $scope.placeImg = data.IMG.SRC
                //update the local storage - all list data by id


                //update the new name and data
                if ($rootScope.chosenPlaceData) {
                    $scope.listToUpdate.name = $rootScope.chosenPlaceData.DEST_NAME
                    $scope.listToUpdate.placetid = $rootScope.chosenPlaceData.DEST_TID
                    $scope.listToUpdate.placeurl = $rootScope.chosenPlaceData.URL

                }


                //update the new dates
                if ($scope.dateFrom) {
                    $scope.listToUpdate.startDate = dateFormat($scope.dateFrom, "dd/mm/yyyy")
                }
                if ($scope.dateuntil) {
                    $scope.listToUpdate.endDate = dateFormat($scope.dateuntil, "dd/mm/yyyy")
                }

                //update the img 
                $scope.listToUpdate.img = $scope.placeImg


                listPlacesIdsArr[indexInArr] = $scope.listToUpdate;

                //update the local storage - all lists
                localStorage.setItem("listPlacesIds", JSON.stringify(listPlacesIdsArr))

                //update the local storage -single list
                var id = $scope.listToUpdate.id;
                localStorage.setItem('list' + id, JSON.stringify($scope.listToUpdate));

                //refresh the lists in the page
                $scope.initLists()
                //close the popup
                //$scope.showUpdatePoup = false

                                                                                                                                                  $timeout(function () {
                                                                                                                                                           // $scope.showUpdatePoup = true;
                                                                                                                                                           $scope.showUpdatePoup = false;
                                                                                                                                                           $scope.$apply()
                                                                                                                                                           }, 0)

            });

        }
        else {
            //update the new dates
            if ($scope.dateFrom) {
                $scope.listToUpdate.startDate = dateFormat($scope.dateFrom, "dd/mm/yyyy")
            }
            if ($scope.dateuntil) {
                $scope.listToUpdate.endDate = dateFormat($scope.dateuntil, "dd/mm/yyyy")
            }
            listPlacesIdsArr[indexInArr] = $scope.listToUpdate;

            //update the local storage - all lists
            localStorage.setItem("listPlacesIds", JSON.stringify(listPlacesIdsArr))

            //update the local storage -single list
            var id = $scope.listToUpdate.id;
            localStorage.setItem('list' + id, JSON.stringify($scope.listToUpdate));

            //refresh the lists in the page
            $scope.initLists()
            //close the popup
           // $scope.showUpdatePoup = false
                                     $timeout(function () {
                                              // $scope.showUpdatePoup = true;
                                              $scope.showUpdatePoup = false;
                                              $scope.$apply()
                                              }, 0)
        }


    }
} ])
