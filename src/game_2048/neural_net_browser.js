// neural_net_browser.js
// ONNX Runtime Web for browser usage
import * as ort from 'onnxruntime-web';

const MOVE_DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function getModelPath() {
    // Browser: model must be in public directory
    return '/Onnx_models/model_2048_for_js.onnx';
}

let session;

export async function FC_NeuralNet(gameboard) {
    const preProcessBoard = (board) => {
        return board.flat().map(x => Math.log2(x === 0 ? 1 : x) / 16); // normalize by max tile (65536)
    };

    // Load model if not already loaded
    if (!session) {
        const modelPath = getModelPath();
        session = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] });
        console.log('Model loaded successfully (browser)');
    }

    try {
        const processedBoard = preProcessBoard(gameboard);
        const inputTensor = new ort.Tensor('float32', Float32Array.from(processedBoard), [1, processedBoard.length]);
        const feeds = { input: inputTensor };
        const results = await session.run(feeds);
        const output = results.output.data;

        let maxIndex = 0;
        let maxScore = output[0];
        for (let i = 1; i < output.length; i++) {
            if (output[i] > maxScore) {
                maxIndex = i;
                maxScore = output[i];
            }
        }
        console.log("Direction:", MOVE_DIRECTIONS[maxIndex],"confidence:", maxScore);
        return {
            direction: MOVE_DIRECTIONS[maxIndex],
            confidence: maxScore,
            allScores: Array.from(output)
        };
    } catch (error) {
        console.error('Error during neural network inference (browser):', error);
        throw error;
    }
}

let cnnSession;

export async function CNN_NeuralNet(gameboard) {
    // Normalize board like in PyTorch training
    const preProcessBoard = (board) => {
        return board.map(row => 
            row.map(x => Math.log2(x === 0 ? 1 : x) / 12)  //normalize the board values to be between 0 and 1
        );
    };

    if (!cnnSession) {
        const modelPath = getModelPath(); // path to CNN ONNX model
        cnnSession = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] });
        console.log('CNN Model loaded successfully (browser)');
    }

    try {
        const processedBoard2D = preProcessBoard(gameboard);

        // Flatten to 1D array for ONNX but keep shape as [1,1,5,4]
        const flattened = processedBoard2D.flat();
        const inputTensor = new ort.Tensor(
            'float32',
            Float32Array.from(flattened),
            [1, 1, 5, 4]
        );

        const feeds = { input: inputTensor };
        const results = await cnnSession.run(feeds);
        const output = results.output.data;

        // Pick the move with max score
        let maxIndex = 0;
        let maxScore = output[0];
        for (let i = 1; i < output.length; i++) {
            if (output[i] > maxScore) {
                maxIndex = i;
                maxScore = output[i];
            }
        }

        console.log("Direction:", MOVE_DIRECTIONS[maxIndex], "confidence:", maxScore);
        return {
            direction: MOVE_DIRECTIONS[maxIndex],
            confidence: maxScore,
            allScores: Array.from(output)
        };
    } catch (error) {
        console.error('Error during CNN inference (browser):', error);
        throw error;
    }
}
export async function NeuralNet(gameboard, useCNN = false) {
    if (useCNN) {
        return await CNN_NeuralNet(gameboard);
    } else {
        return await FC_NeuralNet(gameboard);
    }
}

export function cleanup() {
    if (session) {
        session.release();
        session = null;
    }
}
