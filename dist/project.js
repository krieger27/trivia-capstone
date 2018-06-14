//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById("choice");
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById("choice`$s");
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById("choice`$scope.choice");
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById("choice`$scope.choice{{chooice");
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById("choice`$scope.choice{{chooice}}");
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice$scope.choice{{chooice}}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice$scope.choice`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice$scope.chooice`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice4$scope.chooice`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice$$scope.chooice`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooicea}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooices}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice[0]}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice}`);
              $scope.choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooice}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooices}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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
              let choice = document.getElementById(`choice${$scope.chooices}`);
              choice.style.border="red";
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));



//====================================================================================================================
// Module:    trivia
// Optimized: Yes
// File:      ./app/app.js
//====================================================================================================================

(function (module) {

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

  module
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/GameCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.controller("GameCtrl", function ($scope, TriviaFactory, fbCreds, $window) {

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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/LoginCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("LoginCtrl", function ($scope, AuthFactory, $window, $rootScope) {
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

//--------------------------------------------------------------------------------------------------------------------
// File: ./app/controllers/NavCtrl.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.controller("NavCtrl", function ($scope, $location, $rootScope, $window, $route, AuthFactory) {
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
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/AuthFactory.js
//--------------------------------------------------------------------------------------------------------------------

  "use strict";

  module.factory("AuthFactory", (fbCreds, $q) => {
      let authObj = {};
      let currentUser = null;

      authObj.createUser = ({ email, password }) => {
          return firebase.auth().createUserWithEmailAndPassword(email, password);
      };

      authObj.loginUser = ({ email, password }) => {
          return firebase.auth().signInWithEmailAndPassword(email, password);
      };

      authObj.logoutUser = () => {
          return firebase.auth().signOut();
      };

      authObj.isAuthenticated = () => {
          console.log("isAuthenticated called AuthFactory");
          return $q((resolve, reject) => {
              console.log("firing onAuthStateChanged");
              firebase.auth().onAuthStateChanged((user) => {
                  console.log("onAuthStateChanged finished");
                  if (user) {
                      console.log("user", user);
                      currentUser = user.uid;
                      resolve(true);
                  } else {
                      resolve(false);
                  }
              });
          });
      };

      // probably don't need this
      authObj.getCurrentUser = () => {
          return currentUser;
      };

      return authObj;
  });

  // angular.module("trivia").factory("AuthFactory", (fbCreds, $q) => {
  //     let authObj = {};
  //     let currentUser = null;

  //     authObj.createUser = ({ email, password }) => {
  //         return firebase.auth().createUserWithEmailAndPassword(email, password);
  //     };

  //     authObj.loginUser = ({ email, password }) => {
  //         return firebase.auth().signInWithEmailAndPassword(email, password);
  //     };

  //     authObj.logoutUser = () => {
  //         return firebase.auth().signOut();
  //     };

  //     authObj.isRegistered = () => {
  //         return $q((resolve, reject) => {
  //             firebase.auth().onAuthStateChanged(user => {
  //                 console.log("onAuthStateChanged working");
  //                 if (user) {
  //                     console.log("user is: ", user);
  //                     currentUser = user.uid;
  //                     resolve(true);
  //                 } else {
  //                     resolve(false);
  //                 }
  //             });
  //         });
  //     };
  //     authObj.getCurrentUser = () => {
  //         return currentUser;
  //     };
  //     return authObj;
  // });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/factories/TriviaFactory.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';


  module.factory("TriviaFactory", function ($q, $http, triviaCreds, FBUrl, AuthFactory) {

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



//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/fbCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("fbCreds", {
      apiKey: "AIzaSyC4i4REd1g9Uw95349skuv0I_FVk0rt8JA",
      authDomain: "trivia-time-14036.firebaseapp.com",
      FBUrl: "https://trivia-time-14036.firebaseio.com",
      projectId: "trivia-time-14036",
      storageBucket: "trivia-time-14036.appspot.com",
      messagingSenderId: "21358802913"
  });
//--------------------------------------------------------------------------------------------------------------------
// File: ./app/values/triviaCreds.js
//--------------------------------------------------------------------------------------------------------------------

  'use strict';

  module.constant("triviaCreds", {
      headers: {
          "XMashapeKey": "NnVFGq62rXmshAtyFxNSfQG6d08lp1qB42vjsnjkDEIjQhbfg6"
  }}); 

}) (angular.module ('trivia', ['ngRoute']));


