import { Worker } from 'worker_threads';
import fs from 'fs';

const NUM_WORKERS = 8;
const GAMES_PER_WORKER = 625; // total ~5000 games, adjust as needed

async function run() {
  const allResults = [];
  let completedWorkers = 0;

  return new Promise((resolve, reject) => {
    for (let i = 0; i < NUM_WORKERS; i++) {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: { numGames: GAMES_PER_WORKER }
      });

      worker.on('message', (message) => {
        if (message.type === 'log') {
          console.log(`Worker ${i + 1}:`, ...message.message);
        } else if (message.type === 'result') {
          allResults.push(...message.data);
          completedWorkers++;

          if (completedWorkers === NUM_WORKERS) {
            // All workers finished, save combined data
            fs.writeFileSync('training_data.json', JSON.stringify(allResults));
            console.log(`Saved training data for ${allResults.length} games.`);
            resolve();
          }
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    }
  });
}

run().catch(console.error);
