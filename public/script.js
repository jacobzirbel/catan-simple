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
let rooms = [];
let a = JSON.parse(readCookie("myHand"));
let b = readCookie("knightCount");
let c = readCookie("roomnum");
let myHand = a ? a : [];
let knightCount = b ? b : 0;
let roomNumber = c ? c : 0;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const pickCard = () => {
	const n = Math.floor(Math.random() * currentDeck.length);
	myHand.push(currentDeck[n]);
	currentDeck.splice(n, 1);
	showHand();
	database.ref(roomNumber).update({ deck: JSON.stringify(currentDeck) });
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
	database.ref(roomNumber).update({ roll: a });
};
const resetDeck = () => {
	if (confirm("are you sure?")) {
		database.ref(roomNumber).set({ deck: JSON.stringify(createDeck()) });
	}
};
const changeRoom = () => {
	database.ref(roomNumber).off("value");
	roomNumber = "";
	getRoom(rooms);
	startGame(roomNumber);
};
const startNewRoom = (rooms) => {
	roomNumber = "0";
	let tries = 0;
	let n = 10;
	while (rooms.includes(roomNumber.toString())) {
		if (tries % 100 === 0) n = n * 10;
		tries++;
		roomNumber = Math.ceil(Math.random() * n);
	}
	console.log(roomNumber);
	database
		.ref()
		.child(roomNumber.toString())
		.set({ deck: JSON.stringify(createDeck()), start: new Date().getTime() });
	return roomNumber;
};
const getRoom = (rooms) => {
	if (roomNumber) {
	} else {
		let userEntered = prompt("What is your room number?").toString();
		if (userEntered === "0") {
			roomNumber = startNewRoom(rooms);
		} else if (rooms.includes(userEntered)) {
			roomNumber = userEntered;
		} else {
			alert("invalid room code");
			getRoom([...rooms]);
		}
	}
	console.log("got here!!!!!!!!!!!!!!");
	document.cookie = "roomnum=" + roomNumber;
	document.getElementById("roomnum").textContent = roomNumber;
	return roomNumber;
};

const deleteRoom = (roomNumber) => {
	database.ref().child(roomNumber).remove();
};

const startGame = (roomNumber) => {
	database.ref(roomNumber).on("value", (snap) => {
		$("#dice").text(snap.val().roll);
		currentDeck = JSON.parse(snap.val().deck);
		$("#card-count").text(34 - currentDeck.length);

		if (currentDeck.length === 34) {
			myHand = [];
			knightCount = 0;
			document.cookie = "myHand=" + JSON.stringify(myHand);
			document.cookie = "knightCount=" + knightCount;

			showHand();
		}
	});
};

database.ref().once("value", (snap) => {
	rooms = [];
	for (key in snap.val()) {
		if (snap.val()[key].start + DAY_IN_MS < new Date().getTime()) {
			deleteRoom(key);
		}
	}
	if (snap.val()) {
		rooms = [...Object.keys(snap.val())];
	}

	roomNumber = getRoom(rooms);

	startGame(roomNumber);
});

showHand();
