
// Complete ONNX setup that works in both Node.js and browser
let ort;
let session;
const MOVE_DIRECTIONS = ['up', 'down', 'left', 'right'];

// Base-aware model path
function getModelPath() {
  if (typeof window !== 'undefined') {
    return import.meta.env.BASE_URL + 'react_playground/Onnx_models/model_2048_for_js.onnx';
  } else {
    return 'public/Onnx_models/model_2048_for_js.onnx';
  }
}

// Initialize ONNX runtime
async function initializeOrt() {
  if (!ort) {
    if (typeof window !== 'undefined') {
      // Browser
      const ortWeb = await import('onnxruntime-web');
      ortWeb.env.wasm.wasmPaths = import.meta.env.BASE_URL + 'assets/';
      ortWeb.env.wasm.numThreads = 1;
      ortWeb.env.logLevel = 'warning';

      try {
        await ortWeb.env.wasm.init();
        console.log('WASM initialized successfully');
      } catch (err) {
        console.warn('WASM init failed, falling back to CPU:', err);
      }

      ort = ortWeb;
    } else {
      // Node
      const ortNode = await import('onnxruntime-node');
      ort = ortNode;
    }
    console.log('ONNX Runtime initialized:', ort);
    console.log('Using', typeof window !== 'undefined' ? 'onnxruntime-web' : 'onnxruntime-node');
  }

  return ort;
}

// Load ONNX model
async function loadModel(modelPath = getModelPath()) {
  await initializeOrt();

  if (!session) {
    try {
      const options = typeof window !== 'undefined' 
        ? { executionProviders: ['wasm'] } 
        : { executionProviders: ['cpu'] };

      session = await ort.InferenceSession.create(modelPath, options);
      console.log('Model loaded successfully:', modelPath);
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error; // Let caller handle
    }
  }

  return session;
}

// NeuralNet inference
export async function NeuralNet(gameboard) {
  console.log('in NeuralNet function');

  // Preprocess board
  const preProcessBoard = (board) =>
    board.flat().map(x => Math.log2(x === 0 ? 1 : x) / 16);

  // Ensure model is loaded
  console.log('Model Path:', getModelPath());
  if (!session) await loadModel('https://parthpatel2000.github.io/react_playground/Onnx_models/model_2048_for_js.onnx');

  try {
    const processedBoard = preProcessBoard(gameboard);
    console.log('Processed Board for NN:', processedBoard);

    const inputTensor = new ort.Tensor('float32', Float32Array.from(processedBoard), [1, processedBoard.length]);
    const feeds = { input: inputTensor };

    // Run inference
    const results = await session.run(feeds);
    const output = results.output.data;

    // Get max score index
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
      allScores: Array.from(output),
    };
  } catch (error) {
    console.error('Error during neural network inference:', error);
    throw error;
  }
}

// Cleanup resources
export function cleanup() {
  if (session) {
    session.release();
    session = null;
  }
}
