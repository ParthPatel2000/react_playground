
// // Complete ONNX setup that works in both Node.js and browser
// let ort;
// let session;
// const MOVE_DIRECTIONS = ['up', 'down', 'left', 'right'];



// function getModelPath() {
//     if (typeof window !== 'undefined') {
//         // Base-aware path
//         return import.meta.env.BASE_URL + 'Onnx_models/model_2048_for_js.onnx';
//     } else {
//         // Node.js - can use relative path
//         return 'public/Onnx_models/model_2048_for_js.onnx';
//     }
// }


// async function initializeOrt() {
//   if (!ort) {
//     if (typeof window !== 'undefined') {
//       // Browser
//       const ortWeb = await import('onnxruntime-web');

//     //   ortWeb.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/';
//       ortWeb.env.wasm.wasmPaths = import.meta.env.BASE_URL + 'assets/';
//       ortWeb.env.wasm.numThreads = 1;
//       ortWeb.env.logLevel = 'warning';

//       try {
//         await ortWeb.env.wasm.init();
//       } catch (err) {
//         console.warn('WASM init failed, fallback to CPU:', err);
//       }

//       ort = ortWeb;
//     } else {
//       // Node
//       const ortNode = await import('onnxruntime-node');
//       ort = ortNode;
//     }
//   }
//   console.log('ONNX Runtime initialized:', ort);
//   console.log("using " + (typeof window !== 'undefined' ? "onnxruntime-web" : "onnxruntime-node"));
//   return ort;
// }

// async function loadModel(modelPath = getModelPath()) {
//     await initializeOrt();

//     try {
//         const options = {};

//         // For browser, specify execution providers explicitly
//         if (typeof window !== 'undefined') {
//             options.executionProviders = ['cpu']; // Safe fallback
//         }

//         session = await ort.InferenceSession.create(modelPath, options);
//         console.log('Model loaded successfully');
//     } catch (error) {
//         console.error('Failed to load model:', error);

//         // Try with different execution providers as fallback
//         if (typeof window !== 'undefined') {
//             try {
//                 console.log('Trying with WASM execution provider...');
//                 const wasmOptions = { executionProviders: ['wasm'] };
//                 session = await ort.InferenceSession.create(modelPath, wasmOptions);
//                 console.log('Model loaded with WASM provider');
//             } catch (wasmError) {
//                 console.error('WASM fallback also failed:', wasmError);
//                 throw error;
//             }
//         } else {
//             throw error;
//         }
//     }
// }

// export async function NeuralNet(gameboard) {
//     console.log("in NeuralNet function");
//     const preProcessBoard = (board) => {
//         return board.flat().map(x => Math.log2(x === 0 ? 1 : x) / 16); //normalize by max tile (65536)
//     };

//     // Ensure model is loaded
//     if (!session) {
//         await loadModel();
//     }

//     // Ensure ort is initialized
//     if (!ort) {
//         await initializeOrt();
//     }

//     try {
//         // Create input tensor
//         const processedBoard = preProcessBoard(gameboard);
//         console.log("Processed Board for NN:", processedBoard);

//         const inputTensor = new ort.Tensor('float32',
//             Float32Array.from(processedBoard),
//             [1, processedBoard.length]
//         );

//         const feeds = { input: inputTensor };

//         // Run inference
//         const results = await session.run(feeds);
//         const output = results.output.data; // Array of scores for each move

//         // Find index of max score
//         let maxIndex = 0;
//         let maxScore = output[0];

//         for (let i = 1; i < output.length; i++) {
//             if (output[i] > maxScore) {
//                 maxIndex = i;
//                 maxScore = output[i];
//             }
//         }

//         return {
//             direction: MOVE_DIRECTIONS[maxIndex],
//             confidence: maxScore,
//             allScores: Array.from(output)
//         };

//     } catch (error) {
//         console.error('Error during neural network inference:', error);
//         throw error;
//     }
// }

// // Optional: Add a function to cleanup resources
// export function cleanup() {
//     if (session) {
//         session.release();
//         session = null;
//     }
// }

// Complete ONNX setup that works in both Node.js and browser
let ort;
let session;
const MOVE_DIRECTIONS = ['up', 'down', 'left', 'right'];

// Base-aware model path
function getModelPath() {
  if (typeof window !== 'undefined') {
    return import.meta.env.BASE_URL + 'Onnx_models/model_2048_for_js.onnx';
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
  if (!session) await loadModel();

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
