"use strict";

angular.module("trivia").controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
        $scope.test = "hello";

        $scope.register = () => {
            AuthFactory.createUser($scope.account).then(user => {
                console.log("newUser", user);
                $scope.login();
            })
                .catch(function ({ code, message }) {
                    console.log("Oops", code, message);
                });
        };

        $scope.login = () => {
            AuthFactory.loginUser($scope.account).then(user => {
                console.log("logged in user", user);
                $window.location.href = "#!/trivia";
            })
                .catch((err) => {
                    console.log(err);
                });
        };

        $scope.logout = () => {
            AuthFactory.logoutUser()
                .then((data) => {
                    console.log("logged out", data);
                });
        };
        // $scope.logout();
    });







// angular
//     .module("trivia")
//     .controller("UserLoginCtrl", function ($scope, AuthFactory, $window) {
//         $scope.register = () => {
//             AuthFactory.createUser($scope.account)
//                 .then(user => {
//                     console.log("newUser: ", user);
//                     $scope.login();
//                 })
//                 .catch(function ({ code, message }) {
//                     console.log("wrong info", code, message);
//                     $window.alert("This user already exists. Please use a different email.");
//                 });
//         };

//         $scope.login = () => {
//             AuthFactory.loginUser($scope.account)
//                 .then(user => {
//                     console.log("the user is: ", user);
//                     // $window.location.href = "#/:id";
//                     $window.location.href = "#!/new-game";
//                 })
//                 .catch(err => {
//                     console.log("err");
//                 });
//         };
//         $scope.logout = () => {
//             AuthFactory.logoutUser().then(data => {
//                 console.log("logged out", data);
//             });
//         };
//     });
