'use strict';

angular.module("trivia").controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

    $scope.startGame = () => {
        $scope.score = 0;
        $scope.questionCounter = 0;
        $scope.gameID = "";
        $scope.game = {
            score: $scope.score,
            uid: firebase.auth().currentUser.uid
        };
        TriviaFactory.addNewGame($scope.game)
        .then (data =>{
            console.log(data, "curly bs");
            $scope.gameID = data.name;
        });
        $scope.qCounter();

    };
    $scope.qCounter = () => {
            $scope.questionCounter += 1;
            if ($scope.questionCounter <11) {
                $scope.displayQuestions ();
            } else {
            console.log ("game over");
            $scope.game.score = $scope.score;
            TriviaFactory.updateGame($scope.game, $scope.gameID);
            }
    };
    $scope.displayQuestions = () => {
        TriviaFactory.getTrivia()
            .then(triviaData => {
                $scope.questions = triviaData.data.result;
                $scope.chooices = triviaData.data.result[0].chooices;
                $scope.answer = triviaData.data.result[0].answer;
                $scope.totalScore = {};
                $scope.userProfile = {};
                $scope.category = triviaData.data.result[0].category;
                console.log(triviaData.data.result[0].category, "category");
                // console.log(triviaData.data.result[0].answer, "please be answer");
                // console.log(triviaData.data.result[0].chooices, "answer choices");
            })
            .catch(err => {
                console.log(err);
            });
    };
    $scope.score = 0;
    $scope.checkChooice = (answer) => {
        console.log(answer, "useranswer");
        console.log($scope.answer, "real answer");
        if (answer === $scope.answer) {
            $scope.score += 1;
            $scope.totalScore.correctAnswer = true;
            $scope.saveScore();
        } else {
            $scope.totalScore.correctAnswer = false;
            // let choice = document.getElementById(`choice${$scope.chooices}`);
            // choice.style.border="red";
            console.log("you're a loser");
            $scope.saveScore();
        }
        // $scope.saveScore ();
    };
    // $scope.displayQuestions();
    $scope.saveProfile = () => {
        $scope.userProfile.uid = firebase.auth().currentUser.uid;
        TriviaFactory.addNewProfile($scope.userProfile)
            .then((data) => {

            });
    };
    $scope.saveScore = () => {
        $scope.totalScore.uid = firebase.auth().currentUser.uid;
        $scope.totalScore.category = $scope.category;
        $scope.totalScore.gameID = $scope.gameID;
        console.log($scope.totalScore.category, "what is this");
        TriviaFactory.addNewScore($scope.totalScore)
            .then((data) => {

            });
    };
});
