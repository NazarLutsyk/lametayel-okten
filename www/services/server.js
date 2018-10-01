lametayel.factory('server', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {


    return {

        request: function (type,data) {
            var deferred = $q.defer();

            var httpDetails = {
                url: $rootScope.domainApi+'action='+type +data,
                method: "POST",
                contentType: "application/json",
                data: {}//JSON.stringify(data)
                
            };

            //if (!data.req) {//if it form data
            //    httpDetails.transformRequest = angular.identity;
            //    httpDetails.headers = { 'Content-Type': undefined };
            //    httpDetails.contentType = undefined;
            //}
           
            var serverRequestTime =Date.now();
            $http(httpDetails).
            success(function (json) {
                serverRequestTime =undefined;
                 $timeout.cancel( serverTimeout );
                deferred.resolve(json);

            }).
            error(function (err) {
                serverRequestTime =undefined;
                $timeout.cancel( serverTimeout );
                if(err == null){
                     $rootScope.$broadcast('showPopup', { type: "noNetwork" });
                }
                deferred.resolve(err);
            });

           var serverTimeout = $timeout(function () {
               if(serverRequestTime != undefined){
                   //show SLOW NETWORK popup
                   $rootScope.$broadcast('showPopup',{ type: "slowNetwork"});
                 
               }
            },2500);

            return deferred.promise;
        },


       
    }
} ]);