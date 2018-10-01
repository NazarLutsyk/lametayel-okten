lametayel.controller('firstLevelCtrl', ['$scope', '$http', '$timeout', '$stateParams', '$state', '$rootScope', 'generalDetails', 'server', '$filter', 'share', 'pushnotification', 'analytics', function ($scope, $http, $timeout, $stateParams, $state, $rootScope, generalDetails, server, $filter, share, pushnotification, analytics) {
	//hide the datepicker - if the user come from new-trip page
	$(".bootstrap-datetimepicker-widget").hide()
	analytics.sendPageView('First_Creation_List')
	$rootScope.sendPageAppsee('first level')
	$rootScope.mylist = false;
	$scope.showLoadMoreLoader = false;
	$rootScope.showItemPage = false;
	$scope.showLoader = true;
	$scope.stopNext = false;
	$scope.limitLength = 3;
	$scope.repeatFrom = 0
	$scope.newActReturnFromServer = false;
	$rootScope.placeListData = {}
	$scope.Math = window.Math;
	$scope.changeTimeAmount = function () {
		str = $('#item-amount').val();
		if (str == '') {} else {
			str = parseInt(str);
			if (str != 0 && !str) {
				str = 0;
			}
		}
		$scope.itemAmount = str;
		if ((str == 0 || str == '0' || str == '1' || str == 1) && (str != '')) {
			$scope.iszero = true;
			$scope.itemAmount = 1;
		} else if (str.length == 0) {
			$scope.iszero = true;
		} else if (str == 0 || str == '0') {
			$scope.iszero = true;
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
			$scope.showLoader = false;
		}

		//else- check if the new act return from server
		else {
			if ($scope.newActReturnFromServer) {
				$scope.showLoader = false;
			}
		}
		//if the last categgory in first section loaded - get more categories
		//and show small loader
		if (isLast == true && $rootScope.placeListData.list.length != $scope.limitLength) {
			//joyride
			//$timeout(function () {
			//    $scope.startJoyRide = true;
			//}, 0);
			$timeout(function () {
				// $scope.showLoadMoreLoader = true;
				//console.log('scope.limitLength')
				$scope.limitLength = $rootScope.placeListData.list.length;
				$scope.repeatFrom = $scope.limitLength;
			}, 100);
		}
		//else - hide the small loader
		else {
			$scope.showLoadMoreLoader = false;
		}
	}
	//update the list length - for push objects to list
	$scope.updateListLength = function () {
		$scope.limitLength = $rootScope.placeListData.list.length;
		$scope.repeatFrom = $scope.limitLength;
	}
	$scope.setCustomCats = function () {
		var customCatsArray = $scope.customCats.split(',')
		for (var i = 0; i < customCatsArray.length; i++) {
			//get the custom cat id
			var catId = customCatsArray[i];
			//check if there is data for this category
			if (localStorage.getItem('customCat' + catId) && JSON.parse(localStorage.getItem('customCat' + catId))) {
				var thisCatExist = $filter('filter')($rootScope.placeListData.list, { id: catId });
				//if this cat NOT exist - add it
				if (thisCatExist && thisCatExist.length == 0) {
					//push it to the placeListData
					$rootScope.placeListData.list.push(JSON.parse(localStorage.getItem('customCat' + catId)))
				}
			}
		}
	}
	$scope.addNewActivitiesData = function (data) {
		//$rootScope.placeListData
		var allNewData = $scope.convertListFromServerToClientFormat(data);
		var oldData = $rootScope.placeListData.list
		//console.log(allNewData)
		//compare the new array with the old array and add the difference cats and items
		for (var i = 0; i < allNewData.length; i++) {
			var catObj = oldData.filter(function (item) {
				return (item.id == allNewData[i].id);
			});
			//if ita a new category - add it (not contain in the old categories)
			if (catObj.length == 0) {
				oldData.push(allNewData[i])
			}
			//if the category exist  -add the items
			else {
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
					//else {
					//   oldItems.concat(itemObj)
					//}
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
		$scope.listDataFromStorage = JSON.parse(localStorage.getItem("list" + $scope.listId));
		if ($scope.listDataFromStorage) {
			//set the general place info
			$rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId))
			//console.log($rootScope.placeListData);
			//set the packaging list
			if ($scope.listDataFromStorage.list) {
				//if the user come from add activity - get the new data from server and set only the new categories
				if ($rootScope.addActStatus) {
					var isIsraelTravel = $rootScope.isIsraelTravel ? 1 : 2; // 1- is in israel travel. 2- is an abroad
					// travel
					server.request("api_build_packing_list", "&token=" + $rootScope.token + "&packing_for=" + $scope.people + "&weather=" + $scope.weather + "&activities=" + $scope.activities + "&israel=" + isIsraelTravel + "&data_type=json").then(function (data) {
						$scope.newActReturnFromServer = true;
						$scope.checkBuildDomStatus()
						//console.log(data);
						// $scope.convertListFromServerToClientFormat(data);
						//get the past data
						$rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId));
						//add the new data:
						//add the new activities
						$scope.addNewActivitiesData(data)
					});
				} else {
					//console.log("data from storage")
					$rootScope.placeListData = JSON.parse(localStorage.getItem("list" + $scope.listId));
				}
				//add the new categories
				$scope.setCustomCats()
				$scope.saveChangesAndData()
			}
			//if the list NOT exist - get it from server
			else {
				var isIsraelTravel = $rootScope.isIsraelTravel ? 1 : 2; // 1- is in israel travel. 2- is an abroad
				// travel
				server.request("api_build_packing_list", "&token=" + $rootScope.token + "&packing_for=" + $scope.people + "&weather=" + $scope.weather + "&activities=" + $scope.activities + "&israel=" + isIsraelTravel + "&data_type=json").then(function (data) {
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
		share.share({ title: 'רשימת פריטים לאריזה', desc: innerAns });
	}
	$scope.createCatTextForShare = function (activity) {
		innerArr = activity.items;
		innerAns = '';
		var withTitle = false;
		for (i = 0; i < innerArr.length; i++) {

			//if the user not delete the item
			if (innerArr[i].deleted == false && innerArr[i].recomanded == false) {
				//add title in the first row - once
				if (withTitle == false) {
					innerAns += '**' + activity.name + '**' + '\n';
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
		var innerAns = "";
		for (var i = 0; i < $rootScope.placeListData.list.length; i++) {
			innerAns += $scope.createCatTextForShare($rootScope.placeListData.list[i]);
		}
		share.share({ title: innerAns });
	}
	$scope.getNotice = function () {
		ans = 'http://www.lametayel.co.il/%D7%9C%D7%90%D7%9F-%D7%94%D7%98%D7%99%D7%95%D7%9C-%D7%94%D7%91%D7%90-%D7%A9%D7%9C%D7%9A?dest=';
		ans = ans + $rootScope.placeListData.id + '&start_date=' + $rootScope.placeListData.startDate + '&end_date=' + $rootScope.placeListData.endDate;
		$rootScope.openLink(ans);

	}
	$scope.convertListFromServerToClientFormat = function (data) {
		if (data.ITEMS && data.ITEMS.ITEM) {
			var lastCatID = 0;
			var packingList = data.ITEMS.ITEM;
			$scope.convertedListArr = []; //the converted data array
			var convertedIndex = -1;
			for (var i = 0; i < packingList.length; i++) {
				if (lastCatID == packingList[i].CAT_ID) {
					$scope.addItemToConvertedlist(packingList[i], convertedIndex)
				} else {
					lastCatID = packingList[i].CAT_ID;
					++convertedIndex; // set the converted index
					//convertedListArr
					var newCatObj = {}
					newCatObj.id = packingList[i].CAT_ID;
					newCatObj.name = packingList[i].CAT_TITLE;
					newCatObj.deleted = false;
					newCatObj.items = [];
					newCatObj.recomanded = [];
					$scope.convertedListArr.push(newCatObj)
					$scope.addItemToConvertedlist(packingList[i], convertedIndex)
				}
			}
			//console.log($scope.convertedListArr)
			//set the info data by the new converted array
			//  $rootScope.placeListData.list = $scope.convertedListArr
			return $scope.convertedListArr
		}
	}
	$scope.addItemToConvertedlist = function (item, convertedIndex) {
		//the current cat -אריזה, ביגוד
		var currentCat = $scope.convertedListArr[convertedIndex];
		//the current item to add to cat - מזוודה, טרולי
		/**
		 * newItemInnerCat = the item that apears in new
		 *
		 * @recomanded = if the the item is recomended -
		 */
		var newItemInnerCat = {}
		newItemInnerCat.id = item.ITEM_ID;
		newItemInnerCat.name = item.ITEM_TITLE;
		newItemInnerCat.checked = false;
		newItemInnerCat.recomanded = item.ITEM_TYPE == "1" ? false : true;
		newItemInnerCat.recomandedOriginal = newItemInnerCat.recomanded;
		newItemInnerCat.deleted = false;
		newItemInnerCat.comment = "";
		newItemInnerCat.amount = 1;
		newItemInnerCat.notification = false;
		newItemInnerCat.dateToNotification = "";
		newItemInnerCat.hourToNotification = "";
		newItemInnerCat.link = item.SHOP_LINK;
		currentCat.items.push(newItemInnerCat);
	}
	$scope.initCompletePercents = function () {
		// (activity.items|filter:  ).length
		var itemsCheckedCounter = 0;
		var allItemsCounter = 0;
		if ($rootScope.placeListData.list) {
			for (var i = 0; i < $scope.placeListData.list.length; i++) {
				if ($scope.placeListData.list[i].deleted == false) {
					var catItems = $filter('filter')($scope.placeListData.list[i].items, { recomanded: false })
					var catItemsLength = $filter('filter')(catItems, { recomanded: false }).length
					var deletedCounter = $filter('filter')(catItems, { deleted: true }).length

					catItemsLength = catItemsLength - deletedCounter;
					allItemsCounter += catItemsLength;
					itemsCheckedCounter += $filter('filter')(catItems, { checked: true, deleted: false }).length
				}
			}
			$scope.completePercents = itemsCheckedCounter / allItemsCounter * 100
		}
	}
	//$scope.getCheckedNumber = function (catItems) {
	//    //getCheckedNumber(activity.items) + '/' + activity.items.length
	//    var checkedItemsCount = 0;
	//    var allItemsCounter = 0;
	//    if (catItems) {
	//        checkedItemsCount = $filter('filter')(catItems, {checked : true}).length
	//        allItemsCounter = $filter('filter')(catItems, {deleted: false}).length;
	//    }
	//    return checkedItemsCount+' / '+ allItemsCounter
	//}
	$scope.initData = function () {
		$scope.activities = $stateParams.activities;
		$scope.weather = $stateParams.weather;
		$scope.listId = $stateParams.id;
		$scope.placetid = $stateParams.placetid;
		$scope.people = $stateParams.people;
		$scope.customCats = $stateParams.customCats;
		$rootScope.addActStatus = $stateParams.byAddActivity == "true" ? true : false;
		$scope.getListCategoriesAndData();
		$scope.initCompletePercents()
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
	//if (localStorage.getItem('joyFlagFirst') == 'true') {
	//    $scope.noJoy = true;
	//} else {
	//    $scope.noJoy = false;
	//}
	$scope.listIndex = $stateParams.listIndex;
	//General vars
	$scope.pageClass = 'page-trip-list fristLevPage';
	//$scope.package = [];
	$scope.recommendedIsOpen = [];
	$scope.recommendedClose = function () {
		$('.recommended-list').hide();
	};
	//open category menu
	$scope.openCatMenu = function (activity, i) {
		$rootScope.hideMask()
		$scope.openMenuIndex = i;
		$rootScope.openMask();
		//  $('#activity-menu-' + i).addClass('open');
		//$('.overlay').addClass('open');
	};
	$scope.closeCatMenu = function (activity, i) {
		$rootScope.hideMask();
	};
	$scope.putter = function (str) {
		$scope.namer = str;
		//console.log($scope.namer);
	}
	//open info popup
	$scope.openInfoPopup = function () {
		$scope.openPopup = true;
		$rootScope.openMask();
	};
	$scope.closeInfoPopup = function () {
		$scope.openPopup = false;
		$rootScope.hideMask();
	};
	//remove item from list
	$scope.removeItem = function (activity, i, item) {
		//if the function has "item" object - return it to recomanded list
		//its has item object when come from html
		if (item) {
			item.recomanded = true;
			item.checked = false
		} else {
			activity.items[i].recomanded = true;
			activity.items[i].checked = false;
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
		//$timeout(function () {
		//    $('#item-' + item.id).find('.swiper').addClass("active");
		//}, 0);
		//$($(".swiper")[i]).addClass("active");
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
		item.checked = !item.checked;
		$scope.initCompletePercents();
	}
	//add item
	$scope.enterNewItem = function (activity, i) {
		$('#enter-item-' + i).addClass('hideText');
		$('#add-item-' + i).addClass('showInput');
		$('#add-item-' + i).focus();
	};
	$scope.addNewItem = function (activity, i, by) {
		$('#enter-item-' + i).removeClass('hideText');
		$('#add-item-' + i).removeClass('showInput');
		var customItem = {}
		if ($("#add-item-" + i).val() != '') {
			customItem = {
				"id": $rootScope.getRandomId(),
				"name": $("#add-item-" + i).val(),
				"checked": false,
				"deleted": false,
				"recomanded": false,
				"comment": "",
				"amount": "1",
				"notification": false,
				"dateToNotification": "",
				"hourToNotification": "",
				"link": "",
				"isNewItem": true
			}
			customItem.date = new Date().getTime().toString();
			activity.items.push(customItem);
			//if the user push item by enter - focuse the input for the next item
			if (by == 'enter') {
				$scope.enterNewItem(activity, i)
			}
			if (activity.isCustomCat) {
				$scope.setCustomItemInCustomCat(customItem, activity.id)
			}
		}
		$("#add-item-" + i).val('');
		$scope.saveChangesAndData()
		$scope.initCompletePercents();
	}
	//add category
	$scope.enterNewCategory = function () {
		$('#enter-category').addClass('hideText');
		$('#add-category').addClass('showInput');
		$('#add-category').focus();
	};
	//add custom category by client
	$scope.addNewCategory = function () {
		$('#enter-category').removeClass('hideText');
		$('#add-category').removeClass('showInput');
		var newCatObj = {}
		if ($("#add-category").val() != '') {
			newCatObj = {
				"id": $rootScope.getRandomId(),
				"name": $(".add-category").val(),
				"deleted": false,
				"items": [],
				"recomanded": [],
				"isCustomCat": true
			}
			$rootScope.placeListData.list.push(newCatObj);
			//add the cat to the storage - for the next places
			var customeCategoriesList;
			//if there is another custome categories - get them
			if (localStorage.getItem('customCategories') && JSON.parse(localStorage.getItem('customCategories'))) {
				customeCategoriesList = JSON.parse(localStorage.getItem('customCategories'));
			}
			//else - create the array
			else {
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
		$("#add-category").val('');
		$scope.addCategory = false;
		$scope.saveChangesAndData();
		$scope.initCompletePercents()
	}
	$scope.setCustomItemInCustomCat = function (customItem, catId) {
		//if there is the custom cat
		if (localStorage.getItem('customCat' + catId) && JSON.parse(localStorage.getItem('customCat' + catId))) {
			//add the item to the global custom category
			var tempCatObj = JSON.parse(localStorage.getItem('customCat' + catId));
			tempCatObj.items.push(customItem);
			//set the storage with the new item
			localStorage.setItem('customCat' + catId, JSON.stringify(tempCatObj));
		}
	}
	$scope.addLine = function () {
		$scope.addCategory = true;
	}
	//open recomended list
	$scope.openRecommended = function (activity, i) {
		$('#recommended-' + i).slideToggle(500);
		$scope.recommendedIsOpen[i] = !$scope.recommendedIsOpen[i];
		//if the user close the recommanded
		if ($scope.recommendedIsOpen[i] == false) {
			var nextActivityRecom = $("#recom" + parseInt(i));
		}
	}
	//toggle from recomended to main items
	$scope.toggleRecommandedItem = function (activity, item, i) {
		// if the user click item when joyride open - send analytics
		//if ($scope.noJoy == false) {
		//    analytics.sendAnalyticsEvent('event', 'Joyride_Stg_1')
		//}
		//else {
		//if is ios - scroll animation - for scroll flash
		//if (isIOS) {
		//    console.log('ios')
		//    item.date = new Date().getTime().toString();
		//    if ($scope.noJoy == false) {
		//    }
		//    else {
		//    }
		//    $timeout(function () {
		//        item.recomanded = !item.recomanded;
		//    }, 50);
		//}
		//if is android - scoll to the last point - for freez recommanded box
		//  else {
		console.log('android')
		item.date = new Date().getTime().toString();
		item.recomanded = !item.recomanded;
		// }
		//  }
		$scope.saveChangesAndData();
		$scope.initCompletePercents();
	};
	$scope.goToList = function () {
		analytics.sendAnalyticsEvent('event', 'Finish_List_Creation')
		$state.transitionTo('trip-list', {
			id: $rootScope.placeListData.id,
			placetid: $rootScope.placeListData.placetid,
			people: $rootScope.placeListData.people,
			weather: $rootScope.placeListData.weather,
			activities: $scope.activities
		});
	}
	//cat menu fuctions
	$scope.packageAll = function (activity, index) {
		//console.log(activity.items);
		for (var i = 0; i < activity.items.length; i++) {
			if (activity.items[i].recomanded == true) {} else if (activity.items[i].checked == false) {
				activity.items[i].checked = true;
			}
		}
		$scope.saveChangesAndData()
		$scope.initCompletePercents()
	};
	$scope.unPackageAll = function (activity, index) {
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
	$scope.hideAllCat = function (activity, index) {
		for (var i = 0; i < activity.items.length; i++) {
			if (activity.items[i].checked == true) {
				$scope.hideItem(activity, i)
			}
		}
		$scope.saveChangesAndData()
		$scope.initCompletePercents()
	};
	//remove item from list
	$scope.hideItem = function (activity, i) {
		//if the function has "item" object - set it to deleted
		//its has item object when come from html
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
			activity.items[i].checked = false;
			activity.items[i].deleted = false;
			activity.items[i].recomanded = activity.items[i].recomandedOriginal;
			activity.items[i].comment = "";
			activity.items[i].amount = "1";
			activity.items[i].notification = false;
			activity.items[i].dateToNotification = "";
			activity.items[i].hourToNotification = "";
			activity.items[i].link = "";
			if (activity.items[i].isNewItem == true) {
				activity.items.splice(i, 1);
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
					$scope.placeListData.list[i].items.splice(j, 1);
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
		console.log('trans to activities')
		$state.transitionTo('activities', {
			id: $scope.listId,
			placetid: $scope.placetid,
			placename: $scope.placeListData.name,
			datefrom: $scope.placeListData.startDate,
			endDate: $scope.placeListData.endDate,
			people: $scope.people,
			placeurl: $scope.placeListData.placeurl,
			activities: $scope.activities,
			weather: $scope.weather,
			customCats: $scope.customCats,
			isnewList: false
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
		//localStorage.setItem("joyFlagFirst", "true");
		//$scope.noJoy = true;
	}
	$scope.openHeaderMenu = function () {
		$rootScope.hideMask();
		$scope.showHeaderMenu = true;
		$rootScope.openMask();
	};
	$scope.$on('hideSubMenu', function (event, data) {
		$scope.openMenuIndex = -1
		$scope.showHeaderMenu = false;
		$scope.openPopup = false;
	});
	//backbtn click event.
	$scope.$on('backbtnclick', function (event, data) {
		//if the user in item page - hide it. else - go back
		if ($rootScope.showItemPage == true) {
			$state.transitionTo('my-lists');
		} else {
			//go to lists page
			$state.transitionTo('my-lists');
		}
	});
	$scope.showCustomCatPopup = false;
	$scope.closeCustomCatPopup = function () {
		$scope.showCustomCatPopup = false;
	}
	$scope.backToList = function () {
		//if the user come from triplist - return to it
		if ($scope.listDataFromStorage && $scope.listDataFromStorage.list) {
			$scope.goToList();
		}
		//else- return to create list -activivties
		else {
			$state.transitionTo('activities', {
				id: $scope.listId,
				placetid: $scope.placetid,
				placename: $scope.placeListData.name,
				datefrom: $scope.placeListData.startDate,
				endDate: $scope.placeListData.endDate,
				people: $scope.people,
				placeurl: $scope.placeListData.placeurl,
				activities: $scope.activities,
				weather: $scope.weather,
				customCats: $scope.customCats,
				isnewList: false
			});
		}
	}
	//$scope.textforJoyRide2 =
	//                        '<div class="inline-block joy-ride-text" style="padding-right:20px;">' +
	//                            '<span>הוסף פריטים על ידי לחיצה עליהם. בהמשך תוכל לעדכן כמויות. </span>' +
	//                        '</div>';
	//if the back joy ride click
	//$rootScope.prevJoyrideClick = function () {
	//    var activity = $scope.placeListData.list[0]
	//    //remove the item from !recomanded
	//    if (activity.items[0].recomanded == false) {
	//        activity.items[0].recomanded = true;
	//    }
	//}
	function openModalForDemo(shouldOpen) {
		if (!shouldOpen) {
			$scope.openRecommended({}, 0)
		}
	}

	//$scope.joyrideConfig = [
	//        {
	//            type: "element",
	//            advanceOn: { element: '.recommended-item:first', event: 'click' },
	//            selector: ".recommended-item:first",
	//            text: $scope.textforJoyRide2,
	//            scroll: true,
	//            placement: "top"
	//        }
	//    ];
}])
