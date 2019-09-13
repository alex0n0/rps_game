// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDUo5g_RDJGaXxJZvxKG5eu6GcUU0zCF50",
    authDomain: "bootcamp-w7-d2.firebaseapp.com",
    databaseURL: "https://bootcamp-w7-d2.firebaseio.com",
    projectId: "bootcamp-w7-d2",
    storageBucket: "bootcamp-w7-d2.appspot.com",
    messagingSenderId: "934048003746",
    appId: "1:934048003746:web:25b8d971a71619f6ee89fb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();


// db.collection("w7hw_rps").get().then(function (querySnapshot) {
//     querySnapshot.forEach(function (doc) {
//         // doc.data() is never undefined for query doc snapshots
//         console.log(doc.id, " => ", doc.data());
//     });
// });

let url = window.location.href;
let urlDataIndex = url.indexOf('?') + 1;
let urlData = url.substr(urlDataIndex);
let arrData = urlData.split(/[=&]/);
let objData = {};
for (let i = 0; i < arrData.length / 2; i += 2) {
    objData[arrData[i]] = arrData[i + 1];
}
console.log(objData);


let gameStates = ['waiting', 'playing', 'ended'];

let unsubscribeOpponentConnection;
let unsubscribeOpponentChoices;
let unsubscribeOpponentQuit;


let sessionid;
let turnPlayer = 0;
let turnOpponent = 0;
let choicePlayer;
let choiceOpponent;

