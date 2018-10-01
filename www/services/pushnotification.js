lametayel.factory('pushnotification', ['$rootScope', '$http', '$q', '$state', '$timeout', function ($rootScope, $http, $q, $state, $timeout) {


    return {

        push: function (data) {
            if (data.id) {
                                      /* cordova.plugins.notification.local.schedule({
                                                                                   id: parseInt(data.id),
                                                                                   title      : data.text,
                                                                                  sound      : null,
                                                                                   autoClear  : false,
                                                                                   at         : data.date
                                                                                   
   
                                                                                   });*/
                                       var now= new Date()
                                     /*  cordova.plugins.notification.local.schedule({
                                                                                   id: 1,
                                                                                   text: 'Test Message 1',
                                                                                   icon: 'http://3.bp.blogspot.com/-Qdsy-GpempY/UU_BN9LTqSI/AAAAAAAAAMA/LkwLW2yNBJ4/s1600/supersu.png',
                                                                                   smallIcon: 'res://cordova',
                                                                                   sound: null,
                                                                                   data: { test: 1 },
                                                                                   at: now.getTime()+ 5000,
                                                                                   });*/
                                       
                                       cordova.plugins.notification.local.schedule({
                                                                                   id: parseInt(data.id),
                                                                                   text: data.text,
                                                                                  // data: { test: 1 },
                                                                                   at: data.date,
                                                                                   });

                                       
                                       /*cordova plugin add https://github.com/Telerik-Verified-Plugins/LocalNotification   */
                                       //this plugin was work
                                       
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

                                           






