// heuristic_ai.js

import seedrandom from "seedrandom";
// import { NeuralNet } from "./neural_net.js";
import { NeuralNet } from "./neural_net_browser.js"; // Use browser-specific neural net

const RANDOM_SEED = 42;
const random = seedrandom(RANDOM_SEED);

let isDev = false;
let log = isDev ? console.log : () => { };

let weights = {
    merges: 0.0,
    emptiness: 1.0,
    cluster: 1.0,
    monotonicity: 1.0
};

export function setExpectiMaxWeights(newWeights) {
    weights = { ...weights, ...newWeights };
}

function move(direction, gameboard) {
    // Always start with a fresh copy of the current gameboard
    let boardCopy = gameboard.map(row => [...row]);
    let boardState;
    let addedScore = 0;
    let result;
    switch (direction) {
        case "UP":
            result = moveUP(boardCopy);
            addedScore = result.score;
            boardState = result.gameboard;
            break;
        case "DOWN":
            result = moveDOWN(boardCopy);
            addedScore = result.score;
            boardState = result.gameboard;
            break;
        case "LEFT":
            result = moveLEFT(boardCopy);
            addedScore = result.score;
            boardState = result.gameboard;
            break;
        case "RIGHT":
            result = moveRIGHT(boardCopy);
            addedScore = result.score;
            boardState = result.gameboard;
            break;
        default:
            break;
    }
    return { score: addedScore, gameboard: boardState };
}


function moveUP(gameboard) {

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
                        // log(`Moved tile from Row: ${row}, Col: ${col} to TrailPtr: ${trailPtr}`);
                    }
                    //merge the tiles if the last time is the same as the tile we are looking at 
                    else if (gameboard[trailPtr][col] === gameboard[row][col]) {
                        gameboard[trailPtr][col] *= 2;
                        addedScore += gameboard[trailPtr][col];  // add the score to the total of this move.
                        gameboard[row][col] = 0;
                        trailPtr++;
                        // log(`Merged tile at Row: ${row}, Col: ${col} to TrailPtr: ${trailPtr}`);
                    }
                    //everything else just move the pointer lower.
                    else {
                        trailPtr++;
                        if (trailPtr !== row) {
                            gameboard[trailPtr][col] = gameboard[row][col];
                            gameboard[row][col] = 0;
                        }
                        // log(`Moved TrailPtr to: ${trailPtr}`);
                    }
                }
            }
            // log(`Row: ${row}, Col: ${col}, TrailPtr: ${trailPtr}`);
            // log('tile:', gameboard[row][col]);
        }
    }
    log("This move Merge score:", addedScore);
    return { score: addedScore, gameboard: gameboard };
}

function transpose(gameboard) {
    const newGameboard = gameboard[0].map((_, colIndex) =>
        gameboard.map(row => row[colIndex])
    );
    return newGameboard;
}

function moveDOWN(gameboard) {
    gameboard.reverse();
    let result = moveUP(gameboard);
    gameboard = result.gameboard;
    gameboard.reverse();
    // Reverse the gameboard back to original orientation

    return { score: result.score, gameboard: gameboard };
}

function moveLEFT(gameboard) {
    let transposed = transpose(gameboard);
    let result = moveUP(transposed);
    transposed = transpose(transposed);
    return { score: result.score, gameboard: transposed };
}

function moveRIGHT(gameboard) {
    let transposed = transpose(gameboard);
    let result = moveDOWN(transposed);
    transposed = result.gameboard;
    gameboard = transpose(transposed);
    return { score: result.score, gameboard: gameboard };
}

export async function getMove(gameboard, model) {

    console.log("Getting move using model:", model);
    let result;
    switch (model) {
        case "maximizeScore":
            return maximizeScore(gameboard);
        case "maximizeMerges":
            return maximizeMerges(gameboard);
        case "clusterTiles":
            return maximizeCloseness(gameboard);
        case "monotonicity":
            return maximizeMonotonicity(gameboard);
        case "expectiMax":
            result = expectiMax(gameboard, 2, true);
            return result.direction ? result : { direction: "UP" };
        case "neuralNet":
            result = await NeuralNet(gameboard, true);
            console.log("Using NeuralNet model");
            return result.direction ? result : { direction: "UP" };
        case "pythonQ":
            {
                const response = await fetch("http://localhost:5000/get_move", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ gameboard })
                });
                const data = await response.json();
                return data.direction ? data : { direction: "UP" };
            }
            
        default:
            throw new Error(`Unknown model: ${model}`);
    }

}

function maximizeScore(gameboard) {
    let bestMove = null;
    let bestScore = 0;
    // Simulate all possible moves
    for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
        let simulatedScore = move(direction, gameboard);
        if (simulatedScore > bestScore) {
            bestScore = simulatedScore;
            bestMove = direction;
        }
        log(`Simulated move ${direction}: Score = ${simulatedScore}`);
    }

    return { direction: bestMove ? bestMove : ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(random() * 4)] };
}

