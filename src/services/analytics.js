lametayel.factory('analytics', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {


    return {

        sendAnalyticsEvent: function (type, data) {

            try {
                var x = 5;
                window.ga.trackEvent('Lametayel Checklist', data)
                console.log('analytics: ' + data)
            }
            catch (e) {
                console.log('analytics not defined')
            }

        },
        sendPageView: function (data) {

            try {
                window.ga.trackView(data)
            }
            catch (e) {
                console.log('analytics not defined')
            }


        },
        initAnalytics: function () {
            //try {
            //    window.ga.startTrackerWithId('UA-88107721-1')
            //}
            //catch (e) {
            //    console.log('analytics not defined')
            //}

        }




    }
} ]);