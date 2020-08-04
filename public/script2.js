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
let myHand = a ? a : [];
let knightCount = b ? b : 0;
showHand();
let roomNumber;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

database.ref().once("value", (snap) => {
  const deleteRoom = (rn) => {
    database.ref().child(rn).remove();
  };

  for (key in snap.val()) {
    if (snap.val()[key].start + DAY_IN_MS < new Date().getTime()) {
      deleteRoom(key);
    }
  }
  if (snap.val()) {
    rooms = [...Object.keys(snap.val())];
  }
  getRoom();
  setRoomCookie();
  printRoomToDom();
  startListener();
});
function startListener() {
  database.ref(roomNumber).on("value", (snap) => {
    const roll = snap.val().roll;
    $("#roll").text(roll ? "Roll: " + roll : "");
    currentDeck = JSON.parse(snap.val().deck);
    $("#card-count").text(34 - currentDeck.length);
    if (currentDeck.length === 34) {
      myHand = [];
      knightCount = 0;
      document.cookie = "myHand=" + JSON.stringify(myHand);
      document.cookie = "knightCount=" + knightCount;
      console.log(knightCount);
      showHand();
    }
  });
}
function getRoom() {
  let r = readCookie("roomnum");
  console.log(r);
  if (r) {
    roomNumber = r;
  } else {
    let userEntered = prompt("Room number / '0' to start new room").toString();
    if (!userEntered || userEntered === "0") {
      startNewRoom();
    } else if (rooms.includes(userEntered)) {
      roomNumber = userEntered;
    } else {
      alert("this shouldn't happen");
    }
  }
}
function startNewRoom() {
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
}
function pickCard() {
  if (!roomNumber) return alert("Please join a room");
  const n = Math.floor(Math.random() * currentDeck.length);
  myHand.push(currentDeck[n]);
  currentDeck.splice(n, 1);
  showHand();
  database.ref(roomNumber).update({ deck: JSON.stringify(currentDeck) });
}
function showHand() {
  document.cookie = "myHand=" + JSON.stringify(myHand);
  //localStorage.setItem("myHand", [...myHand]);
  $("#hand").empty();
  myHand.forEach((e) => {
    let card = $("<h4>").text(e);
    $("#hand").append(card);
  });
  $("#used").text("Knights Used: " + knightCount);
}
function useKnight() {
  if (!roomNumber) return alert("Please join a room");
  const i = myHand.indexOf("Knight");
  if (i > -1) {
    if (true) {
      knightCount++;
      document.cookie = "knightCount=" + knightCount;
      //	localStorage.setItem("knightCount", knightCount);
      myHand.splice(i, 1);
      showHand();
    }
  }
}
function createDeck() {
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
}
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
function rollDice() {
  let a = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);
  database.ref(roomNumber).update({ roll: a });
}
function resetDeck() {
  let a = confirm("are you sure");
  console.log(a);
  if (a) {
    console.log(roomNumber);
    database.ref(roomNumber).set({ deck: JSON.stringify(createDeck()) });
  }
}
function printRoomToDom() {
  document.getElementById("roomnum").textContent = roomNumber;
}
function setRoomCookie() {
  document.cookie = "roomnum=" + roomNumber.toString();
}
function changeRoom() {
  let a = confirm("You will lose your hand data");
  console.log(a);
  if (a) {
    database.ref(roomNumber).off("value");
    deleteCookies();
    myHand = [];
    knightCount = 0;
    getRoom();
    printRoomToDom();
    setRoomCookie();
    showHand();
    startListener();
  }
  // get new deck, set rest of elements to dom
}
function deleteCookies() {
  document.cookie = "myHand=[];";
  document.cookie = "knightCount=;";
  document.cookie = "roomnum=";
}
