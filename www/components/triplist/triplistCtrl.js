lametayel.controller('triplistCtrl', [
    '$scope',
    '$http',
    '$timeout',
    '$stateParams',
    '$state',
    '$rootScope',
    'generalDetails',
    'server',
    '$filter',
    'share',
    'pushnotification',
    'analytics',
    function ($scope, $http, $timeout, $stateParams, $state, $rootScope, generalDetails, server, $filter, share, pushnotification, analytics) {
        //hide the datepicker - if the user come from new-trip page
        $(".bootstrap-datetimepicker-widget")
            .hide()

        analytics.sendPageView('Second_Creation_List')
        $rootScope.sendPageAppsee('edit list')
        $rootScope.mylist             = false;
        $scope.showLoadMoreLoader     = false;
        $rootScope.showItemPage       = false;
        $scope.showLoader             = true;
        $scope.stopNext               = false;
        $scope.limitLength            = 3;
        $scope.repeatFrom             = 0
        $scope.newActReturnFromServer = false;
        $rootScope.placeListData      = {} //? $rootScope.placeListData.list = {} : ""
        $scope.Math                   = window.Math;
        $scope.changeTimeAmount       = function () {
            str = $('#item-amount')
                .val();
            if (str == '') {
            } else {
                str = parseInt(str);
                if (str != 0 && !str) {
                    str = 0;
                }
            }

            $scope.itemAmount = str;
            if ((str == 0 || str == '0' || str == '1' || str == 1) && (str != '')) {
                $scope.iszero     = true;
                $scope.itemAmount = 1;
            } else if (str.length == 0) {
                $scope.iszero = true;
            } else if (str == 0 || str == '0') {
                $scope.iszero     = true;
                $scope.itemAmount = 1;
            } else {
                $scope.iszero = false;
            }
            $scope.editItem.amount = $scope.itemAmount;
            $scope.saveChangesAndData();
        }

        $scope.blureTimeAmount = function () {
            if ($scope.iszero) {
                $timeout(function () {
                    $scope.itemAmount = 1;
                }, 0);

            }
        }

        $scope.checkBuildDomStatus = function (isLast) {
            //if its not an add act status- hide the loader
            if (isLast == true && !$rootScope.addActStatus) {
                $scope.showLoader = //else- check if the new act return from server
                    false;
            } else {
                if ($scope.newActReturnFromServer) {
                    $scope.showLoader = false;
                }
            }
            // if the last categgory in first section loaded - get more categories and show
            // small loader
            if (isLast == true && $rootScope.placeListData.list.length != $scope.limitLength) {
                //joyride
                $timeout(function () {
                    $scope.startJoyRide = true;
                }, 0);
                $timeout(function () {
                        // $scope.showLoadMoreLoader = true; console.log('scope.limitLength')
                        $scope.limitLength = $rootScope.placeListData.list.length;
                        $scope.repeatFrom  = $scope.limitLength;
                    }, 500 //else - hide the small loader
                );

            } else {
                $scope.showLoadMoreLoader = false;
            }
        }

        //update the list length - for push objects to list
        $scope.updateListLength = function () {
            $scope.limitLength = $rootScope.placeListData.list.length;
            $scope.repeatFrom  = $scope.limitLength;
        }

        $scope.setCustomCats            = function () {
            var customCatsArray = $scope
                .customCats
                .split(',')
            for (var i = 0; i < customCatsArray.length; i++) {
                //get the custom cat id
                var catId = customCatsArray[i];
                //check if there is data for this category
                if (localStorage.getItem('customCat' + catId) && JSON.parse(localStorage.getItem('customCat' + catId))) {
                    var thisCatExist = $filter('filter')($rootScope.placeListData.list, {
                        id: catId
                    });
                    //if this cat NOT exist - add it
                    if (thisCatExist && thisCatExist.length == 0) {
                        //push it to the placeListData
                        $rootScope
                            .placeListData
                            .list
                            .push(JSON.parse(localStorage.getItem('customCat' + catId)))
                    }

                }

            }

        }
        $scope.addNewActivitiesData     = function (data) {
            //$rootScope.placeListData
            var allNewData = $scope.convertListFromServerToClientFormat(data);
            var oldData    = $rootScope.placeListData.list
            // console.log(allNewData) compare the new array with the old array and add the
            // difference cats and items
            for (var i = 0; i < allNewData.length; i++) {
                var catObj = oldData.filter(function (item) {
                    return (item.id == allNewData[i].id);
                });
                //if ita a new category - add it (not contain in the old categories)
                if (catObj.length == 0) {
                    oldData.push(allNewData[i] //if the category exist  -add the items
                    )
                } else {
                    var newItems = allNewData[i].items
                    var oldItems = catObj[0].items
                    for (var itemIndex = 0; itemIndex < newItems.length; itemIndex++) {
                        var itemObj = oldItems.filter(function (item) {
                            return (item.name == newItems[itemIndex].name);
                        });
                        //if ita a new item - add it (not contain in the old items)
                        if (itemObj.length == 0) {
                            oldItems.push(newItems[itemIndex])
                        }
                        //else {   oldItems.concat(itemObj) }

                    }

                }
            }
            //set the new data to placeListData
            $timeout(function () {

                $rootScope.placeListData.list = oldData;
                $scope.updateListLength();
                $scope.saveChangesAndData()
            }, 0);

        }
        $scope.getListCategoriesAndData = function (data) {
            //console.log("getListCategoriesAndData")
            var listDataFromStorage = JSON.parse(localStorage.getItem("list" + $scope.listId));

            if (listDataFromStorage) {
                //set the general place info
                $rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId))
                //console.log($rootScope.placeListData); set the packaging list
                if (listDataFromStorage.list) {
                    // if the user come from add activity - get the new data from server and set
                    // only the new categories
                    if ($rootScope.addActStatus) {
                        var isIsraelTravel = $rootScope.isIsraelTravel ?
                            1 :
                            2; // 1- is in israel travel. 2- is an abroad travel

                        server
                            .request("api_build_packing_list", "&token=" + $rootScope.token + "&packing_for=" + $scope.people + "&weather=" + $scope.weather + "&activities=" + $scope.activities + "&israel=" + isIsraelTravel + "&data_type=json")
                            .then(function (data) {
                                $scope.newActReturnFromServer = true;
                                $scope.checkBuildDomStatus()
                                // console.log(data); $scope.convertListFromServerToClientFormat(data); get the
                                // past data
                                $rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId));
                                //add the new data: add the new activities
                                $scope.addNewActivitiesData(data)

                            });
                    } else {
                        //console.log("data from storage")
                        $rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId));
                    }
                    //add the new categories
                    $scope.setCustomCats()
                    $scope.saveChangesAndData( //if the list NOT exist - get it from server
                    )

                } else {
                    var isIsraelTravel = $rootScope.isIsraelTravel ?
                        1 :
                        2; // 1- is in israel travel. 2- is an abroad travel

                    server
                        .request("api_build_packing_list", "&token=" + $rootScope.token + "&packing_for=" + $scope.people + "&weather=" + $scope.weather + "&activities=" + $scope.activities + "&israel=" + isIsraelTravel + "&data_type=json")
                        .then(function (data) {
                            //console.log(data);
                            $rootScope.placeListData.list = $scope.convertListFromServerToClientFormat(data);

                            $scope.setCustomCats()
                            $scope.saveChangesAndData()

                        });
                }

            }

        }

        $scope.shareAct = function (activity) {

            var innerAns = $scope.createCatTextForShare(activity);
            share.share({
                title: 'רשימת פריטים לאריזה',
                desc : innerAns
            });

        }

        $scope.createCatTextForShare = function (activity) {
            innerArr      = activity.items;
            innerAns      = '';
            var withTitle = false;

            for (i = 0; i < innerArr.length; i++) {

                //if the user not delete the item
                if (innerArr[i].deleted == false && innerArr[i].recomanded == false) {
                    //add title in the first row - once
                    if (withTitle == false) {
                        innerAns += '**' + activity.name + '**\n';
                        withTitle = true
                    }
                    if (innerArr[i].checked) {
                        innerAns = innerAns + '[●]';

                    } else {
                        innerAns = innerAns + '[ ]';
                    }
                    innerAns = innerAns + innerArr[i].name + '\n'
                }

            }
            return innerAns;
        }

        $rootScope.sharePlace = function (item) {
            console.log('sharing..');
            var innerAns = "רשימה שיצרתי לקראת הטיול ל" + $rootScope.placeListData.name + " באפליקציית למטייל:" + "\n";
            for (var i = 0; i < $rootScope.placeListData.list.length; i++) {
                innerAns += $scope.createCatTextForShare($rootScope.placeListData.list[i]);

            }

            innerAns += "\n\n";
            innerAns += "רוצה גם ליצור רשימה? לחץ פה: http://onelink.to/m2fn5a";
            innerAns += "\n\n";

            share.share({
                title: innerAns
            });

        }

        $scope.getNotice = function () {
            ans = 'http://www.lametayel.co.il/%D7%9C%D7%90%D7%9F-%D7%94%D7%98%D7%99%D7%95%D7%9C-%D7' +
                '%94%D7%91%D7%90-%D7%A9%D7%9C%D7%9A?dest=';
            ans = ans + $rootScope.placeListData.id + '&start_date=' + $rootScope.placeListData.startDate + '&end_date=' + $rootScope.placeListData.endDate;
            $rootScope.openLink(ans);
            $scope.openPopup = false;
        }

        $scope.convertListFromServerToClientFormat = function (data) {
            if (data.ITEMS && data.Iitem) {
                var lastCatID           = 0;
                var packingList         = data.ITEMS.ITEM;
                $scope.convertedListArr = []; //the converted data array
                var convertedIndex      = -1;
                for (var i = 0; i < packingList.length; i++) {
                    if (lastCatID == packingList[i].CAT_ID) {
                        $scope.addItemToConvertedlist(packingList[i], convertedIndex)
                    } else {
                        lastCatID = packingList[i].CAT_ID;
                        ++convertedIndex; // set the converted index
                        //convertedListArr
                        var newCatObj        = {}
                        newCatObj.id         = packingList[i].CAT_ID;
                        newCatObj.name       = packingList[i].CAT_TITLE;
                        newCatObj.deleted    = false;
                        newCatObj.items      = [];
                        newCatObj.recomanded = [];
                        $scope
                            .convertedListArr
                            .push(newCatObj)
                        $scope.addItemToConvertedlist(packingList[i], convertedIndex)
                    }
                }
                // console.log($scope.convertedListArr) set the info data by the new converted
                // array  $rootScope.placeListData.list = $scope.convertedListArr
                return $scope.convertedListArr
            }
        }

        $scope.addItemToConvertedlist = function (item, convertedIndex) {
            //the current cat -אריזה, ביגוד
            var currentCat                     = $scope.convertedListArr[convertedIndex];
            //the current item to add to cat - מזוודה, טרולי
            var newItemInnerCat                = {}
            newItemInnerCat.id                 = item.ITEM_ID;
            newItemInnerCat.name               = item.ITEM_TITLE;
            newItemInnerCat.checked            = false;
            newItemInnerCat.recomanded         = item.ITEM_TYPE == "2" ?
                true :
                false; // if the item type=2 is a recommanded type. else- is main item
            newItemInnerCat.recomandedOriginal = newItemInnerCat.recomanded;
            newItemInnerCat.deleted            = false;
            newItemInnerCat.comment            = "";
            newItemInnerCat.amount             = 1;

            newItemInnerCat.notification       = false;
            newItemInnerCat.dateToNotification = "";
            newItemInnerCat.hourToNotification = "";
            newItemInnerCat.link               = item.SHOP_LINK;

            currentCat
                .items
                .push(newItemInnerCat);

        }
        $scope.initCompletePercents   = function () {
            // (activity.items|filter:  ).length
            var itemsCheckedCounter = 0;
            var allItemsCounter     = 0;
            if ($rootScope.placeListData.list) {
                for (var i = 0; i < $scope.placeListData.list.length; i++) {
                    if ($scope.placeListData.list[i].deleted == false) {
                        var catItems       = $filter('filter')($scope.placeListData.list[i].items, {
                            recomanded: false
                        }) //the cat items
                        var catItemsLength = $filter('filter')(catItems, {
                            recomanded: false
                        })
                            .length //the cat items length - without recommanded
                        deletedCounter     = $filter('filter')(catItems, {
                            deleted: true
                        })
                            .length // remove the deleted from sum
                        catItemsLength     = catItemsLength - deletedCounter;
                        ;
                        allItemsCounter += catItemsLength;
                        itemsCheckedCounter += $filter('filter')(catItems, {
                            checked: true,
                            deleted: false
                        })
                            .length

                    }

                }
                $scope.completePercents = itemsCheckedCounter / allItemsCounter * 100
            }

        }

        // $scope.getCheckedNumber = function (catItems) {
        // //getCheckedNumber(activity.items) + '/' + activity.items.length    var
        // checkedItemsCount = 0;    var allItemsCounter = 0;    if (catItems) {
        // checkedItemsCount = $filter('filter')(catItems, {checked : true}).length
        // allItemsCounter = $filter('filter')(catItems, {deleted: false}).length; }
        // return checkedItemsCount+' / '+ allItemsCounter }
        $scope.initData = function () {
            $scope.activities       = $stateParams.activities;
            $scope.weather          = $stateParams.weather;
            $scope.listId           = $stateParams.id;
            $scope.placetid         = $stateParams.placetid;
            $scope.people           = $stateParams.people;
            $scope.customCats       = $stateParams.customCats;
            $rootScope.addActStatus = $stateParams.byAddActivity == "true" ?
                true :
                false;
            $scope.getListCategoriesAndData();
            $scope.initCompletePercents()

            //attach click event on joyride 'understand'
            $('body')
                .on('click', '#nextBtn', function () {
                    analytics.sendAnalyticsEvent('event', 'Joyride_Stg_2')
                })

        }

        // $scope.initData()
        $timeout(function () {

            $scope.initData()
        }, 0);

        $scope.saveChangesAndData = function () {
            var infoString = JSON.stringify($rootScope.placeListData);
            localStorage.setItem("list" + $scope.listId, infoString)
        }
        $scope.saveChangesAndData()
        if (localStorage.getItem('joyFlag') == 'true') {
            $scope.noJoy = true;
        } else {
            $scope.noJoy = false;
        }

        $scope.listIndex = $stateParams.listIndex;

        //General vars
        $scope.pageClass        = 'page-trip-list';
        //$scope.package = [];
        $scope.recommendedClose = function () {
            $('.recommended-list')
                .hide();
        };

        //open category menu
        $scope.openCatMenu = function (activity, i) {
            // $rootScope.hideMask()
            $scope.openMenuIndex = i;
            $rootScope.openMask();
            $scope.showHeaderMenu = false;
            //  $('#activity-menu-' + i).addClass('open'); $('.overlay').addClass('open');
        };

        $scope.closeCatMenu = function (activity, i) {
            $rootScope.hideMask();

        };

        $scope.putter = function (str) {
            $scope.namer = str;
            //console.log($scope.namer);
        }

        $scope.openTravelInfo = function () {
            //close the info box
            $scope.closeInfoPopup();
            //open the link -if need- with the inappbrowser popup
            $rootScope.openLink($rootScope.placeListData.placeurl);

        }

        //open info popup
        $scope.openInfoPopup = function () {
            $scope.openPopup = true;
            $rootScope.openMask();

            // whenClickOutside($('info-popup'),$scope.closeInfoPopup);
            var container = $('info-popup');
            var onClickOutside = $scope.closeInfoPopup;
            $(document).on('mouseup',function(e)
            {
                // if the target of the click isn't the container nor a descendant of the container
                if($scope.openPopup)
                    if (!container.is(e.target) && container.has(e.target).length === 0)
                    {
                        onClickOutside();
                        $(document).off('mouseup')
                    }
            });
        };

        $scope.closeInfoPopup = function () {
            $scope.openPopup = false;
            $rootScope.hideMask();
            $(document).off('mouseup');
        };

        //remove item from list
        $scope.removeItem = function (activity, i, item) {
            // if the function has "item" object - return it to recomanded list its has item
            // object when come from html

            if (item) {
                item.recomanded = true;
                item.checked    = false
            } else {
                activity.items[i].recomanded = true;
                activity.items[i].checked    = false;

            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        $scope.returnItem = function (activity, i) {
            $timeout(function () {
                activity.items[i].deleted = false;
                $scope.saveChangesAndData()
                $scope.initCompletePercents()
            }, 0);

        };

        $scope.markAsPackage = function (activity, item, i) {
            // $timeout(function () {    $('#item-' +
            // item.id).find('.swiper').addClass("active"); }, 0);
            // $($(".swiper")[i]).addClass("active");
            $timeout(function () {
                if (item.checked == true) {
                    item.checked = false;
                } else {
                    item.checked = true;

                }

                $scope.saveChangesAndData()
                $scope.initCompletePercents()
            }, 0);

        };

        //back item to main list
        $scope.markAsNotPackage = function (activity, item, i) {
            // $timeout(function () {    $('#item-' +
            // item.id).find('.swiper').removeClass("active"); }, 0);
            if (item.checked == true) {
                item.checked = false;
            } else {
                item.checked = true;
            }
            $scope.initCompletePercents()
        }

        //add item
        $scope.enterNewItem = function (activity, i) {
            $('#enter-item-' + i)
                .addClass('hideText');
            $('#add-item-' + i)
                .addClass('showInput');
            $('#add-item-' + i)
                .focus();
        };

        $scope.addNewItem = function (activity, i, by) {
            $('#enter-item-' + i)
                .removeClass('hideText');
            $('#add-item-' + i)
                .removeClass('showInput');
            var customItem = {}
            if ($("#add-item-" + i)
                .val() != '') {
                customItem      = {
                    "id"                : $rootScope.getRandomId(),
                    "name"              : $("#add-item-" + i)
                        .val(),
                    "checked"           : false,
                    "deleted"           : false,
                    "recomanded"        : false,
                    "comment"           : "",
                    "amount"            : "1",
                    "notification"      : false,
                    "dateToNotification": "",
                    "hourToNotification": "",
                    "link"              : "",
                    "isNewItem"         : true
                }
                customItem.date = new Date()
                    .getTime()
                    .toString();

                activity
                    .items
                    .push(customItem);
                //if the user push item by enter - focuse the input for the next item
                if (by == 'enter') {
                    $scope.enterNewItem(activity, i)
                }

                if (activity.isCustomCat) {
                    $scope.setCustomItemInCustomCat(customItem, activity.id)
                }
            }

            $("#add-item-" + i)
                .val('');

            $scope.saveChangesAndData()
            $scope.initCompletePercents();

        }

        //add category
        $scope.enterNewCategory = function () {
            $('#enter-category')
                .addClass('hideText');
            $('#add-category')
                .addClass('showInput');
            $('#add-category')
                .focus();

        };

        //add custom category by client
        $scope.addNewCategory = function () {
            $('#enter-category')
                .removeClass('hideText');
            $('#add-category')
                .removeClass('showInput');
            var newCatObj = {}
            if ($("#add-category")
                .val() != '') {
                newCatObj = {
                    "id"         : $rootScope.getRandomId(),
                    "name"       : $(".add-category")
                        .val(),
                    "deleted"    : false,
                    "items"      : [],
                    "recomanded" : [],
                    "isCustomCat": true
                }
                $rootScope
                    .placeListData
                    .list
                    .push(newCatObj);

                //add the cat to the storage - for the next places
                var customeCategoriesList;
                //if there is another custome categories - get them
                if (localStorage.getItem('customCategories') && JSON.parse(localStorage.getItem('customCategories'))) {
                    customeCategoriesList = JSON.parse(localStorage.getItem('customCategories') //else - create the array
                    );
                } else {
                    customeCategoriesList = []
                }
                //enter the new custom cat to the array
                customeCategoriesList.push(newCatObj)
                //set the storage with the new one
                localStorage.setItem('customCategories', JSON.stringify(customeCategoriesList));
                localStorage.setItem('customCat' + newCatObj.id, JSON.stringify(newCatObj));

                //custom category popup
                if (!localStorage.getItem('customPopupDisplayed')) {
                    $scope.showCustomCatPopup = true;
                    localStorage.setItem('customPopupDisplayed', true)
                }

                //update the list length
                $scope.updateListLength()
            }

            $("#add-category")
                .val('');
            $scope.addCategory = false;
            $scope.saveChangesAndData();
            $scope.initCompletePercents()

        }

        $scope.setCustomItemInCustomCat = function (customItem, catId) {
            //if there is the custom cat
            if (localStorage.getItem('customCat' + catId) && JSON.parse(localStorage.getItem('customCat' + catId))) {
                //add the item to the global custom category
                var tempCatObj = JSON.parse(localStorage.getItem('customCat' + catId));

                tempCatObj
                    .items
                    .push(customItem);
                //set the storage with the new item
                localStorage.setItem('customCat' + catId, JSON.stringify(tempCatObj));
            }
        }

        $scope.addLine = function () {
            $scope.addCategory = true;
        }

        $scope.closeRecommended = function (activity, i) {

            //animation for close
            $('#recommended-' + i)
                .slideUp(500, function () {
                    activity.added = false;

                });

        }

        //open recomended list
        $scope.openRecommended = function (activity, i) {

            // toggle -open and close- the current item that click detect the offsetPosition
            // of the current item
            var currentRecommandedOffset = $('#recommended-' + i)
                .offset()

            //close the open item
            var openItem = $('.recommended-list:visible');
            if (openItem && openItem.length > 0) {

                //if the open Item is the current item that clicked - close it
                if (openItem.attr('id') == $('#recommended-' + i)
                    .attr('id')) {
                    $('#recommended-' + i)
                        .slideUp(500);
                    activity.added = false;
                } else {
                    var openItemOffsetTop      = openItem
                        .offset()
                        .top
                    var openItemHeight         = openItem.height()
                    var currentWindowScrollPos = $('body')
                        .scrollTop()
                    $('.recommended-list:visible')
                        .hide(0);

                    // scroll to the current reommanded - after that closee all the other open
                    // recomanded if the item that open is before the current item clicked -
                    if (openItemOffsetTop < currentWindowScrollPos) {
                        $('body')
                            .scrollTop(currentWindowScrollPos - openItemHeight - 20 //else if the item that open is after the current item clicked -
                            );
                    } else {
                        $('body')
                            .scrollTop(currentWindowScrollPos);
                    }
                    //open the recomanded that click
                    $('#recommended-' + i)
                        .slideToggle(500, function () {
                            var openedItems = $filter('filter')($rootScope.placeListData.list, {
                                added: true
                            });
                            for (var i = 0; i < openedItems.length; i++) {
                                console.log('da')
                                openedItems[i].added = false
                            }
                            $timeout(function () {
                                activity.added = true;
                            }, 0)

                        });

                }

            } else {
                //open the recomanded that click
                $('#recommended-' + i)
                    .slideDown(500);
                activity.added = true;
            }

        }

        //toggle from recomended to main items
        $scope.toggleRecommandedItem = function (activity, item, i, activityIndex) {
            //if the user click item when joyride open - freez it on not recomendad
            if ($scope.noJoy == false && item.recomanded == false) {
            } else {
                console.log('android')
                item.date      = new Date()
                    .getTime()
                    .toString();
                var scrollPos  = $('body')
                    .scrollTop();
                var itemHeight = $($("ul.items-activity li")[i])
                    .height() > 33 ?
                    $($("ul.items-activity li")[i])
                        .height() :
                    50;

                if (item.recomanded == true) {
                    //add the animation
                    if (isIOS) {
                        $timeout(function () {
                            $('body')
                                .scrollTop(scrollPos + itemHeight + 1)
                        }, 728)

                        $timeout(function () {
                            item.recomanded = !item.recomanded;

                        }, 600)
                        $scope.pushUpItemAnimation(activity, item, i, activityIndex)

                    } else {
                        $scope.pushUpItemAnimation(activity, item, i, activityIndex)
                        $timeout(function () {
                            item.recomanded = !item.recomanded;
                        }, 600) //if the item is recommanded - (it is in the list): scroll up
                    }

                } else {
                    item.recomanded = !item.recomanded;

                    if (isIOS) {
                        $timeout(function () {
                            $('body')
                                .scrollTop(scrollPos - itemHeight - 1)
                        }, 45)
                    } else {
                        $('body')
                            .scrollTop(scrollPos - itemHeight - 1)
                    }

                    //init the animation
                    $scope.initPushUpItemAnimation(activity, item, i, activityIndex)
                }

            }

            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        $scope.pushUpItemAnimation = function (activity, item, i, activityIndex) {
            item.show3d     = true;
            var activitObj  = $("#recom" + activityIndex);
            var allItems    = activitObj.find(".recommended-item");
            var clickedItem = $(allItems[i])

            var item3d            = clickedItem.find('.item3d');
            //get the  recomanded title position
            var recomOffset       = $('#recom' + activityIndex)
                .offset()
            //get the current item that click offset
            var clickedItemOffset = clickedItem.offset()
            var distance          = clickedItemOffset.top - recomOffset.top + 50;
            item.show3d           = true;
            //show the animation
            $timeout(function () {
                item3d.css('transform', 'translateY(-' + distance + 'px)')
                item3d.css('width', '200%')
            }, 100)
            //hide the animation
            $timeout(function () {
                item.show3d = false;
            }, 600)

        }

        $scope.initPushUpItemAnimation = function (activity, item, i, activityIndex) {
            var activitObj  = $("#recom" + activityIndex);
            var allItems    = activitObj.find(".recommended-item");
            var clickedItem = $(allItems[i])
            var item3d      = clickedItem.find('.item3d');
            item3d.css('transform', 'initial')
            item3d.css('width', '100%')

        }

        $scope.nextRecommended = function (activity, i) {
            $scope.openRecommended(activity, i);
            $timeout(function () {
                //get the next activity that not deleted get all the not deleted activities
                var activeActivities             = $filter('filter')($rootScope.placeListData.list, {
                    deleted: false
                });
                //get the original index
                var originalActivityIndex        = activeActivities.indexOf(activity);
                //get the next object
                var nextActivityInNotDeletedList = activeActivities[parseInt(originalActivityIndex + 1)];
                //get the next index in original list
                var nextActivityIndex            = $rootScope
                    .placeListData
                    .list
                    .indexOf(nextActivityInNotDeletedList);
                // var nextActivityRecom = $("#recom" + parseInt(i + 1));
                var nextActivityRecom            = $("#recom" + nextActivityIndex);
                if ($(nextActivityRecom)
                    .offset()) {
                    nextActivityRecomOffsetTop = $(nextActivityRecom)
                        .offset()
                        .top;
                    $('body')
                        .scrollTop(nextActivityRecomOffsetTop - 61 - nextActivityRecom.height());
                    $scope.openRecommended(activity, nextActivityIndex);
                }

            }, 510);

        }
        //addNotes
        $scope.addNotes        = function (item) {
            $rootScope.itemToEdit = item;
            // generalDetails.setItemToEdit(item);  $state.transitionTo('item');

            $rootScope.showItemPage = true;
            $scope.initItem(item)

            $rootScope.hideMask()
        };

        //cat menu fuctions
        $scope.packageAll = function (activity, index) {
            //console.log(activity.items);
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].recomanded == true) {
                } else if (activity.items[i].checked == false) {
                    activity.items[i].checked = true;
                }
            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        $scope.unPackageAll           = function (activity, index) {
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].checked == true) {
                    activity.items[i].checked = false;
                }
            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };
        //unpackage all the categories items
        $scope.unPackageAllCategories = function () {
            for (var i = 0; i < $scope.placeListData.list.length; i++) {
                $scope.unPackageAll($scope.placeListData.list[i])
            }
            $rootScope.hideMask()
        }
        //hide all items in single category
        $scope.hideAllCat             = function (activity, index) {
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].checked == true) {
                    $scope.hideItem(activity, i)

                }

            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        //remove item from list
        $scope.hideItem               = function (activity, i) {
            // if the function has "item" object - set it to deleted its has item object
            // when come from html

            activity.items[i].hidden = true;

            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };
        //hide all the categories items
        $scope.hideAllCategoriesItems = function () {
            for (var i = 0; i < $scope.placeListData.list.length; i++) {
                $scope.hideAllCat($scope.placeListData.list[i])
            }
            $timeout(function () {
                $scope.showReturn = true;
            }, 0);

            $rootScope.hideMask()
        }

        //return all items in single category
        $scope.returnAllCatFromHide = function (activity, index) {
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].hidden == true) {
                    activity.items[i].hidden = false

                }

            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        //return all the categories items
        $scope.returnAllItemsCategories = function () {
            for (var i = 0; i < $scope.placeListData.list.length; i++) {
                $scope.returnAllCatFromHide($scope.placeListData.list[i])
            }
            $scope.showReturn = false;
            $rootScope.hideMask()
        }

        $scope.resetAllCat = function (activity, index) {
            for (var i = 0; i < activity.items.length; i++) {
                activity.items[i].checked            = false;
                activity.items[i].deleted            = false;
                activity.items[i].recomanded         = activity.items[i].recomandedOriginal;
                activity.items[i].comment            = "";
                activity.items[i].amount             = "1";
                activity.items[i].notification       = false;
                activity.items[i].dateToNotification = "";
                activity.items[i].hourToNotification = "";
                activity.items[i].link               = "";

                if (activity.items[i].isNewItem == true) {
                    activity
                        .items
                        .splice(i, 1);
                }

            }

        };

        $scope.checkIfResetAllCategoriesLists = function () {
            $scope.showResetCatPopup = true;
        }

        $scope.resetAllCategoriesLists = function () {
            $scope.showResetCatPopup = false;

            for (var i = 0; i < $scope.placeListData.list.length; i++) {
                for (var j = 0; j < $scope.placeListData.list[i].items.length; j++) {
                    if ($scope.placeListData.list[i].items[j].isNewItem === true) {
                        $scope
                            .placeListData
                            .list[i]
                            .items
                            .splice(j, 1);
                    }
                }

                //reset the category data
                $scope.placeListData.list[i].deleted = false;
                //reset the category items data
                $scope.resetAllCat($scope.placeListData.list[i])
            }

            $rootScope.hideMask()
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        }

        $scope.addActivities = function () {
            $rootScope.hideMask()
            //add activity by activities page
            console.log('trans to activities');
            $state.transitionTo('activities', {
                id        : $scope.listId,
                placetid  : $scope.placetid,
                placename : $scope.placeListData.name,
                datefrom  : $scope.placeListData.startDate,
                endDate   : $scope.placeListData.endDate,
                people    : $scope.people,
                placeurl  : $scope.placeListData.placeurl,
                activities: $scope.activities,
                weather   : $scope.weather,
                customCats: $scope.customCats,
                isnewList : false
            });

        }

        $scope.restoreItems = function (activity, index) {
            for (var i = 0; i < activity.items.length; i++) {
                if (activity.items[i].deleted == true) {
                    activity.items[i].deleted = false;
                }
            }
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        $scope.removeCategory = function (activity, i) {
            //console.log(activity.deleted);
            activity.deleted = true;
            $scope.saveChangesAndData()
            $scope.initCompletePercents()
        };

        $scope.onFinish = function () {
            localStorage.setItem("joyFlag", "true");
            $scope.noJoy = true;

            //console.log(localStorage.getItem('joyFlag'));
        }

        $scope.openHeaderMenu = function () {
            $scope.openMenuIndex  = -1
            //   $rootScope.hideMask();
            $scope.showHeaderMenu = true;
            $rootScope.openMask();
        };

        $scope.$on('hideSubMenu', function (event, data) {
            $scope.openMenuIndex  = -1
            $scope.showHeaderMenu = false;
            $scope.openPopup      = false;
        });
        //backbtn click event.
        $scope.$on('backbtnclick', function (event, data) {
            //if the user in item page - hide it. else - go back

            if ($rootScope.showItemPage == true) {
                $scope.backToList()
            } else {
                //go to lists page
                $state.transitionTo('my-lists');
            }
        });

        $scope.showCustomCatPopup  = false;
        $scope.closeCustomCatPopup = function () {
            $scope.showCustomCatPopup = false;
        }

        $scope.textforJoyRide2      = '<div class="inline-block joy-ride-icon" ><span class="iconfont icon-tap1"></span' +
            '></div><div class="inline-block joy-ride-text" style="padding-right:20px;"><span' +
            '>בחר מתוך רשימת פריטים מומלצים אשר הותאמו במיוחד עבורך</span></div>';
        //if the back joy ride click
        $rootScope.prevJoyrideClick = function () {
            var activity = $scope.placeListData.list[0]
            //remove the item from !recomanded
            if (activity.items[0].recomanded == false) {

                activity.items[0].recomanded = true;
            }
        }

        function openModalForDemo(shouldOpen) {
            if (!shouldOpen) {
                $scope.openRecommended({}, 0)
            }

        }

        $scope.textforJoyRide2 = '- לחיצה על הריבוע שמימין לשם הפריט מאפשרת לך לסמן פריט לאחר שארזת.<br> - לחיצה ע' +
            'ל כפתור האפשרויות נוספות שבצד השמאלי של שורת הפריט מאפשרת לך לשנות כמויות, להוסי' +
            'ף הערות, תזכורות ועוד.<br> - להסרה מהרשימה – החלק ימינה.'
        $scope.joyrideConfig   = [

            {
                type     : "element",
                advanceOn: {
                    element: '.animate-repeat:first-child .icon-more_vert, .item-hover-checked',
                    event  : 'click'
                },
                selector : ".animate-repeat:first",
                text     : $scope.textforJoyRide2,
                scroll   : true,
                placement: "top"
            }
        ];

        $scope.reOpenJoyride = function () {
            //joyride
            $timeout(function () {
                $scope.startJoyRide = true;
                $scope.noJoy        = false;
                $rootScope.hideMask()
            }, 0);
        }

        $scope.goToFirstLevel = function () {
            $rootScope.hideMask()
            $state.transitionTo('first-level-list', {
                id        : $scope.listId,
                placetid  : $scope.placetid,
                people    : $scope.people,
                weather   : $scope.weather,
                activities: $scope.activities,
                customCats: $scope.customCats
            });

        }

        /********item page**************/
        $scope.editItem = $rootScope.itemToEdit; //generalDetails.getItemToEdit();
        $scope.pageClass = 'page-item';
        $scope.editNote  = false;
        $scope.initItem  = function (item) {
            $scope.editItem = item;

            if ($scope.editItem.comment != '') {
                $('.add-note')
                    .css('border', '0');
                $scope.editNote = true;
            } else {
                $scope.editNote = false;
            }

            $("#add-note")
                .val('' + $scope.editItem.comment);
            myInt = parseInt($scope.editItem.amount);
            if (!myInt) {
                myInt = 1;
            }
            $scope.itemAmount = myInt;
            $scope.iszero     = ($scope.itemAmount <= 1);
            if ($scope.editItem.notification == true) {
            } else {
                $scope.editItem.dateToNotification = ""; //init the reminder time
            }
            //console.log($scope.editItem);

        }

        $scope.minusItem = function () {
            if ($scope.itemAmount <= 1) {
                return;
            }
            $scope.itemAmount--;
            if ($scope.itemAmount <= 1) {
                $scope.iszero = true;
            }
            $scope.editItem.amount = $scope.itemAmount;
            $scope.saveChangesAndData()
        }

        $scope.plusItem = function () {
            $scope.iszero = false;
            $scope.itemAmount++;
            $scope.editItem.amount = $scope.itemAmount;
            $scope.saveChangesAndData()
        }

        $scope.backToList = function () {
            // window.history.back();
            $timeout(function () {

                $rootScope.showItemPage = false;
            }, 0);

        }

        $scope.deleteItem = function () {
            $scope.editItem.deleted = true;
            $scope.saveChangesAndData();
            $scope.showDeleteItemCancelPoup = true;
            $timeout(function () {
                $rootScope.showItemPage = false;
            }, 0);
            $timeout(function () {
                $scope.showDeleteItemCancelPoup = false;
            }, 2500);
        }

        $scope.deleteItemCancel = function () {
            $scope.editItem.deleted         = false;
            $scope.showDeleteItemCancelPoup = false;
            $scope.saveChangesAndData()
        }

        //add note
        $scope.enterNote = function () {
            $scope.editNote = true;
            $('.add-note')
                .css('border-bottom', '2px solid #f2b749'); //$('#add-note').focus();
        };

        $scope.addNewNote = function () {
            // $scope.moveFinger('closeTutorial'); $scope.editTutorialExplain = "לחץ בשביל
            // לחזור לדף הקודם";
            $scope.editItem.comment = $("#add-note")
                .val();
            $scope.saveChangesAndData();
            $('.add-note')
                .css('border', '0');
        }

        //change item name
        $scope.enterItemName = function () {
            $('#enter-item-name')
                .addClass('hideText');
            $('#change-item-name')
                .addClass('showInput');
            $('#change-item-name')
                .focus();
            $("#change-item-name")
                .val('' + $scope.editItem.name);
        };

        $scope.changeItemName = function () {
            $('#enter-item-name')
                .removeClass('hideText');
            $('#change-item-name')
                .removeClass('showInput');
            if ($("#change-item-name")
                .val() != '') {
                $scope.editItem.name = $("#change-item-name")
                    .val();
            }
            $("#change-item-name")
                .val('');
        }

        /*for textarea auto resize*/
        var textarea = document.querySelector('textarea');

        textarea.addEventListener('keyup', autosize);

        function autosize() {
            var el = this;
            setTimeout(function () {
                // el.style.cssText = 'height:auto; padding:5px 0'; for box-sizing other than
                // "content-box" use: el.style.cssText = '-moz-box-sizing:content-box';
                el.style.cssText = 'height:' + el.scrollHeight + 'px';
            }, 0);
        }

        /*end for textarea auto resize*/

        /*****reminder******/

        //date changed - set the reminder
        $scope
            .$on('dateChange', function (event, data) {
                var dateObj             = data.data;
                var date                = dateFormat(dateObj, "dd/mm/yyyy");
                var day                 = $rootScope.getHebrewDay(dateFormat(dateObj, 'dddd'))
                var time                = dateFormat(dateObj, 'HH:MM')
                var dateStringToDisplay = "יום " + day + " " + date + " ב- " + time
                $timeout(function () {
                    $scope.editItem.notification       = true;
                    $scope.editItem.dateToNotification = dateStringToDisplay;
                }, 0);

                //add reminder
                $scope.addReminder(dateObj)

            });

        $scope.addReminder    = function (dateObj) {

            try {
                var now                     = new Date()
                var pushID                  = now.getTime()
                $scope.editItem.pushNotifId = pushID;
                //push the reminder- send date and text to push
                pushnotification.push({
                    id  : $scope.editItem.pushNotifId,
                    date: dateObj,
                    text: $scope.editItem.name
                })

            } catch (e) {
                console.log('push fail')
            }
            $scope.saveChangesAndData()
        }
        $scope.cancelReminder = function (item) {
            //init the item notification data
            $scope.editItem.notification       = false;
            //init the date string
            $scope.editItem.dateToNotification = "";

            try {
                //push the reminder- send date and text to push
                pushnotification.removePush({
                    id: $scope.editItem.pushNotifId
                })
            } catch (e) {
                console.log('push cancel fail')
            }

            $scope.saveChangesAndData()
        }


        $scope.openReminderPopup = function () {
            $rootScope.$broadcast('showPopup', {
                item: 'safasf',
                type: "remind"
            });
        }


        /** Tutorial scripts*/
        // tutorial actions Tutorial start
        function initOverlay() {
            $scope.showList             = true;
            $scope.tuturialAction       = 1
            $scope.showHeaderMenu       = false;
            $scope.show_myOverlay       = false;
            //tutorial item checkbox
            $scope.is_tutorialChecked   = false;
            //open item-page custom to tutorial
            $scope.showTutorialItemEdit = false;
            $scope.tutorial_item        = 1;
            //init desc to the tutorial action
            $scope.tutorialExplain      = "לחץ בשביל לסמן את הפריט כארוז";
            //finger icon animation class name point/swipe
            $scope.fingerAnimation      = "point";
            //show all the activies in the list
            $(".activity").show();
            //tutorial page item
            $scope.pageTitle            = "הדגמה";
            $scope.is_tutorialEditTitle = false;
            $scope.editTutorialExplain  = "";
        }

        initOverlay();
        //open the overlay and hide all the activities behind
        $scope.openTutorial = function () {
            $scope.show_myOverlay = true;
            $scope.showList       = false;
        }

        /** Tutorial action 1 : mark item as checked */
        $scope.tutorialMarkAsChecked = function () {
            $scope.is_tutorialChecked = !$scope.is_tutorialChecked;
            $scope.tutorialExplain    = "לחץ בשביל לערוך את הפריט";
            $scope.tuturialAction     = 2;
        }

        /** Tutorial action 2 : open EDIT page */
        $scope.showEditTutorial = function () {
            $scope.showTutorialItemEdit = true;
            $timeout(function () {
                $scope.moveFinger();
            });
        }

        /**
         tutorialEditElements: array of edit page Dom elements
         id    - element id
         title - edit page current edit action description
         */
        $scope.tutorialEditElements = [
            {
                id   : "nameEdit",
                title: "אפשר לשנות את שם הפריט על ידי לחיצה על החלק העליון של המסך"
            },
            {
                id   : "item-amount",
                title: "כאן אפשר לשנות כמות הפריטים שרוצים לארוז"
            },
            {
                id   : "datetime",
                title: "ניתן לקבוע תזכורת לפריט על ידי לחיצה על תזכורת"
            },
            {
                id   : "add-note",
                title: "לחיצה על הערות לעצמי מאפשר להוסיף הערות לכל פריט. שלא תשכחו כלום!"

            }, {
                id   : "closeTutorial",
                title: ""

            }];
        $scope.tutorialEditindex = 0;
        //move the finger to point on edit item tutorial elemets
        $scope.moveFinger        = function () {
            var target_Id              = $scope.tutorialEditElements[$scope.tutorialEditindex].id;
            var explain                = $scope.tutorialEditElements[$scope.tutorialEditindex].title;
            $scope.tutorialEditindex += 1;
            var spaceFromTop           = 15;
            //set the tutorial title
            $scope.editTutorialExplain = explain;
            /**
             Description elements
             */
            var descWrapper            = $(".itemPageTutorial #tutorialEditDescription");
            var descArrow              = $(".itemPageTutorial #tutorialEditDescription #arrowUp");
            var descArrowWidth         = descArrow[0].getBoundingClientRect().width;
            //Listen to index change , move finger when index is changed to avoid  set worng position to the finger
            $scope.$watch('tutorialEditindex', function () {
                var targetRect = $(".itemPageTutorial  #" + target_Id)[0].getBoundingClientRect();
                descWrapper.offset({
                    top: targetRect.bottom + spaceFromTop
                });
                descArrow.offset({
                    left: targetRect.left - descArrowWidth / 2 + targetRect.width / 2
                })
                ;
                //configure spacial cases - datetime and add note , set new x position
                switch (target_Id) {
                    case 'datetime':
                    case 'add-note':
                        descArrow.offset({
                            left: targetRect.left - descArrowWidth / 2 + targetRect.width / 1.25
                        });
                        break;
                    default:
                        break;
                }

            });

            if (target_Id == "closeTutorial") {
                $scope.closeEditTutorial();
                $scope.tutorialEditindex = 0;
            }
        }
        /** Tutorial action 3 : swipe to remove item*/
        $scope.closeEditTutorial = function () {
            $scope.showTutorialItemEdit = false;
            $scope.fingerAnimation      = "swipe";
            $scope.tutorialExplain      = "גרור את הפריט  בשביל למחוק ";
            $scope.tuturialAction       = 3;

        }
        //close the tutorial and reinit ;
        $scope.closeOverlay = function () {
            initOverlay();
        }

        // close tut when the user swipe item left or right
        $scope.onSwipeTut = function () {
            initOverlay()
        }

        //Cehck if it first time  launching the app to show the tutorial
        if (!localStorage.getItem('showTutorialFirstTime')) {
            $scope.openTutorial();
            localStorage.setItem("showTutorialFirstTime", "true");

        }

    }
]);

function maxLengthCheck(object) {
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

function isNumeric(evt) {
    var theEvent = evt || window.event;
    var key      = theEvent.keyCode || theEvent.which;
    key          = String.fromCharCode(key);
    var regex    = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault)
            theEvent.preventDefault();
    }
}
