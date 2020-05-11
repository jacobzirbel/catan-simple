const config = {
	apiKey: "AIzaSyCHxywW-RjXx3LqlX38eEVCcdjMoo9IbqM",
	authDomain: "catan-addcc.firebaseapp.com",
	databaseURL: "https://catan-addcc.firebaseio.com",
	projectId: "catan-addcc",
	storageBucket: "catan-addcc.appspot.com",
};
firebase.initializeApp(config);

const database = firebase.database();
let currentDeck = [];
let a = JSON.parse(readCookie("myHand"));
let b = readCookie("knightCount");
let c = readCookie("roomnum");
let myHand = a ? a : [];
let knightCount = b ? b : 0;
let roomNumber = c ? c : 0;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
