// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['onnxruntime-node']
//   },
//   build: {
//     rollupOptions: {
//       external: ['onnxruntime-node']
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['onnxruntime-node']
  },
  build: {
    rollupOptions: {
      external: ['onnxruntime-node']
    }
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..']
    }
  },
  // Enable WASM support
  worker: {
    format: 'es'
  },
  assetsInclude: ['**/*.onnx', '**/*.wasm']
})