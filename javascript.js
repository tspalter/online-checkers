//global variables
var apiKey = "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36";
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
var contor = 0,
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

var p1name = "\u00D7";
var p2name = "\u00D7";
var p1Win = false;
var p2Win = false;

//global var to get player info
var player;


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
    if (windowWidth < 650) {
      this.id.style.background = "url('Red Checker - King small.png')";
    }
    else {
      this.id.style.background = "url('Red Checker - King.png')";
    }
  }
  if (this.coordY == 1 && !this.king && this.color == "black") {
    this.king = true;
    if (windowWidth < 650) {
      this.id.style.background = "url('Black Checker - King small.png')";
    }
    else {
      this.id.style.background = "url('Black Checker - King.png')";
    }
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

//Piece selection
the_checker = r_checker;

//Function to show available moves for a selected piece
function showMoves(piece) {
  var match = false;
  mustAttack = false;
  if (selectedPiece) {
    erase_roads(selectedPiece);
  }
  selectedPiece = piece;
  var i, j; //used to maintain active pieces
  for (j = 1; j <= 12; j++) {
    if (the_checker[j].id == piece) {
      i = j;
      selectedPieceIndex = j;
      match = true;
    }
  }
  if (moveOne && !attackMoves(moveOne)) {
    changeTurns(moveOne);
    moveOne = undefined;
    return false;
  }
  if (moveOne && moveOne != the_checker[i]) {
    return false;
  }
  //no match is found, happens when it's one player's turn but they click on an opponent's piece
  if (!match) {
    return 0;
  }
  //set edges and movements of the piece that are possible
  //For a red piece
  if (the_checker[i].color == "red") {
    tableLimit = 8;
    tableLimitRight = 1;
    tableLimitLeft = 8;
    moveUpRight = 7;
    moveUpLeft = 9;
    moveDownRight = -9;
    moveDownLeft = -7
  }
  //For a black piece
  else {
    tableLimit = 1;
    tableLimitRight = 8;
    tableLimitLeft = 1;
    moveUpRight = -7;
    moveUpLeft = -9;
    moveDownRight = 9;
    moveDownLeft = 7;
  }

  //Attack Check
  attackMoves(the_checker[i]); //Check if this piece can attack

  //Verify each move, if the piece can/cannot move there
  if (!mustAttack) {
    downLeft = checkMove(the_checker[i], tableLimit, tableLimitRight,
      moveUpRight, downLeft);
    downRight = checkMove(the_checker[i], tableLimit, tableLimitLeft,
      moveUpLeft, downRight);
    //check if piece is a king
    if (the_checker[i].king) {
      upLeft = checkMove(the_checker[i], reverse_tableLimit, tableLimitRight,
        moveDownRight, upLeft);
      upRight = checkMove(the_checker[i], reverse_tableLimit, tableLimitLeft,
        moveDownLeft, upRight);
    }
  }
  if (downLeft || downRight || upLeft || upRight) {
    return true;
  }
  return false;
}

//Function to delete image of Checker
function erase_roads(piece) {
  if (downRight) {
    block[downRight].id.style.background = "url('Black Square.jpg')";
  }
  if (downLeft) {
    block[downLeft].id.style.background = "url('Black Square.jpg')";
  }
  if (upRight) {
    block[upRight].id.style.background = "url('Black Square.jpg')";
  }
  if (upLeft) {
    block[upLeft].id.style.background = "url('Black Square.jpg')";
  }
}

//Piece movement function
function makeMove(index) {
  var isMove = false;
  //For when game has started but no piece is selected
  if (!selectedPiece) {
    return false;
  }
  if (index != upLeft && index != upRight && index != downRight && index != downLeft) {
    erase_roads(0);
    selectedPiece = undefined;
    return false;
  }
  //Perspective of moving player
  if (the_checker[1].color == "red") {
    cpy_downRight = upRight;
    cpy_downLeft = upLeft;
    cpy_upRight = downRight;
    cpy_upLeft = downLeft;
  } else {
    cpy_downRight = upLeft;
    cpy_downLeft = upRight;
    cpy_upRight = downLeft;
    cpy_upLeft = downRight;
  }
  //For ability to attack
  if (mustAttack) {
    multiplier = 2;
  } else {
    multiplier = 1;
  }

  //Different movements
  //Up Right
  if (index == cpy_upRight) {
    isMove = true;
    if (the_checker[1].color == "red") {
      //Move the piece
      executeMove(multiplier * 1, multiplier * 1, multiplier * 9);
      //Eliminate the piece if it was jumped
      if (mustAttack) {
        eliminateCheck(index - 9);
      }
    } else {
      executeMove(multiplier * 1, multiplier * -1, multiplier * -7);
      //Eliminate the piece if it was jumps
      if (mustAttack) {
        eliminateCheck(index + 7);
      }
    }
  }

  //Up Left
  if (index == cpy_upLeft) {
    isMove = true;
    if (the_checker[1].color == "red") {
      //Move the piece
      executeMove(multiplier * -1, multiplier * 1, multiplier * 7);
      //Eliminate the piece if it was jumped
      if (mustAttack) {
        eliminateCheck(index - 7);
      }
    } else {
      executeMove(multiplier * -1, multiplier * -1, multiplier * -9);
      //Eliminate the piece if it was jumps
      if (mustAttack) {
        eliminateCheck(index + 9);
      }
    }
  }

  //For King Movements
  if (the_checker[selectedPieceIndex].king) {
    //Down Right
    if (index == cpy_downRight) {
      isMove = true;
      if (the_checker[1].color == "red") {
        //Move the piece
        executeMove(multiplier * 1, multiplier * -1, multiplier * -7);
        //Eliminate the piece if it was jumped
        if (mustAttack) {
          eliminateCheck(index + 7);
        }
      } else {
        executeMove(multiplier * 1, multiplier * 1, multiplier * 9);
        //Eliminate the piece if it was jumps
        if (mustAttack) {
          eliminateCheck(index - 9);
        }
      }
    }

    //Down Left
    if (index == cpy_downLeft) {
      isMove = true;
      if (the_checker[1].color == "red") {
        //Move the piece
        executeMove(multiplier * -1, multiplier * -1, multiplier * -9);
        //Eliminate the piece if it was jumped
        if (mustAttack) {
          eliminateCheck(index + 9);
        }
      } else {
        executeMove(multiplier * -1, multiplier * 1, multiplier * 7);
        //Eliminate the piece if it was jumps
        if (mustAttack) {
          eliminateCheck(index - 7);
        }
      }
    }
  }

  erase_roads(0);
  the_checker[selectedPieceIndex].checkIfKing();

  //exchange player turns
  if (isMove) {
    //playSound(moveSound);
    moveTwo = undefined;
    if (mustAttack) {
      moveTwo = attackMoves(the_checker[selectedPieceIndex]);
    }
    if (moveTwo) {
      moveOne = the_checker[selectedPieceIndex];
      showMoves(moveOne);
    } else {
      moveOne = undefined;
      changeTurns(the_checker[1]);
      gameOver = checkIfLost();
      if (gameOver) {
        setTimeout(declareWinner(), 3000);
        return false;
      }
      gameOver = checkForMoves();
      if (gameOver) {
        setTimeout(declareWinner(), 3000);
        return false;
      }
    }
  }
}

//Change Piece position
function executeMove(x, y, nSquare) {
  //Shift piece to specific coordinate
  the_checker[selectedPieceIndex].changeCoord(x, y);
  the_checker[selectedPieceIndex].setCoord(0, 0);
  //Leaves current space, moves to next space
  block[the_checker[selectedPieceIndex].occupied_square].occupied = false;
  block[the_checker[selectedPieceIndex].occupied_square + nSquare].occupied = true;
  block[the_checker[selectedPieceIndex].occupied_square + nSquare].pieceId =
    block[the_checker[selectedPieceIndex].occupied_square].pieceId;
  block[the_checker[selectedPieceIndex].occupied_square].pieceId = undefined;
  the_checker[selectedPieceIndex].occupied_square += nSquare;
}

function checkMove(aPiece, tLimit, tLimit_Side, moveDir, actualDir) {
  if (aPiece.coordY != tLimit) {
    if (aPiece.coordX != tLimit_Side && !block[aPiece.occupied_square + moveDir].occupied) {
      block[aPiece.occupied_square + moveDir].id.style.background = "url('Black Square - Highlight.jpg')";
      actualDir = aPiece.occupied_square + moveDir;
    } else {
      actualDir = undefined;
    }
  } else {
    actualDir = undefined;
  }
  return actualDir;
}

//Check to see if piece can attack
function checkAttack(check, x, y, negX, negY, squareMove, direction) {
  if (check.coordX * negX >= x * negX && check.coordY * negY <= y * negY &&
    block[check.occupied_square + squareMove].occupied && block[check.occupied_square +
      squareMove].pieceId.color != check.color && !block[check.occupied_square + squareMove * 2].occupied) {
    mustAttack = true;
    direction = check.occupied_square + (squareMove * 2);
    block[direction].id.style.background = "url('Black Square - Highlight.jpg')";
    return direction;
  } else {
    direction = undefined;
    return direction;
  }
}

//Attacked piece is eliminated
function eliminateCheck(index) {
  if (index < 1 || index > 64) {
    return 0;
  }
  var x = block[index].pieceId;
  x.alive = false;
  block[index].occupied = false;
  x.id.style.display = "none";
}

//Attack the opponent!
function attackMoves(check) {
  upRight = undefined;
  upLeft = undefined;
  downRight = undefined;
  downLeft = undefined;

  //Attacks available for king pieces
  if (check.king) {
    if (check.color == "red") {
      upRight = checkAttack(check, 6, 3, -1, -1, -7, upRight);
      upLeft = checkAttack(check, 3, 3, 1, -1, -9, upLeft);
    } else {
      downLeft = checkAttack(check, 3, 6, 1, 1, 7, downLeft);
      downRight = checkAttack(check, 6, 6, -1, 1, 9, downRight);
    }
  }
  if (check.color == "red") {
    downLeft = checkAttack(check, 3, 6, 1, 1, 7, downLeft);
    downRight = checkAttack(check, 6, 6, -1, 1, 9, downRight);
  } else {
    upRight = checkAttack(check, 6, 3, -1, -1, -7, upRight);
    upLeft = checkAttack(check, 3, 3, 1, -1, -9, upLeft);
  }

  if (check.color == "black" && (upRight || upLeft || downLeft || downRight)) {
    var p = upLeft;
    upLeft = downLeft;
    downLeft = p;

    p = upRight;
    upRight = downRight;
    downRight = p;

    p = downLeft;
    downLeft = downRight;
    downRight = p;

    p = upRight;
    upRight = upLeft;
    upLeft = p;
  }
  if (upLeft != undefined || upRight != undefined || downLeft != undefined || downRight != undefined) {
    return true;
  }
  return false;
}

//Change turns between players
function changeTurns(check) {
  if (check.color == "red") {
    the_checker = b_checker;
  } else {
    the_checker = r_checker;
  }
}

//Check to see if opponent has lost
function checkIfLost() {
  var i;
  for (i = 1; i <= 12; i++) {
    if (the_checker[i].alive) {
      return false;
    }
  }
  return true;
}

//Check to see if piece can move
function checkForMoves() {
  var i;
  for (i = 1; i <= 12; i++) {
    if (the_checker[i].alive && showMoves(the_checker[i].id)) {
      erase_roads(0);
      return false;
    }
  }
  return true;
}

//Someone has won the game!
function declareWinner() {
  shade.style.display = "inline";
  score.style.display = "block";

  if (the_checker[1].color == "red") {
    if (p2name != "\u00D7") {
      p2Win = true;
      winCount(player);
      score.innerHTML = p2name + " Wins!";
    }
    else {
      score.innerHTML = "Black Wins!";
    }
  }
  else {
    if (p1name != "\u00D7") {
      p1Win = true;
      winCount(player);
      score.innerHTML = p1name + " Wins!";
    }
    else {
      score.innerHTML = "Red Wins!";
    }
  }
}

function winCount(playersData) {
  let createRequest = new XMLHttpRequest();

  createRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log("call complete");
    }
    else if (this.readyState == 4) {
      console.log(this.responseText);
    }
  };
  if (p1Win) {
    for (var i = 0; i < playersData.player.length; i++) {
      if (playersData.player[i].name == p1name) {
        playersData.player[i].wins++;
      }
    }
    if (p2name != "\u00D7") {
      for (var i = 0; i < playersData.player.length; i++) {
        if (playersData.player[i].name == p2name) {
          playersData.player[i].losses++;
        }
      }
    }
    p1Win = false;
  }
  else if (p2Win) {
    for (var i = 0; i < playersData.player.length; i++) {
      if (playersData.player[i].name == p2name) {
        playersData.player[i].wins++;
      }

    }
    if (p1name != "\u00D7") {
      for (var i = 0; i < playersData.player.length; i++) {
        if (playersData.player[i].name == p1name) {
          playersData.player[i].losses++;
        }
      }
    }
    p2Win = false;
  }
  createRequest.open("PUT", "https://api.jsonbin.io/b/5ccfb25a4e6508572731c933", true);
  createRequest.setRequestHeader("Content-type", "application/json");
  createRequest.setRequestHeader("secret-key", "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36");
  createRequest.setRequestHeader("versioning", "false");
  createRequest.send(JSON.stringify(playersData));
}

