

# React Games Playground

<a href="https://parthpatel2000.github.io/react_playground/" target="_blank" style="text-decoration: none;"><img src="https://img.shields.io/badge/Live-Demo-brightgreen?logo=github&color=43d17d&logoColor=white&borderRadius=12" alt="Live Demo"></a> <img src="https://img.shields.io/badge/status-active-success?logo=github&color=43d17d&logoColor=white&borderRadius=12" alt="Status">


### Technologies Used

<img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white&borderRadius=12" alt="React 18"> <img src="https://img.shields.io/badge/Vite-3BB873?logo=vite&logoColor=white&borderRadius=12" alt="Vite"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white&borderRadius=12" alt="Tailwind CSS"> <img src="https://img.shields.io/badge/ONNX_Runtime_web-orange?logo=onnx&logoColor=white&borderRadius=12" alt="ONNX Runtime Web"> <img src="https://img.shields.io/badge/ONNX_Runtime_node-orange?logo=onnx&logoColor=white&borderRadius=12" alt="ONNX Runtime Node"> <img src="https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript&logoColor=black&borderRadius=12" alt="JavaScript (ES6+)"> <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&borderRadius=12" alt="Node.js">

## About This Project

Hi, I'm Parth! This is my portfolio project where I set out to combine my passion for frontend engineering, game development, and AI. I built everything from scratch to:
- Master modern React architecture (hooks, modular components, state management)
- Write my own 2048 game engine for full control and learning
- Implement multiple AI agents (heuristic, expectimax, neural net)
- Integrate ONNX neural networks in both Node.js and browser environments
- Design a clean, responsive UI with Tailwind CSS
- Practice debugging, testing, and extensibility best practices

### Why I Built This
I wanted to:
- Show I can integrate AI/ML into real web apps
- Deepen my understanding of game logic and state management in React
- Tackle the challenge of ONNX Runtime and neural net inference in the browser
- Create a visually appealing, interactive playground to demo in interviews and share with recruiters



A collection of interactive games and AI demos built with React and Vite. This project showcases modern frontend techniques, game logic, and AI integrations (including ONNX neural networks) in a modular, extensible codebase.

## Features

- **Custom Target Cursor in Tower Defense**: The Tower Defense game uses a spinning TargetCursor for a modern, interactive feel. The default mouse cursor is hidden over the grid and buttons, so only the animated target is visible when selecting or placing towers. Powered by [TargetCursor](https://reactbits.dev/tailwind/Animations/TargetCursor) and Tailwind CSS.

### 2048 Game
- Play the classic 2048 puzzle game on a customizable grid (default 5x4).
- Keyboard controls and responsive UI.
- Real-time score tracking and game over detection.
- Restart and reset functionality.
- Multiple tile colors for easy visualization.


#### How I Built It
- I wrote the game engine from scratch in JavaScript so I could understand every detail and optimize the logic myself.
- All moves, merges, and tile logic are handled in `src/game_2048/engine_2048.js`.
- The UI is fully responsive and uses Tailwind for rapid prototyping and design flexibility.
- Game state is managed with React hooks for performance and clarity.



### AI & Automation
- **Heuristic AI:** Several models for automated play, including maximize score, merges, clustering, and monotonicity.
- **ExpectiMax AI:** Weighted heuristic search with tunable parameters from the UI.
- **Neural Network AI:** ONNX model integration for browser and Node.js environments. Automatically selects moves using a trained neural net.
- **AI Controls:** Start/stop AI, select models, and adjust weights from the UI.


#### How I Built the AI
- I implemented heuristic models in `src/game_2048/heuristic_ai.js` and made them tunable live from the UI.
- ExpectiMax uses a recursive search with adjustable weights for merges, clustering, monotonicity, and emptiness.
- The NeuralNet agent loads an ONNX model and runs inference in both Node.js and browser (see `neural_net.js` and `neural_net_browser.js`).
- All AI agents are modular and can be swapped or extended easily.



### Technical Highlights
- **React + Vite:** Fast development and build times, hot module replacement.
- **Tailwind CSS:** Utility-first styling for rapid UI prototyping.
- **ONNX Runtime Web & Node:** Cross-platform neural net inference (browser and server).
- **Modular Game Engine:** Game logic separated from UI for easy testing and extension.
- **Keyboard & Button Controls:** Play manually or let the AI take over.
- **Debugging Tools:** Console logging, board visualization, and standalone engine tests.


### Technologies I Used
- React 18
- Vite
- Tailwind CSS
- ONNX Runtime Web & Node
- JavaScript (ES6+)
- Node.js



### My Highlights
 - I designed and implemented all game and AI logic from scratch—with the help of AI tools. I leveraged ChatGPT for brainstorming and Copilot in VS Code to handle syntax, so I could focus on logic, architecture, and creativity.
- I solved cross-platform ONNX model loading and WASM issues for browser inference
- I created a flexible architecture for adding new games or AI agents
- I documented and debugged the project for easy onboarding and extension



## Getting Started


Clone the repo and install dependencies:

```bash
git clone https://github.com/ParthPatel2000/react_playground.git
cd react_playground
npm install
```



1. **Install dependencies:**
	```bash
	npm install
	```
2. **Run in development:**
	```bash
	npm run dev
	```
3. **Build for production:**
	```bash
	npm run build
	```
4. **Serve production build:**
	```bash
	npm install -g serve
	serve -s dist
	```

## File Structure
- `src/game_2048/` — 2048 game engine, AI logic, neural net integration
- `public/Onnx_models/` — ONNX model files for neural net AI
- `public/onnx/` — WASM files for ONNX Runtime Web (browser)
- `src/` — Main React app and UI components


## How It Works
- The 2048 game engine manages board state, moves, merges, and scoring.
- The React UI renders the board and handles user input and AI actions.
- AI agents analyze the board and select moves, which are executed by the engine.
- The NeuralNet agent loads an ONNX model and runs inference to select moves in real time.



## Requirements
- Node.js 18+
- Modern browser (Chrome, Firefox, Edge)

## Customization
- Swap out ONNX models in `public/Onnx_models/` for different neural net behaviors.
- Tune AI weights and models from the UI for different play styles(Heuristics AI only).
- Extend with new games or AI agents by adding to `src/`.


## License
MIT
