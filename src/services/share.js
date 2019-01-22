lametayel.factory('share', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {

  return {

    share: function (data) {
      if (window.plugins && window.plugins.socialsharing) {
        if (data.desc) {
          window.plugins.socialsharing.share(data.desc, data.title, null, 'http://www.x-services.nl', () => {
            console.log('ok');
          }, (err) => {
            console.log(err);
          });
        } else {
          window.plugins.socialsharing.share(data.title, '', null, 'http://www.x-services.nl', () => {
            console.log('ok');
          }, (err) => {
            console.log(err);
          });
        }

      } else {
        console.log('no phonegap social share plugin installed');
      }
    }
  }
}]);