//Find the size of the window
function getDimension() {
  contor++;
  windowHeight = window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  windowWidth = window.innderWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
}


//Handle new PLayer1 form submit
document.getElementById('p1').addEventListener("submit", function(event) {
  console.log(event);
  event.preventDefault();
  var data = {
    name: player1Input.value
  }
  //Initialize AJAX
  let createRequest = new XMLHttpRequest();

  createRequest.onreadystatechange = function() {
    //wait for readyState = 4 & 200 response
    if (this.readyState == 4 && this.status == 200) {
      //parse JSON
      player = JSON.parse(this.responseText);
      // addPlayer1(player);
      var found = false;
      p1name = player1Input.value;
      for (var p of player.player) {
        if (p.name === player1Input.value) {
          found = true;
          break;
        }
      }
      if (!found) {
        //Create player
        createPlayer1(player);
      }
      addPlayer1(player);
    } else if (this.readyState == 4) {
      console.log(this.responseText);
    }
  };
  createRequest.open("GET", "https://api.jsonbin.io/b/5ccfb25a4e6508572731c933/12", true);
  createRequest.setRequestHeader("secret-key", "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36");
  createRequest.setRequestHeader("versioning", "false");
  createRequest.send();
});

//Handle new PLayer2 form submit
document.getElementById('p2').addEventListener("submit", function(event) {
  console.log(event);
  event.preventDefault();
  var data = {
    name: player2Input.value
  }
  //Initialize AJAX
  let createRequest = new XMLHttpRequest();

  createRequest.onreadystatechange = function() {
    //wait for readyState = 4 & 200 response
    if (this.readyState == 4 && this.status == 200) {
      //parse JSON
      player = JSON.parse(this.responseText);
      var found = false;
      p2name = player2Input.value;
      for (var p of player.player) {
        if (p.name === player2Input.value) {
          found = true;
          break;
        }
      }
      if (!found) {
        //Create player
        createPlayer2(player);
      }
      addPlayer2(player);
    } else if (this.readyState == 4) {
      console.log(this.responseText);
    }
  };
  createRequest.open("GET", "https://api.jsonbin.io/b/5ccfb25a4e6508572731c933/12", true);
  createRequest.setRequestHeader("secret-key", "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36");
  createRequest.setRequestHeader("versioning", "false");
  createRequest.send();
});

