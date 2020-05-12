function changeRoom() {
	database.ref(roomNumber).off("value");
	roomNumber = "";
	roomNumber = getRoom(rooms);
	startGame(roomNumber);
}
function startNewRoom(rooms) {
	roomNumber = "0";
	let tries = 0;
	let n = 10;
	while (rooms.includes(roomNumber.toString())) {
		if (tries % 100 === 0) n = n * 10;
		tries++;
		roomNumber = Math.ceil(Math.random() * n);
	}
	database
		.ref()
		.child(roomNumber.toString())
		.set({ deck: JSON.stringify(createDeck()), start: new Date().getTime() });
	return roomNumber;
}

const getRoom = (rooms) => {
	if (roomNumber) {
	} else {
		let userEntered = prompt(
			"What is your room number? Enter 0 to start new room"
		).toString();
		if (userEntered === "0") {
			roomNumber = startNewRoom(rooms);
		} else if (rooms.includes(userEntered)) {
			roomNumber = userEntered;
		} else {
			alert("invalid room code");
			getRoom([...rooms]);
		}
	}

	((c_name, c_value, exdays) => {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		document.cookie =
			encodeURIComponent(c_name) +
			"=" +
			encodeURIComponent(c_value) +
			(!exdays ? "" : "; expires=" + exdate.toUTCString());
	})("roomnum", roomNumber, 0.1);
	document.getElementById("roomnum").textContent = roomNumber;
	return roomNumber;
};

const deleteRoom = (rn) => {
	database.ref().child(rn).remove();
};

const startGame = (rn) => {
	database.ref(rn).on("value", (snap) => {
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

	roomNumber = getRoom(rooms);

	startGame(roomNumber);
});

showHand();
