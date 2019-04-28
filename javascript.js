//global variables
var square_class = document.getElementsByClassName('square');
var red_checker_class = document.getElementsByClassName('red_checker');
var black_checker_class = document.getElementsByClassName('black_checker');
var table = document.getElementById("table");
var score = document.getElementById("score");
var shade = document.getElementById("background");
var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
var windowWidth = window.innderWidth || document.documentElement.clientWidth || document.body.clientWidth;
var moveLength = 80;
var moveDeviation = 10;
var dimension = 1;
var selectedPiece, selectedPieceIndex;
var upRight, upLeft, downRight, downLeft; //movements, all possible for King
var counter = 0,
  gameOver = 0;
var bigScreen = 1;

var block = [];
var r_checker = [];
var b_checker = [];
var the_checker;
var moveOne;
var moveTwo;
var mustAttack = false;
var multiplier = 1;

var tableLimit, reverse_tableLimit, moveUpLeft, moveUpRight,
  moveDownLeft, moveDownRight, tableLimitLeft, tableLimitRight;

//Find the move distance based on window size
getDimension();
if (windowWidth > 640) {
  moveLength = 80;
  moveDeviation = 10;
} else {
  moveLength = 50;
  moveDeviation = 6;
}

//declarations
var square_p = function(square, index) {
  this.id = square;
  this.occupied = false;
  this.pieceId = undefined;
  this.id.onclick = function() {
    makeMove(index);
  }
}

var checker = function(piece, color, square) {
  this.id = piece;
  this.color = color;
  this.king = false;
  this.occupied_square = square;
  this.alive = true;
  this.attack = false;
  if (square % 8) {
    this.coordX = square % 8;
    this.coordY = Math.floor(square / 8) + 1;
  } else {
    this.coordX = 8;
    this.coordY = square / 8;
  }
  this.id.onclick = function() {
    showMoves(piece);
  }
}

checker.prototype.setCoord = function(X, Y) {
  var x = (this.coordX - 1) * moveLength + moveDeviation;
  var y = (this.coordY - 1) * moveLength + moveDeviation;
  this.id.style.top = y + 'px';
  this.id.style.left = x + 'px';
}

checker.prototype.changeCoord = function(X, Y) {
  this.coordY += Y;
  this.coordX += X;
}

checker.prototype.checkIfKing = function() {
  if (this.coordY == 8 && !this.king && this.color == "red") {
    this.king = true;
    this.id.style.border = "4px solid #FFFF00";
  }
  if (this.coordY == 1 && !this.king && this.color == "black") {
    this.king = true;
    this.id.style.border = "4px solid #FFFF000";
  }
}

//Initialize the playing field
for (var i = 1; i <= 64; i++) {
  block[i] = new square_p(square_class[i], i);
}

//Initialize pieces
//Red pieces
for (var i = 1; i <= 4; i++) {
  r_checker[i] = new checker(red_checker_class[i], "red", 2 * i - 1);
  r_checker[i].setCoord(0, 0);
  block[2 * i - 1].occupied = true;
  block[2 * i - 1].pieceId = r_checker[i];
}
for (var i = 5; i <= 8; i++) {
  r_checker[i] = new checker(red_checker_class[i], "red", 2 * i);
  r_checker[i].setCoord(0, 0);
  block[2 * i].occupied = true;
  block[2 * i].pieceId = r_checker[i];
}
for (var i = 9; i <= 12; i++) {
  r_checker[i] = new checker(red_checker_class[i], "red", 2 * i - 1);
  r_checker[i].setCoord(0, 0);
  block[2 * i - 1].occupied = true;
  block[2 * i - 1].pieceId = r_checker[i];
}

//Black pieces
for (var i = 1; i <= 4; i++) {
  b_checker[i] = new checker(black_checker_class[i], "black", 56 + 2 * i);
  b_checker[i].setCoord(0, 0);
  block[56 + 2 * i].occupied = true;
  block[56 + 2 * i].pieceId = b_checker[i];
}

for (var i = 5; i <= 8; i++) {
  b_checker[i] = new checker(black_checker_class[i], "black", 40 + 2 * i - 1);
  b_checker[i].setCoord(0, 0);
  block[40 + 2 * i - 1].occupied = true;
  block[40 + 2 * i - 1].pieceId = b_checker[i];
}

for (var i = 9; i <= 12; i++) {
  b_checker[i] = new checker(black_checker_class[i], "black", 24 + 2 * i);
  b_checker[i].setCoord(0, 0);
  block[24 + 2 * i].occupied = true;
  block[24 + 2 * i].pieceId = b_checker[i];
}
