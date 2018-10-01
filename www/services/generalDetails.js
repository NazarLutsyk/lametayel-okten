lametayel.factory('generalDetails', ['$rootScope', '$stateParams', function ($rootScope, $stateParams) {

    var editItem;

    return {

        setItemToEdit: function (edit) {
            editItem = edit;
        },

        getItemToEdit: function () {
            return editItem;
        }

    }
} ])
