'use strict';


angular.module("trivia").factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

    let addNewGame = (game) => {
        return $q((resolve, reject) => {
            $http
                .post(`${FBUrl}/games.json`, JSON.stringify(game))
                .then(data => {
                    console.log("game ", game);
                    resolve(data.data);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
    };

    let updateGame= (score, gameID) => {
        console.log(score, "what is this score");
        console.log(gameID, "what is this gameID");
        return $q((resolve, reject) => {
            $http
                .patch(`${FBUrl}/games/${gameID}.json`, JSON.stringify(score))
                .then(data => {
                    console.log("score ", score);
                    resolve(data.data);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
    };

    function getTrivia() {
        return $q(function (resolve, reject) {
            $http.get('https://apifort-trivia-database-v1.p.mashape.com/v1/query/trivia?count=1', {
                headers: {
                    "X-Mashape-Key": triviaCreds.headers.XMashapeKey
                }
            })
                .then((data) => {
                    console.log("data", data);
                    resolve(data);
                })
                .catch(function (error) {
                    console.log("rejection");
                    reject(error);
                });
        });
    }
        function nextQuestion() {
            return $q((resolve, reject) => {
                $http.get(('https://apifort-trivia-database-v1.p.mashape.com/v1/query/trivia?count=1', {
                    headers: {
                        "X-Mashape-Key": triviaCreds.headers.XMashapeKey
                    }
                })
                .then((data) => {
                    console.log("data", data);
                    resolve(data);
                })
                .catch(function (error) {
                    console.log("rejection");
                    reject(error);
                }));
        });
        }
        let addNewScore = (score) => {
            console.log(score, "the score");
            return $q((resolve, reject) => {
                $http
                    .post(`${FBUrl}/questions.json`, JSON.stringify(score))
                    .then(data => {
                    console.log("Updated user's profile", data.data.name);
                    resolve(data.data);
                    })
                    .catch(error => {
                    console.log(error);
                    reject(error);
                    });
                });
            };
        
    return { getTrivia, nextQuestion, addNewScore, addNewGame, updateGame};
});