const countNonZero = (board) => {
    return board.flat().filter(val => val !== 0).length;
}; //count non-zero tiles

function normalizedEmptiness(gameboard) {
    const current = countNonZero(gameboard);
    const maxEmpty = gameboard.length * gameboard[0].length;
    if (maxEmpty === 0) return 0;
    return current / maxEmpty;
}

function maximizeMerges(gameboard) {
    let bestMove = null;
    let maxMerges = 0;
    // Simulate all possible moves
    for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
        let result = move(direction, gameboard);

        log("Input Gameboard:", gameboard);
        log("Result Gameboard:", result.gameboard);

        let merges = countNonZero(gameboard) - countNonZero(result.gameboard);
        if (merges > maxMerges) {
            maxMerges = merges;
            bestMove = direction;
        }
        log(`Simulated move ${direction}: Merges = ${merges}`);
    }

    return { direction: bestMove ? bestMove : ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(random() * 4)] };
}


const countClusterScore = (board) => {
    let score = 0;
    const rows = board.length;
    const cols = board[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 0) continue;
            const val = Math.log2(board[r][c]);

            // Right
            if (c + 1 < cols && board[r][c + 1] === board[r][c]) {
                score += val;
            }
            // Down
            if (r + 1 < rows && board[r + 1][c] === board[r][c]) {
                score += val;
            }
            // Diagonal down-right
            if (r + 1 < rows && c + 1 < cols && board[r + 1][c + 1] === board[r][c]) {
                score += val * 0.5; // less weight for diagonal
            }
            // Diagonal down-left
            if (r + 1 < rows && c - 1 >= 0 && board[r + 1][c - 1] === board[r][c]) {
                score += val * 0.5;
            }
        }
    }
    return score;
};


const buildIdealClusterBoard = (gameboard) => {
    const rows = gameboard.length;
    const cols = gameboard[0].length;

    // Count how many of each tile we have
    const counts = {};
    for (let val of gameboard.flat()) {
        if (val !== 0) {
            counts[val] = (counts[val] || 0) + 1;
        }
    }

    // Sort tile values high to low
    const tileValues = Object.keys(counts).map(Number).sort((a, b) => b - a);

    // Fill board grouping identical tiles together
    const ideal = Array.from({ length: rows }, () => Array(cols).fill(0));
    let r = 0, c = 0;
    for (let val of tileValues) {
        for (let i = 0; i < counts[val]; i++) {
            ideal[r][c] = val;
            c++;
            if (c >= cols) {
                c = 0;
                r++;
            }
        }
    }

    return ideal;
};

function normalizedClusterScore(board) {
    const current = countClusterScore(board);
    const ideal = buildIdealClusterBoard(board);
    const maxCluster = countClusterScore(ideal);
    if (maxCluster === 0) return 0;
    return current / maxCluster;
}

function maximizeCloseness(gameboard) {
    let bestMove = null;
    let maxClusterScore = 0;
    // Simulate all possible moves
    for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
        let result = move(direction, gameboard);
        log("Result Gameboard:", result.gameboard);

        let clusterScore = countClusterScore(result.gameboard);
        if (clusterScore > maxClusterScore) {
            maxClusterScore = clusterScore;
            bestMove = direction;
        }
        log(`Simulated move ${direction}: Cluster Score = ${clusterScore}`);
    }

    return { direction: bestMove ? bestMove : ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(random() * 4)] };
}

const calculateMonotonicity = (gameboard) => {

    let rows = gameboard.length;
    let cols = gameboard[0].length;
    let score = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (gameboard[row][col] !== 0) {
                let currentTile = Math.log2(gameboard[row][col]);
                //LOOKING RIGHT
                if (col + 1 < cols) {
                    let nextTile = gameboard[row][col + 1] ? Math.log2(gameboard[row][col + 1]) : 0;

                    if (nextTile <= currentTile) {
                        score += currentTile;
                    }
                    else if (nextTile > currentTile) {
                        score -= currentTile;
                    }
                }
                //LOOKING DOWN
                if (row + 1 < rows) {
                    let nextTile = gameboard[row + 1][col] ? Math.log2(gameboard[row + 1][col]) : 0;
                    if (nextTile <= currentTile) {
                        score += currentTile;
                    }
                    else if (nextTile > currentTile) {
                        score -= currentTile;
                    }
                }
            }
        }
    }
    return score;

};



const buildIdealBoard = (board) => {
    const rows = board.length;
    const cols = board[0].length;
    const tiles = board.flat().filter(x => x !== 0).sort((a, b) => b - a);
    // fill an empty board with zeros
    const ideal = Array.from({ length: rows }, () => Array(cols).fill(0));
    let idx = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (idx < tiles.length) {
                ideal[r][c] = tiles[idx++];
            }
        }
    }
    return ideal;
};

