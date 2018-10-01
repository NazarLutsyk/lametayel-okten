
'use strict';

angular.module('itemSwipe', ['ngTouch'])
  .directive('itemSwipe', ['$swipe', '$document', '$window', '$timeout', 'generalDetails',
    function ($swipe, $document, $window, $timeout, generalDetails) {
        return {
            transclude: true,
            template: '<div class="item-swipe-wrapper" style="position: relative">' +
                    '<div class="swiper" ng-style="swiperStyle" ng-transclude style="position: relative"></div>' +
                    '<div class="undo-div" ng-style="undoStyle" ng-click="proceed = false; $event.stopPropagation();">' +
                    '<div class="right_side undo-name">נמחק {{namer}}</div>' +
                    '<div class="left_side undo"><span class="iconfont icon-undo"></span><span>בטל</span></div>' +
                    '</div>' +
                  '</div>',

            link: {
                post: function postLink(scope, iElement, iAttrs, controller) {
                    var startCoords, threeD, $swiper;
                    $swiper = angular.element('.swiper', iElement);
                    scope.proceed = false;
                    scope.undoStyle = {
                        display: 'none',
                        //'z-index': '999999',
                        //width: '100%',
                        //height: '100%',
                        //position: 'absolute',
                        ////'border-radius': '6px',
                        //bottom: '0px',
                        //padding: '20px',
                        //color: '#fff',
                        //background: 'rgba(0,0,0,0.9)',
                        //right: '0',
                        //left: '0',
                        //margin: 'auto',
                       // 'text-align': 'center'
                    };

					var flagRight;
					var flagLeft;

                    function fullSwipe(coords) {
						if (flagLeft){
							return startCoords.x - coords.x > $swiper.width() * (1 / 3) ? true : false;
                            //return startCoords.x - coords.x > $swiper.width() * (1 / 5) ? true : false;
						} 
						else {
							return coords.x - startCoords.x > $swiper.width()*(1/3) ? true : false;
                            //return coords.x - startCoords.x > $swiper.width()*(1 / 5) ? true : false;
						}
                        
                    }
					

                    function cssPrefix(property, value) {
                        var vendors = ['', '-o-', '-moz-', '-ms-', '-khtml-', '-webkit-'];
                        var styles = {};
                        for (var i = vendors.length - 1; i >= 0; i--) {
                            styles[vendors[i] + property] = value;
                        }
                        return styles;
                    }

                    function updateElementPosition(pos) {
                        if ('threeD' in iAttrs) {
                            $swiper.css(cssPrefix('transform', 'translate(' + pos + 'px)'));
                        } else {
                             console.log('flagLeft:' +flagLeft)
                           if (flagLeft){
							   $swiper.css('right', pos);
                               $swiper.css('left', 'initial');
							} 
						   else {
							   $swiper.css('left', pos);
                               $swiper.css('right', 'initial');
							}
                        }
						
						
                    }
					


                    scope.$watch('proceed', function (val) {
                        if (val) {
                            $("#startJoyRide").trigger("joyride:next")
                            scope.undoStyle.display = 'block';
                            scope.eliminateItem = $timeout(function () {
                                scope.proceed = false;
                                return scope.$eval(iAttrs.onRemove);
                            }, 2200);
                        } else {
                            scope.undoStyle.display = 'none';
                            $timeout.cancel(scope.eliminateItem);
                            updateElementPosition(0);
							//$(($swiper.prevObject)[0]).removeClass('itemDelete');

                        }
                    });

                    $swipe.bind($swiper, {
                        'start': function (coords) {
                            scope.namer = $($($($swiper.prevObject)[0]).find('span.theItemName')).html();
                            startCoords = coords;
                            scope.swiperStyle = { opacity: 0.5 };
                            scope.$apply();
                            //prevent body scroll - the scroll freeze the swipe
                           // $('body').css('overflow-y','hidden')
                        },
                        'cancel': function () {
                            scope.swiperStyle = cssPrefix('transition', 'all 0.2s ease-in-out');
                            scope.swiperStyle.opacity = 1;
                            scope.proceed = false;
                            updateElementPosition(0);
                            scope.$apply();
                        },
                        'move': function (coords) {
							if((startCoords.x - coords.x) < 0){
								
								
								flagRight = true;
								flagLeft = false;
                                // console.log('flagLeft:' +flagLeft)
                                updateElementPosition(coords.x - startCoords.x);
							}
							else{
								
								flagRight = false;
								flagLeft = true;
                                 // console.log('flagLeft:' +flagLeft)
                                updateElementPosition(startCoords.x - coords.x);
							}
                            
                        },
                        'end': function (endCoords) {
                            if (fullSwipe(endCoords)) {
								//$(($swiper.prevObject)[0]).addClass('itemDelete');
                                scope.proceed = true;
                                updateElementPosition($document.width());
                            } else {
                                scope.proceed = false;
                                updateElementPosition(0);
								
                            }
                            scope.swiperStyle = cssPrefix('transition', 'right 0.2s ease-in-out');
                            scope.swiperStyle.opacity = 1;
                            scope.$apply();
                            //return body scroll - the scroll freeze the swipe
                           // $('body').css('overflow-y','auto')
                        }
                    });
                }
            }
        };
    } ]);
