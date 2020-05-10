const config = {
	apiKey: "AIzaSyCHxywW-RjXx3LqlX38eEVCcdjMoo9IbqM",
	authDomain: "catan-addcc.firebaseapp.com",
	databaseURL: "https://catan-addcc.firebaseio.com",
	projectId: "catan-addcc",
	storageBucket: "catan-addcc.appspot.com",
};
firebase.initializeApp(config);

const database = firebase.database();
const connectionsRef = database.ref("/connections");
const connectedRef = database.ref(".info/connected");
let currentDeck = [];
let a = JSON.parse(readCookie("myHand"));
b = readCookie("knightCount");
let myHand = a ? a : [];
let knightCount = b ? b : 0;

const resetDeck = () => {
	if (confirm("are you sure?")) {
		database.ref().set({ deck: JSON.stringify(createDeck()) });
	}
};
const pickCard = () => {
	const n = Math.floor(Math.random() * currentDeck.length);
	myHand.push(currentDeck[n]);

	currentDeck.splice(n, 1);
	showHand();
	database.ref().update({ deck: JSON.stringify(currentDeck) });
};
const showHand = () => {
	document.cookie = "myHand=" + JSON.stringify(myHand);
	//localStorage.setItem("myHand", [...myHand]);
	$("#hand").empty();
	myHand.forEach((e) => {
		let card = $("<h4>").text(e);
		$("#hand").append(card);
	});
	$("#used").text("Knights Used: " + knightCount);
};
const useKnight = () => {
	const i = myHand.indexOf("Knight");
	if (i > -1) {
		if (confirm("Use Knight?")) {
			knightCount++;
			document.cookie = "knightCount=" + knightCount;
			//	localStorage.setItem("knightCount", knightCount);
			myHand.splice(i, 1);
			showHand();
		}
	}
};
window.onload = () => {
	database.ref().on("value", (snap) => {
		$("#dice").text(snap.val().roll);
		currentDeck = JSON.parse(snap.val().deck);
		$("#card-count").text(34 - currentDeck.length);

		if (currentDeck.length === 34) {
			myHand = [];
			knightCount = 0;
			document.cookie = "myHand=" + JSON.stringify(myHand);
			document.cookie = "knightCount=" + knightCount;

			//	localStorage.setItem("myHand", [...myHand]);
			//	localStorage.setItem("knightCount", knightCount);
			showHand();
		}
	});
	// connectedRef.on("value", (snap) => {
	// 	console.log("snap val", snap.val());
	// 	if (snap.val()) {
	// 		let con = connectionsRef.push(true);

	// 		con.onDisconnect().remove();
	// 	}
	// });
	showHand();
};
let createDeck = () => {
	let cards = [];
	for (let i = 0; i < 20; i++) {
		cards.push("Knight");
	}
	for (let i = 0; i < 3; i++) {
		cards.push("Road Building");
	}
	for (let i = 0; i < 3; i++) {
		cards.push("Year of Plenty");
	}
	for (let i = 0; i < 3; i++) {
		cards.push("Monopoly");
	}
	for (let i = 0; i < 5; i++) {
		cards.push("Victory Point");
	}
	return cards;
};
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}
rollDice = () => {
	let a = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);
	database.ref().update({ roll: a });
};
