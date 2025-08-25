import React, { useEffect } from "react";
import {
    initGameboard, getGameboard,
    getScore, getMovesCount,
    getIsGameOver, addTile,
    move, resetGame
} from "./engine_2048";
import { getMove, setExpectiMaxWeights } from "./heuristic_ai"

export default function TwoZeroFourEight() {
    const [board, setBoard] = React.useState([]);
    const [score, setScore] = React.useState(0);
    const [moves, setMoves] = React.useState(0);
    const [isAiRunning, setIsAiRunning] = React.useState(false);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [aiModel, setAiModel] = React.useState("expectiMax");
    const [isHeuristicModelSelectorOpen, setIsHeuristicModelSelectorOpen] = React.useState(false);
    const [expectiMaxWeights, setExpectiMaxWeights] = React.useState({
        emptiness: 1.0,
        merges: 3.0,
        cluster: 2.0,
        monotonicity: 3.0
    });
    const [expectiMaxDepth, setExpectiMaxDepth] = React.useState(2);
    const boardRef = React.useRef(board);
    const scoreRef = React.useRef(score);
    const movesRef = React.useRef(moves);
    const isAiRunningRef = React.useRef(isAiRunning);

    {/** Initialize the gameboard */ }
    useEffect(() => {
        initGameboard(5, 4);
        addTile(); // Add initial tiles
        addTile();
        setBoard(getGameboard());
        setIsGameOver(getIsGameOver());
        setScore(getScore());
        setMoves(getMovesCount());
    }, []);

    {/** Handle keyboard input for movement */ }
    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    move("UP");
                    break;
                case "ArrowDown":
                    move("DOWN");
                    break;
                case "ArrowLeft":
                    move("LEFT");
                    break;
                case "ArrowRight":
                    move("RIGHT");
                    break;
                default:
                    break;
            }
            setBoard(getGameboard().map(row => [...row])); // Create a new array to trigger re-render
            setScore(getScore());
            setIsGameOver(getIsGameOver());
            setMoves(getMovesCount());
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        boardRef.current = board;
        scoreRef.current = score;
        movesRef.current = moves;
        isAiRunningRef.current = isAiRunning;
    }, [board, score, moves, isAiRunning]);

    {/** Handle touch/swipe input for mobile */ }
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let isGameBoardTouch = false;

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            
            // Check if touch started on game board
            const target = e.target;
            isGameBoardTouch = target.closest('.game-board-area') !== null;
        };

        const handleTouchMove = (e) => {
            // Prevent scrolling only when touching the game board
            if (isGameBoardTouch) {
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e) => {
            if (!isGameBoardTouch) return; // Only handle swipes that started on game board
            
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        };

        const handleSwipe = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 50; // Minimum distance for a swipe

            // Check if the swipe distance is significant enough
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return; // Too short to be considered a swipe
            }

            // Determine direction - prioritize the larger delta
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    move("RIGHT");
                } else {
                    move("LEFT");
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    move("DOWN");
                } else {
                    move("UP");
                }
            }

            // Update game state after move
            setBoard(getGameboard().map(row => [...row]));
            setScore(getScore());
            setIsGameOver(getIsGameOver());
            setMoves(getMovesCount());
        };

        // Add touch event listeners to the document
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false }); // Not passive so we can preventDefault
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    {/** Auto play AI Logic */ }
    useEffect(() => {
        if (!isAiRunningRef.current || isGameOver) return;

        // --- Heuristic AI (fast local moves) ---
        if (aiModel !== "pythonQ") {
            const interval = setInterval(async () => {
                if (isGameOver) {
                    clearInterval(interval);
                    setIsAiRunning(false);
                    return;
                }

                const bestMoveObj = await getMove(boardRef.current, aiModel, expectiMaxDepth);
                if (!bestMoveObj || !bestMoveObj.direction) {
                    clearInterval(interval);
                    setIsAiRunning(false);
                    return;
                }

                move(bestMoveObj.direction);

                setBoard(getGameboard().map(row => [...row]));
                setScore(getScore());
                setIsGameOver(getIsGameOver());
                setMoves(getMovesCount());
            }, 25); // fast interval for local AI

            return () => clearInterval(interval);
        }

        // --- Python AI (wait-for-response moves) ---
        let movesMade = 0;
        const maxMoves = 3; // number of test moves
        const runPythonAiMove = async () => {
            if (!isAiRunning || isGameOver) {
                setIsAiRunning(false);
                return;
            }

            movesMade++;
            const bestMoveObj = await getMove(boardRef.current, aiModel, expectiMaxDepth);

            // Check again after Python response
            if (!isAiRunningRef.current || isGameOver) return;

            if (!bestMoveObj || !bestMoveObj.direction) {
                setIsAiRunning(false);
                return;
            }

            move(bestMoveObj.direction);

            setBoard(getGameboard().map(row => [...row]));
            setScore(getScore());
            setIsGameOver(getIsGameOver());
            setMoves(getMovesCount());

            // Optional small delay to see moves in UI
            setTimeout(runPythonAiMove, 250);
        };

        if (aiModel === "pythonQ" || aiModel === "expectiMax") {
            runPythonAiMove();
        }

    }, [isAiRunning, isGameOver, aiModel]);

    const handleRestart = () => {
        resetGame();
        setBoard(getGameboard().map(row => [...row])); // Create a new array to trigger re-render
        setScore(getScore());
        setMoves(getMovesCount());
        setIsGameOver(false);
        setIsAiRunning(false);
    };

    {/** Play AI Move */ }
    const handleAi = async () => {
        const bestMove = await getMove(board, aiModel, expectiMaxDepth);
        if (bestMove) {
            move(bestMove.direction);
            setBoard(getGameboard().map(row => [...row])); // Create a new array to trigger re-render
            setScore(getScore());
            setMoves(getMovesCount());
        }
    };

    // Extract GameBoard component
    const GameBoard = ({ board }) => (
        <div className="bg-gray-300 inline-block p-2 rounded">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-1 mb-1">
                    {row.map((tile, colIndex) => (
                        <div
                            key={colIndex}
                            className={`w-16 aspect-square flex items-center justify-center font-bold text-lg rounded
                                ${tile === 0 ? "bg-gray-100" :
                                    tile === 2 ? "bg-yellow-100" :
                                        tile === 4 ? "bg-yellow-200" :
                                            tile === 8 ? "bg-orange-300" :
                                                tile === 16 ? "bg-orange-400" :
                                                    tile === 32 ? "bg-red-400" :
                                                        tile === 64 ? "bg-red-500" :
                                                            tile === 128 ? "bg-purple-400" :
                                                                tile === 256 ? "bg-purple-500" :
                                                                    tile === 512 ? "bg-indigo-500" :
                                                                        tile === 1024 ? "bg-indigo-600" :
                                                                            tile === 2048 ? "bg-green-500" :
                                                                                "bg-gray-400"
                                }`}
                        >
                            {tile !== 0 ? tile : ""}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-4 p-4 text-center md:text-left">Two Zero 4 Eight</h1>

            {/* Desktop Layout - Hidden on mobile */}
            <div className="hidden md:block">
                <div className="relative w-full h-auto" style={{ minWidth: "400px", minHeight: "320px" }}>
                    {/* Controls panel positioned to the left */}
                    <div className="absolute top-0 left-6 space-y-4 w-48">
                        {/* Controls */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="font-bold mb-2">Controls</h2>
                            <button
                                onClick={handleAi}
                                className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                            >
                                Next A.I Move
                            </button>
                            <button
                                onClick={() => {
                                    if (isGameOver) handleRestart();
                                    setIsAiRunning(!isAiRunning);
                                }}
                                className={`mt-4 px-3 py-1 ${isAiRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white rounded w-full`}
                            >
                                {isAiRunning ? "Stop AI" : "Start AI"}
                            </button>
                        </div>

                        {/* AI Model Selector */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="font-semibold mb-2 cursor-pointer select-none"
                                onClick={() => setIsHeuristicModelSelectorOpen(!isHeuristicModelSelectorOpen)}
                            >
                                Heuristic Models {isHeuristicModelSelectorOpen ? "-" : "+"}
                            </h3>

                            {isHeuristicModelSelectorOpen && (
                                <div className="flex flex-col gap-2">
                                    {["maximizeScore", "maximizeMerges", "clusterTiles", "monotonicity", "expectiMax", "neuralNet", "pythonQ"].map(model => (
                                        <button
                                            key={model}
                                            className={`px-2 py-1 rounded ${aiModel === model ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                            onClick={() => {
                                                setAiModel(model);
                                                if (model === "expectiMax") {
                                                    setExpectiMaxWeights({
                                                        emptiness: expectiMaxWeights.emptiness,
                                                        merges: expectiMaxWeights.merges,
                                                        cluster: expectiMaxWeights.cluster,
                                                        monotonicity: expectiMaxWeights.monotonicity
                                                    });
                                                }
                                            }}
                                        >
                                            {model === "maximizeScore" ? "Maximize Score" :
                                                model === "maximizeMerges" ? "Maximize Merges" :
                                                    model === "clusterTiles" ? "Cluster Tiles" :
                                                        model === "monotonicity" ? "Monotonicity" :
                                                            model === "expectiMax" ? "ExpectiMax" :
                                                                model === "neuralNet" ? "Neural Network" :
                                                                    "Q learning"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ExpectiMax Weights */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="font-semibold mb-2">ExpectiMax</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm">ExpectiMax Depth</label>
                                <input
                                    type="number"
                                    className="border rounded p-1"
                                    value={expectiMaxDepth}
                                    onChange={(e) => setExpectiMaxDepth(parseInt(e.target.value))}
                                />

                                {Object.entries(expectiMaxWeights).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                        <label className="text-sm capitalize">{key} Weight</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="border rounded p-1 ml-2"
                                            value={value}
                                            onChange={(e) => {
                                                setExpectiMaxWeights({ ...expectiMaxWeights, [key]: parseFloat(e.target.value) });
                                            }} />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Centered board */}
                    <div
                        className="absolute left-1/2 top-0 transform -translate-x-1/2 game-board-area touch-none select-none"
                        style={{ width: "fit-content" }}
                    >
                        <GameBoard board={board} />
                    </div>

                    {/* Stats panel positioned to the right */}
                    <div className="absolute top-0 right-6 w-48 bg-white rounded-lg shadow-md p-4">
                        <h2 className="font-bold mb-2">Stats</h2>
                        <p className="text-sm mb-1">Score: <span className="font-semibold">{score}</span></p>
                        <p className="text-sm mb-1">Moves: <span className="font-semibold">{moves}</span></p>
                        {isGameOver && <p className="text-red-500 font-bold text-sm mb-2">Game Over!</p>}
                        <button onClick={handleRestart} className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Restart
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Layout - Hidden on desktop */}
            <div className="md:hidden px-4 pb-4">
                {/* Stats at top on mobile */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm">Score: <span className="font-semibold">{score}</span></p>
                            <p className="text-sm">Moves: <span className="font-semibold">{moves}</span></p>
                            {isGameOver && <p className="text-red-500 font-bold text-sm">Game Over!</p>}
                        </div>
                        <button onClick={handleRestart} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Restart
                        </button>
                    </div>
                </div>

                {/* Game board centered */}
                <div className="flex justify-center mb-4">
                    <div className="select-none game-board-area touch-none"> {/* Prevent text selection and default touch behaviors */}
                        <GameBoard board={board} />
                    </div>
                </div>

                {/* Controls below board */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h2 className="font-bold mb-2">Controls</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAi}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Next AI Move
                        </button>
                        <button
                            onClick={() => {
                                if (isGameOver) handleRestart();
                                setIsAiRunning(!isAiRunning);
                            }}
                            className={`flex-1 px-3 py-2 text-sm ${isAiRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white rounded`}
                        >
                            {isAiRunning ? "Stop AI" : "Start AI"}
                        </button>
                    </div>
                </div>

                {/* AI Model Selector - Collapsible on mobile */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h3 className="font-semibold mb-2 cursor-pointer select-none flex justify-between items-center"
                        onClick={() => setIsHeuristicModelSelectorOpen(!isHeuristicModelSelectorOpen)}
                    >
                        <span>AI Models</span>
                        <span>{isHeuristicModelSelectorOpen ? "−" : "+"}</span>
                    </h3>

                    {isHeuristicModelSelectorOpen && (
                        <div className="grid grid-cols-2 gap-2">
                            {["maximizeScore", "maximizeMerges", "clusterTiles", "monotonicity", "expectiMax", "neuralNet", "pythonQ"].map(model => (
                                <button
                                    key={model}
                                    className={`px-2 py-1 rounded text-xs ${aiModel === model ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => {
                                        setAiModel(model);
                                        if (model === "expectiMax") {
                                            setExpectiMaxWeights({
                                                emptiness: expectiMaxWeights.emptiness,
                                                merges: expectiMaxWeights.merges,
                                                cluster: expectiMaxWeights.cluster,
                                                monotonicity: expectiMaxWeights.monotonicity
                                            });
                                        }
                                    }}
                                >
                                    {model === "maximizeScore" ? "Max Score" :
                                        model === "maximizeMerges" ? "Max Merges" :
                                            model === "clusterTiles" ? "Cluster" :
                                                model === "monotonicity" ? "Monotonic" :
                                                    model === "expectiMax" ? "ExpectiMax" :
                                                        model === "neuralNet" ? "Neural Net" :
                                                            "Q-Learning"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ExpectiMax Weights - Show on mobile when ExpectiMax is selected */}
                {(aiModel === "expectiMax" || aiModel === "pythonQ") && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="font-semibold mb-2">ExpectiMax Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm block mb-1">Depth</label>
                                <input
                                    type="number"
                                    className="border rounded p-2 w-full"
                                    value={expectiMaxDepth}
                                    onChange={(e) => setExpectiMaxDepth(parseInt(e.target.value))}
                                />
                            </div>

                            {Object.entries(expectiMaxWeights).map(([key, value]) => (
                                <div key={key}>
                                    <label className="text-sm capitalize block mb-1">{key} Weight</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="border rounded p-2 w-full"
                                        value={value}
                                        onChange={(e) => {
                                            setExpectiMaxWeights({ ...expectiMaxWeights, [key]: parseFloat(e.target.value) });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}