"use strict";

angular.module("trivia").controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
    $scope.isLoggedIn = false;
    // $scope.navItems = [
    //     {
    //         name: "login",
    //         url: "#!/login",
    //     },
    //     {
    //         name: "triva",
    //         url: "#!/trivia"
    // }];

    firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        $scope.isLoggedIn = true;
        $scope.$apply();
    } else {
        $scope.isLoggedIn = false;
        $scope.$apply(); //to update scope
        $window.location.href = "#!/login";
    }
});

// $scope.navigate = navUrl => {
//     console.log("navUrl", navUrl);
//     if (navUrl === "#!/logout") {
//         AuthFactory.logoutUser();
//     } else {
//         $window.location.href = navUrl;
//     }
// };

$scope.logout = () => {
    AuthFactory.logoutUser();
};
});