function createPlayer1(playersData) {
  var createRequest = new XMLHttpRequest();
  var newPlayer = {name: player1Input.value, wins: 0, losses: 0};
  playersData.player.push(newPlayer);
  createRequest.open("PUT", "https://api.jsonbin.io/b/5ccfb25a4e6508572731c933", true);
  createRequest.setRequestHeader("Content-type", "application/json");
  createRequest.setRequestHeader("secret-key", "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36");
  createRequest.setRequestHeader("versioning", "false");
  createRequest.send(JSON.stringify(playersData));
}

function createPlayer2(playersData) {
  var createRequest = new XMLHttpRequest();
  var newPlayer = {name: player2Input.value, wins: 0, losses: 0};
  playersData.player.push(newPlayer);
  createRequest.open("PUT", "https://api.jsonbin.io/b/5ccfb25a4e6508572731c933", true);
  createRequest.setRequestHeader("Content-type", "application/json");
  createRequest.setRequestHeader("secret-key", "$2a$10$f4dPyKG5gkCRq8mJ1CfubOzdCVosqm5NLju6WZ5lW8tjJSVZ6vT36");
  createRequest.setRequestHeader("versioning", "false");
  createRequest.send(JSON.stringify(playersData));
}

//add Player1 to game
function addPlayer1(playersData) {
  var playerText = document.createElement("p");
  var p1data = "";
  for (var i = 0; i < playersData.player.length; i++) {
    if (playersData.player[i].name == player1Input.value) {
        p1name = playersData.player[i].name;
        p1data = playersData.player[i].name + ": " + playersData.player[i].wins + "-" + playersData.player[i].losses;
    }
  }
  console.log(p1name);
  playerText.innerText = p1data;
  document.getElementById("p1").appendChild(playerText);
  document.getElementById("player1Input").style.display = "none";
  document.getElementById("add-player1").style.display = "none";
}

