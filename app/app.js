'use strict';

let isAuth = (AuthFactory) =>
    new Promise((resolve, reject) => {
        AuthFactory.isAuthenticated().then(userBool => {
            console.log("user???", userBool);
            if (userBool) {
                console.log("Authenticated user. Go ahead");
                resolve();
            } else {
                console.log("Not Authenticated user. Go away");
                reject();
            }
        });
    });

angular.module("trivia", ["ngRoute"])
    .constant("FBUrl", "https://trivia-time-14036.firebaseio.com")
    .config($routeProvider => {
        $routeProvider
            .when("/login", {
                templateUrl: "partials/login.html",
                controller: "LoginCtrl"
            })
            .when("/register", {
                templateUrl: "partials/register.html",
                controller: "LoginCtrl"
            })
            .when("/trivia", {
                templateUrl: "partials/trivia.html",
                controller: "GameCtrl",
                resolve: { isAuth }
            })
            // .when
            // })
            .otherwise("/login");
    })
    .run(fbCreds => {
        firebase.initializeApp(fbCreds);
    });