$('#gamemodeCreateButton').on('click', createGameFunction);
function createGameFunction() {
    if (unsubscribeOpponentConnection != undefined) {
        unsubscribeOpponentConnection();
    }
    
    if (unsubscribeOpponentChoices != undefined) {
        unsubscribeOpponentChoices();
    }

    if (unsubscribeOpponentQuit != undefined) {
        unsubscribeOpponentQuit();
    }

    $('#gamemodeCreateButton').attr('disabled', true);
    $('#nav-profile-tab').removeAttr('href', '');
    $('#nav-profile-tab').removeAttr('data-toggle', '');
    $('#nav-home-tab').removeAttr('href', '');
    $('#nav-home-tab').removeAttr('data-toggle', '');
    $('#gamemodeCreateButton').off();

    let gameState = gameStates[0];
    db.collection("w7hw_rps_sessions").add({
        p1: objData.id,
        status: gameState
    })
        .then(function (docRef) {
            // console.log("Document written with ID: ", docRef.id);
            sessionid = docRef.id;
            $('#gamemodeCreateSessionid').val(sessionid);

            $('#gamestatusCreate > p').text('status: Session created, waiting for opponent');
            $('#gameBattlefield').removeClass('d-none');
            $('#gameBattlefieldQuit').removeClass('d-none');

            unsubscribeOpponentConnection = db.collection("w7hw_rps_sessions").doc(sessionid)
                .onSnapshot(function (doc) {
                    // console.log(doc.data());
                    if (doc.data().status == gameStates[1]) {
                        $('#gamestatusCreate > p').text('status: Successfully connection, begin playing');
                        console.log('player 2 found: ' + doc.data().p2);
                        // unsubscribeOpponentChoices();
                        $('.buttonRPS').on('click', rpsFunction);

                        unsubscribeOpponentChoices = db.collection("w7hw_rps_sessions").doc(sessionid).collection('results')
                            .onSnapshot(function (querySnapshot) {

                                querySnapshot.docChanges().forEach(function (change) {
                                    if (change.type === "added") {
                                        console.log(change.doc.data());
                                        if (change.doc.data().id != objData.id) {
                                            turnOpponent++;
                                            console.log('opponent turn: ', turnOpponent, ' opponent choice: ', change.doc.data().result, ' (id: ', change.doc.data().id, ', time: ', change.doc.data().time, ')');
                                            choiceOpponent = change.doc.data().result;
                                            if (turnPlayer == turnOpponent) {
                                                evalResults(choicePlayer, choiceOpponent);
                                            }
                                        }
                                    }
                                });
                            });
                    }
                });

            unsubscribeOpponentQuit = db.collection("w7hw_rps_sessions").doc(sessionid)
                .onSnapshot({
                    includeMetadataChanges: true
                }, function (doc) {
                    if (doc.data().status == gameStates[2]) {
                        quitFunction();
                    }
                });
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}


$('#gamemodeCreateCopy').on('click', function () {
    $('#gamemodeCreateSessionid').select();
    $('#gamemodeCreateSessionid')[0].setSelectionRange(0, 99999);
    document.execCommand('copy');
    $('#gamemodeCreateSessionid')[0].setSelectionRange(0, 0);
    $('#gamemodeCreateSessionid')[0].blur();
});







$('#gamemodeJoinButton').on('click', joinGameFunction);

function joinGameFunction() {
    sessionid = $('#gamemodeJoinSessionid').val();

    if (sessionid.length != 0) {
        db.collection("w7hw_rps_sessions").doc(sessionid).get().then(function (doc) {

            if (doc.data() != undefined) {
                if (doc.data().p1 === objData.id) {
                    $('#gamestatusJoin > p').text('status: You cannot join your own game (' + sessionid + ')');
                    $('#gamemodeJoinSessionid').val('');
                } else if (doc.data().status == gameStates[1]) {
                    $('#gamestatusJoin > p').text('status: This session already has 2 players (' + sessionid + ')');
                    $('#gamemodeJoinSessionid').val('');
                } else if (doc.data().status == gameStates[2]) {
                    $('#gamestatusJoin > p').text('status: This session has already ended (' + sessionid + ')');
                    $('#gamemodeJoinSessionid').val('');
                } else {
                    $('#gameBattlefield').removeClass('d-none');
                    $('#gameBattlefieldQuit').removeClass('d-none');

                    $('#gamemodeJoinButton').off();
                    $('#gamemodeJoinButton').attr('disabled', 'true');
                    $('#nav-profile-tab').removeAttr('href', '');
                    $('#nav-profile-tab').removeAttr('data-toggle', '');
                    $('#nav-home-tab').removeAttr('href', '');
                    $('#nav-home-tab').removeAttr('data-toggle', '');


                    let gameState = gameStates[1];
                    db.collection("w7hw_rps_sessions").doc(sessionid).set({
                        p2: objData.id,
                        status: gameState
                    }, { merge: true })
                        .then(function () {
                            console.log("Document successfully written!");
                            $('#gamestatusJoin > p').text('status: Successfully connection, begin playing');
                            $('.buttonRPS').on('click', rpsFunction);
                            $('#gamemodeJoinSessionid').attr('readOnly', true);
                            unsubscribeOpponentChoices = db.collection("w7hw_rps_sessions").doc(sessionid).collection('results')
                                .onSnapshot(function (querySnapshot) {

                                    querySnapshot.docChanges().forEach(function (change) {
                                        if (change.type === "added") {
                                            console.log(change.doc.data());
                                            if (change.doc.data().id != objData.id) {
                                                turnOpponent++;
                                                console.log('opponent turn: ', turnOpponent, ' opponent choice: ', change.doc.data().result, ' (id: ', change.doc.data().id, ', time: ', change.doc.data().time, ')');
                                                choiceOpponent = change.doc.data().result;
                                                if (turnPlayer == turnOpponent) {
                                                    evalResults(choicePlayer, choiceOpponent);
                                                }
                                            }
                                        }
                                    });
                                });

                            unsubscribeOpponentQuit = db.collection("w7hw_rps_sessions").doc(sessionid)
                                .onSnapshot({
                                    includeMetadataChanges: true
                                }, function (doc) {
                                    if (doc.data().status == gameStates[2]) {
                                        quitFunction();
                                    }
                                });


                        })
                        .catch(function (error) {
                            console.error("Error writing document: ", error);
                        });
                }
            } else {
                $('#gamestatusJoin > p').text('status: Please enter a valid session id');
                $('#gamemodeJoinSessionid').val('');
            }
        });
    }
}

















function rpsFunction() {
    console.log('how many times');

    if (turnPlayer <= turnOpponent) {
        turnPlayer++;

        choicePlayer = $(this).attr('data-choice');
        console.log('my turn: ', turnPlayer, ' my choice: ', choicePlayer);
        db.collection("w7hw_rps_sessions").doc(sessionid).get().then(function (doc) {
            if (doc.data().status == gameStates[1]) {
                db.collection("w7hw_rps_sessions").doc(sessionid).collection("results").add({
                    time: new Date().valueOf(),
                    id: objData.id,
                    result: choicePlayer
                })
                    .then(function (docRef) {
                        // console.log("Document written with ID: ", docRef.id);
                        if (turnPlayer == turnOpponent) {
                            evalResults(choicePlayer, choiceOpponent);
                        }
                    })
                    .catch(function (error) {
                        console.error("Error adding document: ", error);
                    });
            }
        });


    } else {
        console.log('...waiting for opponent');
    }
}


function evalResults(playerChoice, opponentChoice) {
    let stringOutcome;
    let stringChoices = playerChoice + ' (you) vs ' + opponentChoice + ' (opponent)';
    if (playerChoice == opponentChoice) {
        stringOutcome = 'Round ' + turnPlayer + ': TIE';
    } else if (
        (playerChoice == 'rock' && opponentChoice == 'scissors') ||
        (playerChoice == 'paper' && opponentChoice == 'rock') ||
        (playerChoice == 'scissors' && opponentChoice == 'paper')) {
        stringOutcome = 'Round ' + turnPlayer + ': WIN';
    } else {
        stringOutcome = 'Round ' + turnPlayer + ': LOSE';
    }
    $('#gameResults').prepend('<p class="p-2 text-secondary">' + stringOutcome + '<br><span style="margin-left: 20px;">' + stringChoices + '</span></p>');
}


















$(window).bind("beforeunload", quitFunction);
$('#quitButton').on('click', quitFunction);
function quitFunction() {
    // location.reload();

    if (unsubscribeOpponentConnection != undefined) {
        unsubscribeOpponentConnection();
    }
    if (unsubscribeOpponentChoices != undefined) {
        unsubscribeOpponentChoices();
    }

    if (unsubscribeOpponentQuit != undefined) {
        unsubscribeOpponentQuit();
    }

    $('.buttonRPS').off();

    $('#gamemodeCreateSessionid').val('');
    $('#gamemodeJoinSessionid').val('');
    $('#gameBattlefield').addClass('d-none');
    $('#gameBattlefieldQuit').addClass('d-none');
    $('#gameResults').empty();

    $('#gamemodeCreateButton').on('click', createGameFunction);
    $('#gamemodeCreateButton').removeAttr('disabled');
    $('#gamemodeJoinButton').on('click', joinGameFunction);
    $('#gamemodeJoinSessionid').removeAttr('readOnly');
    $('#gamemodeJoinButton').removeAttr('disabled');

    $('#nav-home-tab').attr('href', '#nav-home');
    $('#nav-home-tab').attr('data-toggle', 'tab');
    $('#nav-profile-tab').attr('href', '#nav-profile');
    $('#nav-profile-tab').attr('data-toggle', 'tab');

    if (sessionid != undefined) {
        db.collection("w7hw_rps_sessions").doc(sessionid).set({
            status: gameStates[2]
        }, { merge: true })
            .then(function () {
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    }
    sessionid = undefined;
    turnPlayer = 0;
    turnOpponent = 0;
    choicePlayer = undefined;
    choiceOpponent = undefined;
}