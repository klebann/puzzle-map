// Initialize Map
const map = L.map('map').setView([53.43, 14.55], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// DOM elements
const status = document.querySelector('#status');

// Buttons
const geoButton = document.querySelector("#geolocationButton");
const rasterButton = document.querySelector("#rasterButton");
const puzzleButton = document.querySelector("#puzzleButton");

// Functions
function geoFindMe() {
	const location = document.querySelector('#mylocation');

	location.textContent = '';

	function success(position) {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		status.textContent = 'Located';
		location.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
		map.setView([latitude, longitude]);
		L.marker([latitude, longitude]).addTo(map);
		geoButton.setAttribute('disabled', true);
		rasterButton.removeAttribute('disabled');
	}

	function error() {
		status.textContent = 'Unable to retrieve your location';
	}

	if (!navigator.geolocation) {
		status.textContent = 'Geolocation is not supported by your browser';
	} else {
		status.textContent = 'Locating…';
		navigator.geolocation.getCurrentPosition(success, error);
	}
}

const img = new Image();

const createMapImage = () => {
	rasterButton.setAttribute('disabled', true);
	status.textContent = 'Creating Raster Image...';

	leafletImage(map, (err, canvas) => {
		var dimensions = map.getSize();
		img.width = dimensions.x;
		img.height = dimensions.y;
		img.src = canvas.toDataURL();
		document.getElementById('deck').innerHTML = '';
		document.getElementById('deck').appendChild(img);

		puzzleButton.removeAttribute('disabled');
		status.textContent = 'Created raster image';
	});
};

// Puzzle
const PUZZLE_HOVER_COLOR = "red";
const canvas = document.createElement("canvas");
const stage = canvas.getContext("2d");
let difficulty = 4;
let pieces;
let puzzleWidth = 400;
let puzzleHeight = 400;
let pieceWidth = 100;
let pieceHeight = 100;
let currentPiece;
let currentDropPiece;
let mouse;

function createPuzzle() {
	status.textContent = "Creating Puzzles...";
	puzzleButton.setAttribute('disabled', true);

	canvas.width = puzzleWidth;
	canvas.height = puzzleHeight;

	pieces = [];
	mouse = {
		x: 0,
		y: 0
	};
	currentPiece = null;
	currentDropPiece = null;
	stage.drawImage(
		img,
		0,
		0,
		puzzleWidth,
		puzzleHeight,
		0,
		0,
		puzzleWidth,
		puzzleHeight
	);
	buildPieces();

	document.getElementById('deck').innerHTML = '';
	document.getElementById('deck').appendChild(canvas);

	shufflePuzzle();
	status.textContent = "Created Puzzles";
}

function buildPieces() {
	let i;
	let piece;
	let xPos = 0;
	let yPos = 0;
	for (i = 0; i < (4 * 4); i++) {
		piece = {};
		piece.sx = xPos;
		piece.sy = yPos;
		pieces.push(piece);
		xPos += pieceWidth;
		if (xPos >= puzzleWidth) {
			xPos = 0;
			yPos += pieceHeight;
		}
	}
}

function shufflePuzzle() {
	pieces = shuffleArray(pieces);
	stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
	let xPos = 0;
	let yPos = 0;
	for (const piece of pieces) {
		piece.xPos = xPos;
		piece.yPos = yPos;
		stage.drawImage(
			img,
			piece.sx,
			piece.sy,
			pieceWidth,
			pieceHeight,
			xPos,
			yPos,
			pieceWidth,
			pieceHeight
		);
		stage.strokeRect(xPos, yPos, pieceWidth, pieceHeight);
		xPos += pieceWidth;
		if (xPos >= puzzleWidth) {
			xPos = 0;
			yPos += pieceHeight;
		}
	}
	document.onpointerdown = onPuzzleClick;
}

function checkPieceClicked() {
	for (const piece of pieces) {
		if (
			mouse.x < piece.xPos ||
			mouse.x > piece.xPos + pieceWidth ||
			mouse.y < piece.yPos ||
			mouse.y > piece.yPos + pieceHeight
		) {
			//PIECE NOT HIT
		} else {
			return piece;
		}
	}
	return null;
}

function updatePuzzle(e) {
	currentDropPiece = null;
	if (e.layerX || e.layerX == 0) {
		mouse.x = e.layerX - canvas.offsetLeft;
		mouse.y = e.layerY - canvas.offsetTop;
	} else if (e.offsetX || e.offsetX == 0) {
		mouse.x = e.offsetX - canvas.offsetLeft;
		mouse.y = e.offsetY - canvas.offsetTop;
	}
	stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
	for (const piece of pieces) {
		if (piece == currentPiece) {
			continue;
		}
		stage.drawImage(
			img,
			piece.sx,
			piece.sy,
			pieceWidth,
			pieceHeight,
			piece.xPos,
			piece.yPos,
			pieceWidth,
			pieceHeight
		);
		stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
		if (currentDropPiece == null) {
			if (
				mouse.x < piece.xPos ||
				mouse.x > piece.xPos + pieceWidth ||
				mouse.y < piece.yPos ||
				mouse.y > piece.yPos + pieceHeight
			) {
				//NOT OVER
			} else {
				currentDropPiece = piece;
				stage.save();
				stage.globalAlpha = 0.4;
				stage.fillStyle = PUZZLE_HOVER_COLOR;
				stage.fillRect(
					currentDropPiece.xPos,
					currentDropPiece.yPos,
					pieceWidth,
					pieceHeight
				);
				stage.restore();
			}
		}
	}
	stage.save();
	stage.globalAlpha = 0.6;
	stage.drawImage(
		img,
		currentPiece.sx,
		currentPiece.sy,
		pieceWidth,
		pieceHeight,
		mouse.x - pieceWidth / 2,
		mouse.y - pieceHeight / 2,
		pieceWidth,
		pieceHeight
	);
	stage.restore();
	stage.strokeRect(
		mouse.x - pieceWidth / 2,
		mouse.y - pieceHeight / 2,
		pieceWidth,
		pieceHeight
	);
}

function onPuzzleClick(e) {
	if (e.layerX || e.layerX === 0) {
		mouse.x = e.layerX - canvas.offsetLeft;
		mouse.y = e.layerY - canvas.offsetTop;
	} else if (e.offsetX || e.offsetX === 0) {
		mouse.x = e.offsetX - canvas.offsetLeft;
		mouse.y = e.offsetY - canvas.offsetTop;
	}
	currentPiece = checkPieceClicked();
	if (currentPiece !== null) {
		stage.clearRect(
			currentPiece.xPos,
			currentPiece.yPos,
			pieceWidth,
			pieceHeight
		);
		stage.save();
		stage.globalAlpha = 0.9;
		stage.drawImage(
			img,
			currentPiece.sx,
			currentPiece.sy,
			pieceWidth,
			pieceHeight,
			mouse.x - pieceWidth / 2,
			mouse.y - pieceHeight / 2,
			pieceWidth,
			pieceHeight
		);
		stage.restore();
		document.onpointermove = updatePuzzle;
		document.onpointerup = pieceDropped;
	}
}

function endGame() {
	document.onpointerdown = null;
	document.onpointermove = null;
	document.onpointerup = null;
	
	document.getElementById('deck').innerHTML = '';
	document.getElementById('deck').appendChild(img);
	
	const youWonText = "You won! Congratulations!";
	status.textContent = youWonText;
	console.log(youWonText);
	notifyMe(youWonText);
}

function pieceDropped(e) {
	document.onpointermove = null;
	document.onpointerup = null;
	if (currentDropPiece !== null) {
		let tmp = {
			xPos: currentPiece.xPos,
			yPos: currentPiece.yPos
		};
		currentPiece.xPos = currentDropPiece.xPos;
		currentPiece.yPos = currentDropPiece.yPos;
		currentDropPiece.xPos = tmp.xPos;
		currentDropPiece.yPos = tmp.yPos;
	}
	checkWin();
}

function checkWin() {
	stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
	let gameWin = true;
	for (piece of pieces) {
		stage.drawImage(
			img,
			piece.sx,
			piece.sy,
			pieceWidth,
			pieceHeight,
			piece.xPos,
			piece.yPos,
			pieceWidth,
			pieceHeight
		);
		stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
		if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
			//gameWin = false;
		}
	}
	if (gameWin) {
		endGame();
	}
}

function shuffleArray(o) {
	for (
		var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
	);
	return o;
}

// Notification API
function notifyMe(message) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    const notification = new Notification(message);
		
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const notification = new Notification(message);
      }
    });
  }
}

// Events
geoButton.addEventListener("click", geoFindMe);
rasterButton.addEventListener("click", createMapImage);
puzzleButton.addEventListener("click", createPuzzle);
