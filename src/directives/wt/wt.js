lametayel.directive('wt', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
	return {
		restrict   : 'E',
		templateUrl: './directives/wt/wt.html',
		link       : function (scope, el, attrs) {
			scope.showWT = true;

			//check if the user sen WT
			scope.checkIfDisplayWT = function () {
				if (localStorage.getItem('WTSeen')) {
					scope.showWT = false;
				}
			}

			//scope.checkIfDisplayWT()
			var swiper;
			scope.initSwiper = function () {
				swiper = new Swiper('.swiper-container', {
					grabCursor         : true,
					loop               : false,
					paginationClickable: true,
					pagination         : '.swiper-pagination',
					onInit             : function (swiper) {
						$('.direct-wt .inner-picture').addClass('start-animation');
					},
					onSlideChangeEnd   : function (swiper) {

						console.log(swiper.activeIndex);
					},
					onSlideChangeStart : function (swiper) {
						$('.direct-wt .inner-picture').removeClass('start-animation');
						$('.direct-wt .picture1').removeClass('start-animation2');
						$('.direct-wt .picture1').removeClass('rain');
						$('.direct-wt .picture2').removeClass('start-animation3');
						switch (swiper.activeIndex) {
							case 0:
								$('.direct-wt .inner-picture').addClass('start-animation');
								$timeout(function () {
									$rootScope.swiper3 = false;
								}, 0)
								break;
							case 1:
								$('.direct-wt .picture1').addClass('start-animation2')
								$timeout(function () {
									$('.direct-wt .picture1').addClass('rain');
								}, 1800)
								$timeout(function () {
									$rootScope.swiper3 = false;
								}, 0)
								break;
							case 2:
								$('.direct-wt .picture2').addClass('start-animation3');
								$timeout(function () {
									$rootScope.swiper3 = true;
								}, 0)

								break;
						}
					}
				});

			}
			scope.checkIfDisplayWT()

			scope.next       = function () {
				swiper.slideNext()

			};
			scope.understand = function () {
				$rootScope.endSwiper = true;
				// $rootScope.noBanner = true;
				localStorage.setItem('WTSeen', true);

				scope.showWT = false; //hide the WT

			};
			scope.skip       = function () {
				$rootScope.endSwiper = true;
				// $rootScope.noBanner = true;
				scope.showWT         = false;

			};

			$rootScope.$on('initWT',
				function (event, data) {
					$rootScope.initWTByBroadcast = false
					scope.initSwiper();
				})
			if ($rootScope.initWTByBroadcast == true) {
				scope.initSwiper();
			}

		},
		replace    : true
	};

}]);


    