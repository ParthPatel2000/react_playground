import seedrandom from "seedrandom";

const RANDOM_SEED = 42;
// const random = seedrandom(RANDOM_SEED);
const random = Math.random; // Use Math.random for simplicity in this example

let isDev = false;
let log = isDev ? console.log : () => { };

let gameboard;
let score = 0;
let movesCount = 0;
let isGameOver = false;

export function initGameboard(rows = 5, cols = 4) {
  console.log(`Initializing gameboard with size ${rows}x${cols}`);
  gameboard = Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function getGameboard() {
  return gameboard;
}

export function getScore() {
  return score;
}

export function getMovesCount() {
  return movesCount;
}

export function getIsGameOver() {
  return isGameOver;
}

export function resetGame() {
  initGameboard();
  addTile();
  addTile();
  isGameOver = false;
  score = 0;
  movesCount = 0;
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
    // alert("No empty tiles left");
    console.log("Game over");
    isGameOver = true;
    return;
  }

  const { row, col } = emptyTiles[Math.floor(random() * emptyTiles.length)];
  let random_tiles = [2, 4]; // 2 has a 90% chance, 4 has a 10% chance
  gameboard[row][col] = random_tiles[random() < 0.9 ? 0 : 1];
  return;
}

export function move(direction) {
  if (isGameOver) {
    console.log("Cannot Move");
    resetGame();
    return;
  }
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
  movesCount += 1;
}

function moveUP() {

  let addedScore = 0;

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
            addedScore += gameboard[trailPtr][col];  // add the score to the total of this move.
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
  score += addedScore + Math.floor(movesCount / 10) * 10;
  log(getGameboard());
  return;
}

function transpose() {
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
// function main() {
//   gameboard = [
//     [2, 0, 0, 2],
//     [0, 0, 0, 0],
//     [2, 0, 2, 2],
//     [4, 0, 4, 2],
//     [2, 2, 0, 0],
//     [2, 0, 0, 0],
//     [2, 0, 0, 0]
//   ];


//   log("Gameboard after adding two tiles:");
//   // move("UP");
//   // log(getGameboard());
//   move("LEFT");
//   log(getGameboard());
// }
// main();