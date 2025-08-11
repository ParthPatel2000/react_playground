import React, { useEffect } from "react";
import { initGameboard, getGameboard, addTile, move } from "./engine_2048";
export default function TwoZeroFourEight() {
    const [board, setBoard] = React.useState([]);

    useEffect(() => {
        initGameboard(6, 4);
        setBoard(getGameboard());
    }, []);

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
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleAddTile = () => {
        addTile();
        addTile(); // Add two tiles for testing
        setBoard(getGameboard().map(row => [...row])); // Create a new array to trigger re-render
    };

    return (
        <div>
            <h1> Two zero 4 8</h1>

            {/* Game Board */}

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
                                                            "bg-gray-400"}`}
                            >
                                {tile !== 0 ? tile : ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>


            <div className="mt-4">
                <button className="bg-blue-500 text-white p-2 rounded" onClick={handleAddTile}>Add Tile</button>
            </div>
        </div>
    );
}