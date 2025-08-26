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
        game.current.addProjectile(0, 9, game.current.enemies[0], "basic");
        game.current.addProjectile(0, 8, game.current.enemies[0], "laser");
        setState(game.current.getGameState());
    }, []);

    const TILE_SIZE = 50;

    const renderBoard = () => (
        <div className="relative" style={{ width: state.grid[0].length * TILE_SIZE, height: state.grid.length * TILE_SIZE }}>

            {/* Render grid cells */}
            {state.grid.map((row, y) =>
                row.map((cell, x) => (
                    <button
                        key={`${y}-${x}`}
                        onClick={() => handleCellClick(y, x)}

                        className={`absolute border p-0
                            ${state.enemy_paths.some(path => path.some(step => step.x === x && step.y === y))
                                ? "bg-green-300"            // path tiles are green
                                : cell?.cellType === "tower"
                                    ? "bg-blue-300"           // tower tiles blue
                                    : "bg-gray-100"           // empty tiles
                            }
                        `}
                        style={{
                            top: y * TILE_SIZE,
                            left: x * TILE_SIZE,
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                        }}
                    >
                        {cell?.cellType === "tower" ? "T" : ""}
                    </button>
                ))
            )}

            {/* Render enemies */}
            {state.enemies.map((enemy, i) => (
                <div
                    key={i}
                    className="absolute bg-red-500 rounded-full text-center font-bold text-white pointer-events-none flex items-center justify-center"
                    style={{
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        top: enemy.posY * TILE_SIZE,
                        left: enemy.posX * TILE_SIZE,
                    }}
                >
                    E
                </div>
            ))}

            {/** Render projectiles */}
            {state.projectiles.map((proj, i) => (
                <div
                    key={i}
                    className="absolute w-[20px] h-[20px] bg-yellow-400 rounded-full pointer-events-none"
                    style={{
                        top: proj.posY * TILE_SIZE,
                        left: proj.posX * TILE_SIZE,
                    }}
                />
            ))}
        </div>
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
        game.current.moveProjectiles();
        setState(game.current.getGameState());
    };

    //basic click handling done, add tower type popup later.
    const handleCellClick = (y, x) => {
        if (game.current.isGameOver) return;

        const tower = game.current.grid[y][x];
        if (tower && tower.cellType === "tower") {
            // Handle tower click (e.g., show tower info)
            alert(`Tower Info:\nType: ${tower.type}\nLevel: ${tower.level}`);
        } else if (!tower) {
            // Handle empty cell click (e.g., place tower)
            const towerType = prompt("Enter tower type (basic, freeze, laser):");
            if (towerType) {
                game.current.addTower(y, x, towerType);
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