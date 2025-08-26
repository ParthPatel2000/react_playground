import { React, useEffect, useState, useRef } from "react";
import TowerDefenseGame from "./engine";

export default function TowerDefense() {

    const game = useRef(new TowerDefenseGame());
    const [state, setState] = useState(game.current.getGameState());

    useEffect(() => {
        game.current.makeEnemyPath();
        game.current.addTower(1, 1, "basic");
        game.current.addTower(2, 1, "freeze");
        game.current.addTower(3, 1, "laser");
        game.current.addEnemy(5, 0, "grunt");
        setState(game.current.getGameState());
    }, []);


    // Render the game grid as a table for better layout
    const renderBoard = () => (
        <table className="game-grid">
            <tbody>
                {state.grid.map((row, y) => (
                    <tr key={y}>
                        {row.map((cell, x) => (
                            <td
                                key={`${x}-${y}`}
                                className={`border text-center ${cell ?
                                    cell.cellType === 'enemy' ? "bg-red-300" :
                                        cell.cellType === 'tower' ? "bg-blue-300" :
                                            cell.cellType === 'enemy_path' ? "bg-green-300" : "bg-gray-100" :
                                    "bg-gray-100"}`}
                                style={{ width: 40, height: 40 }}
                            >
                                <button className="h-full w-full" onClick={() => handleCellClick(x, y)}>
                                    {cell ?
                                        cell.cellType === "enemy" ? "E" :
                                            cell.cellType === "tower" ? "T" :
                                                cell.cellType === "enemy_path" ? "P" :
                                                    " "
                                        : " "}
                                </button>

                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const gameOver = () => {
        if (game.current.isGameOver) {
            alert("Game Over!");
            game.current = new TowerDefenseGame();
            // Reset the game state or redirect to a different page
        }
    };

    const handleGameTick = () => {
        game.current.walkEnemyStep();
        setState(game.current.getGameState());
    };

    //basic click handling done, add tower type popup later.
    const handleCellClick = (x, y) => {
        if (game.current.isGameOver) return;

        const tower = game.current.grid[y][x];
        if (tower && tower.cellType === "tower") {
            // Handle tower click (e.g., show tower info)
            alert(`Tower Info:\nType: ${tower.type}\nLevel: ${tower.level}`);
        } else if (!tower) {
            // Handle empty cell click (e.g., place tower)
            const towerType = prompt("Enter tower type (basic, freeze, laser):");
            if (towerType) {
                game.current.addTower(x, y, towerType);
                setState(game.current.getGameState());
            }
        }
    };




    return (
        <div>
            <h1>Tower Defense Game</h1>
            <div className="flex justify-center items-center">
                {renderBoard()}
                {gameOver()}
                <button
                    className="ml-4 p-2 bg-blue-500 text-white rounded"
                    onClick={handleGameTick}>Next Turn</button>
            </div>
        </div>
    );
}       