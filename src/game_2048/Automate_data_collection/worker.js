import { parentPort, workerData } from 'worker_threads';
import { initGameboard, getGameboard, addTile, move, getScore, getIsGameOver, getMovesCount } from '../engine_2048.js';
import { getMove } from '../heuristic_ai.js';

const numGames = workerData.numGames;

async function runGames() {
    for (let i = 0; i < numGames; i++) {
        initGameboard(5, 4);
        addTile();
        addTile();
        
        let gameOver = false;
        let movesCount = 0;
        const gameHistory = [];
        
        while (!gameOver) {
            const board = getGameboard();
            const bestMoveObj = await getMove(board, "neuralNet");
            
            if (!bestMoveObj || !bestMoveObj.direction) {
                gameOver = true;
                break;
            }
            
            gameHistory.push({
                board: board.flat(),
                direction: bestMoveObj.direction,
                score: getScore(),
                movesCount: getMovesCount()
            });
            
            move(bestMoveObj.direction);
            gameOver = getIsGameOver();
            movesCount++;
        }
        
        // Send progress update to main thread
        parentPort.postMessage({ type: 'log', message: `Game ${i + 1}/${numGames} finished with ${movesCount} moves` });

        parentPort.postMessage({ type: 'result', data: gameHistory });
    }

    parentPort.postMessage({ type: 'done' });
}

runGames();



// // worker.js
// import { parentPort, workerData } from 'worker_threads';
// import { initGameboard, getGameboard, addTile, move, getScore, getIsGameOver, getMovesCount } from '../engine_2048.js';
// import { getMove } from '../heuristic_ai.js';

// const numGames = workerData.numGames;

// function log(...args) {
//   parentPort.postMessage({ type: 'log', message: args });
// }

// async function runGames() {
//     const gameHistoryAll = [];

//     for (let i = 0; i < numGames; i++) {
//         initGameboard(5, 4);
//         addTile();
//         addTile();
        
//         let gameOver = false;
//         let movesCount = 0;
//         const gameHistory = [];
        
//         while (!gameOver) {
//             const board = getGameboard();
//             const bestMoveObj = await getMove(board, "expectiMax");
            
//             if (!bestMoveObj || !bestMoveObj.direction) {
//                 gameOver = true;
//                 break;
//             }
            
//             // Save the state before move
//             gameHistory.push({
//                 board: board.flat(),
//                 direction: bestMoveObj.direction,
//                 score: getScore(),
//                 movesCount: getMovesCount()
//             });
            
//             move(bestMoveObj.direction);
//             gameOver = getIsGameOver();
//             movesCount++;
//         }

//         log(`Game ${i + 1} finished with moves: ${movesCount} `);
//         gameHistoryAll.push(gameHistory);
//     }

//     parentPort.postMessage({ type: 'result', data: gameHistoryAll }); // Send results back to main thread
// }

// runGames();