//add Player2 to game
function addPlayer2(playersData) {
  var playerText = document.createElement("p");
  var p2data = "";
  for (var i = 0; i < playersData.player.length; i++) {
    if (playersData.player[i].name == player2Input.value) {
        p2name = playersData.player[i].name;
        p2data = playersData.player[i].name + ": " + playersData.player[i].wins + "-" + playersData.player[i].losses;
    }
  }
  console.log(p2name);
  playerText.innerText = p2data;
  document.getElementById("p2").appendChild(playerText);
  document.getElementById("player2Input").style.display = "none";
  document.getElementById("add-player2").style.display = "none";
}

document.getElementsByTagName("BODY")[0].onresize = function() {
  getDimension();
  var cpy_bigScreen = bigScreen;

  if (windowWidth < 650) {
    if (checker.king) {
      if (checker.color == "red") {
        this.id.style.background = "url('Red Checker - King small.png')";
      }
      else {
        this.id.style.background = "url('Black Checker - King small.png')";
      }
    }
    moveLength = 50;
    moveDeviation = 6;
    if (bigScreen == 1) bigScreen = -1;
  }
  if (windowWidth > 650) {
    if (checker.king) {
      if (checker.color == "red") {
        this.id.style.background = "url('Red Checker - King.png')";
      }
      else {
        this.id.style.background = "url('Black Checker - King.png')";
      }
    }
    moveLength = 80;
    moveDeviation = 10;
    if (bigScreen == -1) bigScreen = 1;
  }

  if (bigScreen != cpy_bigScreen) {
    for (var i = 1; i <= 12; i++) {
      b_checker[i].setCoord(0, 0);
      r_checker[i].setCoord(0, 0);
    }
  }
}