function normalizedMonotonicity(gameboard) {
    const current = calculateMonotonicity(gameboard);
    const ideal = buildIdealBoard(gameboard);
    const maxMono = calculateMonotonicity(ideal);
    if (maxMono === 0) return 0;           // avoid div by zero
    return Math.max(0, current / maxMono);              // value in (-inf, 1], usually 0..1
}

function maximizeMonotonicity(gameboard) {
    let bestMove = null;
    let maxMonotonicityScore = 0;
    // Simulate all possible moves
    for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
        let result = move(direction, gameboard);
        log("Result Gameboard:", result.gameboard);

        let monotonicityScore = calculateMonotonicity(result.gameboard);
        if (monotonicityScore > maxMonotonicityScore) {
            maxMonotonicityScore = monotonicityScore;
            bestMove = direction;
        }
        log(`Simulated move ${direction}: Monotonicity Score = ${monotonicityScore}`);
    }

    return { direction: bestMove ? bestMove : ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(random() * 4)] };

}

const normalizedMerges = (oldBoard, newBoard) => {
    const merges = countNonZero(oldBoard) - countNonZero(newBoard);
    const maxPossible = Math.floor(countNonZero(oldBoard) / 2);
    if (maxPossible === 0) return 0;
    return merges / maxPossible;
};


function maximizeWeightedScore(gameboard) {
    let MaxOverallScore = 0;
    let bestMove = null;
    // Simulate all possible moves
    for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
        let result = move(direction, gameboard);

        log("Result Gameboard:", result.gameboard);
        // let score = result.gameboard;
        let merges = normalizedMerges(gameboard, result.gameboard);
        let clusterScore = normalizedClusterScore(result.gameboard);
        let monotonicityScore = normalizedMonotonicity(result.gameboard);
        let emptinessScore = normalizedEmptiness(result.gameboard);
        let overallScore = (merges * weights.merges) + (clusterScore * weights.cluster) + (monotonicityScore * weights.monotonicity) + (emptinessScore * weights.emptiness);

        if (overallScore > MaxOverallScore) {
            MaxOverallScore = overallScore;
            bestMove = direction;
        }
        log(`Simulated move ${direction}: Merges = ${merges}, Cluster Score = ${clusterScore}, Monotonicity Score = ${monotonicityScore}`);
        log(`Overall Score = ${overallScore}`);
    }

    return { direction: bestMove ? bestMove : ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(random() * 4)], score: MaxOverallScore };
}

// ExpectiMax function
function expectiMax(board, depth, isMaxNode) {
    //leaf node
    if (depth === 0) {
        return maximizeWeightedScore(board).score;
    }

    // Max node should bifurcate into 4 possible moves
    if (isMaxNode) {
        let bestMove = null;
        let maxHeuristicScore = -Infinity;
        for (let direction of ["UP", "DOWN", "LEFT", "RIGHT"]) {
            let boardPostMove = move(direction, board).gameboard; //playing 1 move
            let score = expectiMax(boardPostMove, depth - 1, false); //exploring further moves
            // If the result is null, it means the game is over or no valid moves are left
            if (score === null) {
                continue;
            }
            // If the result is not null, it means we have a valid move and compare with other results.
            if (score > maxHeuristicScore) {
                maxHeuristicScore = score;
                bestMove = direction;
            }
        }
        return { direction: bestMove, score: maxHeuristicScore };
    }
    // Chance Node is simulating the random tile placement
    else {
        let emptyCells = [];
        //calculate and store all empty cells
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        // If there are no empty cells, return the best score found
        if (emptyCells.length === 0) {
            return null;
        }

        let score = 0;
        //simulating adding empty cells to the gameboard
        for (let cell of emptyCells) {
            let new2sBoard = board.map(row => [...row]);
            new2sBoard[cell.r][cell.c] = 2;
            score += 0.9 / emptyCells.length * expectiMax(new2sBoard, depth, true).score; //probability of 2 appearing

            let new4sBoard = board.map(row => [...row]);
            new4sBoard[cell.r][cell.c] = 4;
            score += 0.1 / emptyCells.length * expectiMax(new4sBoard, depth, true).score; //probability of 4 appearing

        }
        return score;
    }
}


// async function main() {
//     isDev = false;
//     const gameboard = [
//         [16, 8, 4, 2],
//         [16, 8, 4, 2],
//         [16, 8, 4, 2],
//         [16, 8, 4, 2],
//         [16, 8, 4, 0]
//     ];
//     // const gameboard = [
//     //     [2, 0],
//     //     [2, 0]
//     // ];

//     const bestMove = await getMove(gameboard, "neuralNet");
//     console.log("Best Move:", bestMove);
// }

// main();