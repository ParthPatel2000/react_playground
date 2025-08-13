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
    const [emptinessWeight, setEmptinessWeight] = React.useState(1.0);
    const [MergesWeight, setMergesWeight] = React.useState(3.0);
    const [ClusterWeight, setClusterWeight] = React.useState(2.0);
    const [MonotonicityWeight, setMonotonicityWeight] = React.useState(3.0);
    const boardRef = React.useRef(board);
    const scoreRef = React.useRef(score);
    const movesRef = React.useRef(moves);

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
    }, [board, score, moves]);


    {/** Auto play AI Logic */ }
    useEffect(() => {
        if (isGameOver) {
            setIsAiRunning(false);
            return;
        }
        if (!isAiRunning || isGameOver) return;

        const interval = setInterval(async () => {
            const currentBoard = boardRef.current;

            const bestMoveObj = await getMove(currentBoard, aiModel);

            if (!bestMoveObj || !bestMoveObj.direction) {
                setIsAiRunning(false); // Stop AI if no valid moves
                clearInterval(interval);
                return;
            }

            move(bestMoveObj.direction);

            setBoard(getGameboard().map(row => [...row]));
            setScore(getScore());
            setIsGameOver(getIsGameOver());
            setMoves(getMovesCount());
        }, 25);

        return () => clearInterval(interval);
    }, [isAiRunning, isGameOver]);


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
        const bestMove = await getMove(board, aiModel);
        if (bestMove) {
            move(bestMove.direction);
            setBoard(getGameboard().map(row => [...row])); // Create a new array to trigger re-render
            setScore(getScore());
            setMoves(getMovesCount());
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 p-4"> Two cero 4 ocho </h1>

            {/* Game Board */}
            <div className="relative w-full h-auto" style={{ minWidth: "400px", minHeight: "320px" }}>

                {/* Controls panel positioned to the left */}
                <div className="absolute top-0 left-6 w-48 bg-white rounded-lg shadow-md p-4">
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
                        className={`mt-4 px-3 py-1 ${isAiRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white rounded  w-full`}
                    >
                        {isAiRunning ? "Stop AI" : "Start AI"}
                    </button>


                    <div className="mt-4" >
                        <h3 className="font-semibold mb-2 cursor-pointer select-none"
                            onClick={() => setIsHeuristicModelSelectorOpen(!isHeuristicModelSelectorOpen)}
                        >Heuristic Models {isHeuristicModelSelectorOpen ? "-" : "+"}</h3>
                        {isHeuristicModelSelectorOpen && (
                            <div className="flex flex-col gap-2">
                                <button
                                    className={`px-2 py-1 rounded ${aiModel === "maximizeScore" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => setAiModel("maximizeScore")}
                                >
                                    Maximize Score
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${aiModel === "maximizeMerges" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => setAiModel("maximizeMerges")}
                                >
                                    Maximize Merges
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${aiModel === "clusterTiles" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => setAiModel("clusterTiles")}
                                >
                                    Cluster Tiles
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${aiModel === "monotonicity" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => setAiModel("monotonicity")}
                                >
                                    Monotonicity
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${aiModel === "neuralNet" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                    onClick={() => setAiModel("neuralNet")}
                                >
                                    Neural Network
                                </button>
                            </div>)}
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">ExpectiMax</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                className={`px-2 py-1 rounded ${aiModel === "expectiMax" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                                onClick={() => {
                                    setAiModel("expectiMax")
                                    setExpectiMaxWeights({
                                        emptiness: emptinessWeight,
                                        merges: MergesWeight,
                                        cluster: ClusterWeight,
                                        monotonicity: MonotonicityWeight
                                    });
                                }}
                            >
                                ExpectiMax
                            </button>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm">Emptiness Weight</label>
                                <input
                                    type="number"
                                    value={emptinessWeight}
                                    onChange={(e) => {
                                        setEmptinessWeight(parseFloat(e.target.value));
                                        setExpectiMaxWeights({ emptiness: parseFloat(e.target.value) })
                                    }}
                                    className="border rounded p-1"
                                />

                                <label className="text-sm">Merges Weight</label>
                                <input
                                    type="number"
                                    value={MergesWeight}
                                    onChange={(e) => {
                                        setMergesWeight(parseFloat(e.target.value));
                                        setExpectiMaxWeights({ merges: parseFloat(e.target.value) })
                                    }}
                                    className="border rounded p-1"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm">Cluster Weight</label>
                                <input
                                    type="number"
                                    value={ClusterWeight}
                                    onChange={(e) => {
                                        setClusterWeight(parseFloat(e.target.value));
                                        setExpectiMaxWeights({ cluster: parseFloat(e.target.value) })
                                    }}
                                    className="border rounded p-1"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm">Monotonicity Weight</label>
                                <input
                                    type="number"
                                    value={MonotonicityWeight}
                                    onChange={(e) => {
                                        setMonotonicityWeight(parseFloat(e.target.value));
                                        setExpectiMaxWeights({ monotonicity: parseFloat(e.target.value) })
                                    }}
                                    className="border rounded p-1"
                                />
                            </div>
                        </div>

                    </div>
                </div>
                {/* Centered board */}
                <div
                    className="absolute left-1/2 top-0 transform -translate-x-1/2"
                    style={{ width: "fit-content" }}
                >
                    {/* Your game board here */}
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
                </div>

                {/* Stats panel positioned to the right */}
                <div className="absolute top-0 right-6 w-48 bg-white rounded-lg shadow-md p-4">
                    <h2 className="font-bold mb-2">Stats</h2>
                    <p className="text-sm mb-1">Score: <span className="font-semibold">{score}</span></p>
                    <p className="text-sm mb-1">Moves: <span className="font-semibold">{moves}</span></p>
                    <button onClick={handleRestart} className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Restart
                    </button>
                </div>
            </div>
        </div>
    );
}