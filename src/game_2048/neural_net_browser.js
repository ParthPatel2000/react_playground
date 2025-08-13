// neural_net_browser.js
// ONNX Runtime Web for browser usage
import * as ort from 'onnxruntime-web';

const MOVE_DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function getModelPath() {
    // Browser: model must be in public directory
    return '/Onnx_models/model_2048_for_js.onnx';
}

let session;

export async function NeuralNet(gameboard) {
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

export function cleanup() {
    if (session) {
        session.release();
        session = null;
    }
}
