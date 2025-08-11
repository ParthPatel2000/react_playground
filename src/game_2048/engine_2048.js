let isDev = true;
let log = isDev ? console.log : () => {};


let gameboard;

export function initGameboard(rows, cols) {
  gameboard = Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function getGameboard() {
  return gameboard;
}

export function addTile() {
  let emptyTiles = [];
  for (let row = 0; row < gameboard.length; row++) {
    for (let col = 0; col < gameboard[row].length; col++) {
      if (gameboard[row][col] === 0) {
        emptyTiles.push({ row, col });
      }
    }
  }
  if (emptyTiles.length === 0) {
    alert("No empty tiles left");
    return;
  }

  const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  gameboard[row][col] = 2;
  return;
}

export function move(direction) {
  // Implement the logic to move tiles in the specified direction
  switch (direction) {
    case "UP":
      moveUP();
      break;
    case "DOWN":
      moveDOWN();
      break;
    case "LEFT":
      moveLEFT();
      break;
    case "RIGHT":
      moveRIGHT();
      break;
    default:
      break;
  }
}

function moveUP() {

  let cols = gameboard[0].length;
  for (let col = 0; col < cols; col++) {
    let rows = gameboard.length;
    let trailPtr = -1;
    for (let row = 0; row < rows; row++) {
      if (gameboard[row][col] !== 0) {
        //initialize the trailptr if it hasnt been, 
        if (trailPtr === -1) {
          //if the first non zero tile is not on top, start moving it to the top.
          if (row !== 0) {
            gameboard[0][col] = gameboard[row][col];
            gameboard[row][col] = 0;
          }
          trailPtr = 0;
        }
        else {
          //remove any spaces and move the tiles up.
          if (gameboard[trailPtr][col] === 0) {
            gameboard[trailPtr][col] = gameboard[row][col];
            gameboard[row][col] = 0;
            log(`Moved tile from Row: ${row}, Col: ${col} to TrailPtr: ${trailPtr}`);
          }
          //merge the tiles if the last time is the same as the tile we are looking at 
          else if (gameboard[trailPtr][col] === gameboard[row][col]) {
            gameboard[trailPtr][col] *= 2;
            gameboard[row][col] = 0;
            trailPtr++;
            log(`Merged tile at Row: ${row}, Col: ${col} to TrailPtr: ${trailPtr}`);
          }
          //everything else just move the pointer lower.
          else {
            trailPtr++;
            if (trailPtr !== row) {
              gameboard[trailPtr][col] = gameboard[row][col];
              gameboard[row][col] = 0;
            }
            log(`Moved TrailPtr to: ${trailPtr}`);
          }
        }
      }
      log(`Row: ${row}, Col: ${col}, TrailPtr: ${trailPtr}`);
      log('tile:', gameboard[row][col]);
    }
  }
  addTile(); // add a new tile after the move
  log(getGameboard());
  return;
}

function transpose(){
  const newGameboard = gameboard[0].map((_, colIndex) =>
    gameboard.map(row => row[colIndex])
  );
  gameboard = newGameboard;
}

function moveDOWN() {
  gameboard.reverse();
  moveUP();
  gameboard.reverse();
  // Reverse the gameboard back to original orientation

  return;
}

function moveLEFT() {
  transpose();
  moveUP();
  transpose();
  return;
}

function moveRIGHT() {
  transpose();
  moveDOWN();
  transpose();
  return;
}


// Main function for standalone testing
function main() {
  gameboard = [
  [2, 0, 0, 2],
  [0, 0, 0, 0],
  [2, 0, 2, 2],
  [4, 0, 4, 2],
  [2, 2, 0, 0],
  [2, 0, 0, 0],
  [2, 0, 0, 0]
];


  log("Gameboard after adding two tiles:");
  // move("UP");
  // log(getGameboard());
  move("LEFT");
  log(getGameboard());
}
main();