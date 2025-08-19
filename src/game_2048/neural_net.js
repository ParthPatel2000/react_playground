
// Complete ONNX setup that works in both Node.js and browser
let ort;
let session;
const MOVE_DIRECTIONS = ['up', 'down', 'left', 'right'];

function getModelPath() {
    if (typeof window !== 'undefined') {
        // Browser - file must be in public directory
        const modelPath = `${import.meta.env.BASE_URL}/Onnx_models/model_2048_for_js.onnx`;
        return modelPath;
    } else {
        // Node.js - can use your current path
        return 'public/Onnx_models/model_2048_for_js.onnx';
    }
}

async function initializeOrt() {
    if (!ort) {
        const isNode = typeof process !== 'undefined' &&
            process.versions &&
            process.versions.node &&
            typeof window === 'undefined';

        if (isNode) {
            // Node.js environment
            ort = await import('onnxruntime-node');
        } else {
            // Browser environment
            ort = await import('onnxruntime-web');

            // Configure for browser
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/';
            ort.env.wasm.numThreads = 1;
            ort.env.logLevel = 'warning';

            // Wait for WASM to initialize
            try {
                await ort.env.wasm.init();
            } catch (wasmError) {
                console.warn('WASM initialization failed, using CPU fallback:', wasmError);
            }
        }
    }
    return ort;
}

async function loadModel(modelPath = getModelPath()) {
    await initializeOrt();

    try {
        const options = {};

        // For browser, specify execution providers explicitly
        if (typeof window !== 'undefined') {
            options.executionProviders = ['cpu']; // Safe fallback
        }

        session = await ort.InferenceSession.create(modelPath, options);
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Failed to load model:', error);

        // Try with different execution providers as fallback
        if (typeof window !== 'undefined') {
            try {
                console.log('Trying with WASM execution provider...');
                const wasmOptions = { executionProviders: ['wasm'] };
                session = await ort.InferenceSession.create(modelPath, wasmOptions);
                console.log('Model loaded with WASM provider');
            } catch (wasmError) {
                console.error('WASM fallback also failed:', wasmError);
                throw error;
            }
        } else {
            throw error;
        }
    }
}

export async function NeuralNet(gameboard) {
    const preProcessBoard = (board) => {
        return board.flat().map(x => Math.log2(x === 0 ? 1 : x) / 16); //normalize by max tile (65536)
    };

    // Ensure model is loaded
    if (!session) {
        await loadModel();
    }

    // Ensure ort is initialized
    if (!ort) {
        await initializeOrt();
    }

    try {
        // Create input tensor
        const processedBoard = preProcessBoard(gameboard);
        console.log("Processed Board for NN:", processedBoard);

        const inputTensor = new ort.Tensor('float32',
            Float32Array.from(processedBoard),
            [1, processedBoard.length]
        );

        const feeds = { input: inputTensor };

        // Run inference
        const results = await session.run(feeds);
        const output = results.output.data; // Array of scores for each move

        // Find index of max score
        let maxIndex = 0;
        let maxScore = output[0];

        for (let i = 1; i < output.length; i++) {
            if (output[i] > maxScore) {
                maxIndex = i;
                maxScore = output[i];
            }
        }

        return {
            direction: MOVE_DIRECTIONS[maxIndex],
            confidence: maxScore,
            allScores: Array.from(output)
        };

    } catch (error) {
        console.error('Error during neural network inference:', error);
        throw error;
    }
}

// Optional: Add a function to cleanup resources
export function cleanup() {
    if (session) {
        session.release();
        session = null;
    }
}
