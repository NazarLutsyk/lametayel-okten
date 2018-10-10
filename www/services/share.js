lametayel.factory('share', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {

	return {

		share: function (data) {
			//window.plugins.socialsharing.share('Message, subject, image and link', 'The subject',
			// 'https://www.google.nl/images/srpr/logo4w.png', 'http://www.x-services.nl')">message, subject, image and
			// link
			if (windows.plugins && window.plugins.socialsharing) {
				// if there is desc and title- share them
				if (data.desc) {
					window.plugins.socialsharing.share(data.desc, data.title, null, '');

				}
				//else- share only the title
				else {
					window.plugins.socialsharing.share(data.title, null, null, '');
				}

			} else {
                console.log('no phonegap social share plugin installed');
			}

		}

	}
}]);