lametayel.factory('pushnotification', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {


    return {

        push: function (data) {
            if (data.id) {
                cordova.plugins.notification.local.schedule({
                    id: data.id,
                    //title: data.text,
                    text: data.text,
                    at: data.date,
                    every:0
                });
            }
            else{
                alert('אירעה שגיאה. לא ניתן להוסיף תזכורת לפריט זה')
            }


        },
        removePush: function (data) {
            if(data && data.id){
                cordova.plugins.notification.local.cancel(data.id);
            }
            
            

        }



    }
} ]);



