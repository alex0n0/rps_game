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

//1bIOmTHuMnrDXzY02Bxx player1
//Afvq1FD82b3N62jZKYK6 player2



// db.collection("w7hw_rps").get().then(function (querySnapshot) {
//     querySnapshot.forEach(function (doc) {
//         // doc.data() is never undefined for query doc snapshots
//         console.log(doc.id, " => ", doc.data());
//     });
// });




console.log(window.location.href);
console.log(window.location.pathname);


$('#choosePlayerButton').on('click', function () {
    let id = $('#choosePlayerSelect').prop('options')[$('#choosePlayerSelect').prop('selectedIndex')].value;
    console.log(id);

    let domainIndex = window.location.href.indexOf(window.location.pathname);
    let domain = window.location.href.substring(0, domainIndex + 1);
    window.open(domain + 'player_dashboard.html?id=' + id, '_self');
});
$('#choosePlayerButtonGITHUB').on('click', function () {
    let id = $('#choosePlayerSelect').prop('options')[$('#choosePlayerSelect').prop('selectedIndex')].value;
    console.log(id);

    let domainIndex = window.location.href.indexOf(window.location.pathname);
    let domain = window.location.href.substring(0, domainIndex + 1);
    window.open(domain + 'rpg_game/player_dashboard.html?id=' + id, '_self');
});