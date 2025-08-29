import { React, useEffect, useState, useRef } from "react";
import TowerDefenseGame from "./engine";
import './TowerDefense.css';
import TargetCursor from "./TargetCursor";

export default function TowerDefense() {

    const game = useRef(new TowerDefenseGame());
    const [state, setState] = useState(game.current.getGameState());
    const towerTypes = game.current.getTowerTypes();
    const [showTowerTypePopup, setShowTowerTypePopup] = useState(false);
    const [towerPlacement, setTowerPlacement] = useState(null);
    const [tickRateMs, setTickRateMs] = useState(60);
    const [pause, setPause] = useState(true);
    const [count, setCount] = useState(1);
    const countRef = useRef(count);

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        game.current = new TowerDefenseGame();
        game.current.makeEnemyPath();
        game.current.addTower(1, 1, "basic");
        game.current.addTower(2, 1, "freeze");
        game.current.addTower(4, 3, "basic");
        game.current.addEnemy(5, 0, "grunt");
        setState(game.current.getGameState());
    };

    const gameOver = () => {
        if (game.current.isGameOver) {
            // window.alert("Game Over!");
            handleReset();
        }
    };

    const handleReset = () => {
        initGame();
    };

    const handleGameTick = () => {
        game.current.moveEnemies();
        game.current.moveProjectiles();
        game.current.updateTowerTargets();
        setState(game.current.getGameState());
        if (countRef.current % 10 === 0) {
            game.current.addEnemy(5, 0, "grunt");
            countRef.current = 1;
        }
        countRef.current++;
        // console.log(game.current.getGameState().projectiles[0]);
    };

    // Game loop
    useEffect(() => {
        if (pause) return;
        const interval = setInterval(() => {
            handleGameTick();
        }, tickRateMs);

        return () => { clearInterval(interval), setPause(true); };
    }, [tickRateMs, pause]);


    //basic click handling done, add tower type popup later.
    const handleCellClick = (y, x) => {
        if (game.current.isGameOver) return;

        const tower = game.current.grid[y][x];
        if (tower && tower.cellType === "tower") {
            // Handle tower click (e.g., show tower info)
            window.alert(`Tower Info:\nType: ${tower.type}\nLevel: ${tower.level}`);
        } else if (!tower) {
            // Show a popup/modal with tower type buttons
            setTowerPlacement({ y, x }); // store the cell for placement
            setShowTowerTypePopup(true); // show the popup
        }

    };

    const renderTowerSelectionPopup = () => {
        if (!showTowerTypePopup || !towerPlacement) return null;
        return (
            <div
                className="absolute z-50"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className="bg-white p-4 rounded shadow min-w-[220px] max-w-[90vw]">
                    <h2 className="mb-2 font-bold text-center">Choose Tower Type</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {towerTypes.map(type => (
                            <button
                                key={type}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() => {
                                    game.current.addTower(towerPlacement.y, towerPlacement.x, type);
                                    setState(game.current.getGameState());
                                    setShowTowerTypePopup(false);
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-gray-300 rounded w-full"
                        onClick={() => setShowTowerTypePopup(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };


    const TILE_SIZE = 50;

    const renderBoard = () => (
        <div className="relative" style={{ width: state.grid[0].length * TILE_SIZE, height: state.grid.length * TILE_SIZE }}>
            {renderTowerSelectionPopup()}
            {/* Render grid cells */}
            {state.grid.map((row, y) =>
                row.map((cell, x) => (
                    <button
                        key={`${y}-${x}`}
                        onClick={() => handleCellClick(y, x)}
                        title={`(${y}, ${x})`}
                        className={`absolute border border-slate-400  p-0 
                            cursor-target
                            cursor-none   
                            ${state.enemy_paths.some(path => path.some(step => step.x === x && step.y === y))
                                ? "bg-emerald-700 hover:none"                 // path tiles are green and no hover
                                : cell?.cellType === "tower"
                                    ? "bg-blue-300 hover:none"              // tower tiles blue and no hover
                                    : "bg-gray-800 hover:bg-gray-600"    // empty tiles
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
            {/* Render tower ranges */}
            {state.grid.map((row, y) =>
                row.map((cell, x) =>
                    cell?.cellType === "tower" ? (
                        <div
                            key={`tower-pulse-${y}-${x}`}
                            className="absolute"
                            style={{
                                width: cell.range * 1 * TILE_SIZE,
                                height: cell.range * 1 * TILE_SIZE,
                                top: y * TILE_SIZE - (cell.range * 1 / 2 * TILE_SIZE) + TILE_SIZE / 2,  // this is some crazy css all i did was eye ball it, idk how it works!
                                left: x * TILE_SIZE - (cell.range * 1 / 2 * TILE_SIZE) + TILE_SIZE / 2,
                                pointerEvents: "none"
                            }}
                        >
                            {/* Radar pulse ring */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="block w-full h-full rounded-full bg-blue-300 opacity-20 animate-ping slow-ping"></span>
                            </div>
                            {/* Tower dot, always centered */}
                            <div
                                className="absolute flex items-center justify-center"
                                style={{
                                    width: TILE_SIZE * 0.7,
                                    height: TILE_SIZE * 0.7,
                                    top: `calc(50% - ${TILE_SIZE * 0.35}px)`,
                                    left: `calc(50% - ${TILE_SIZE * 0.35}px)`,
                                }}
                            >
                                <span className="bg-blue-400 rounded-full text-center font-bold text-white flex items-center justify-center w-full h-full">
                                    {cell.type[0].toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ) : null
                )
            )}

            {/* Render enemies */}
            {state.enemies.length > 0 && state.enemies.map((enemy, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        top: enemy.posY * TILE_SIZE,
                        left: enemy.posX * TILE_SIZE,
                    }}
                >
                    {/* Radar pulse ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-full h-full rounded-full bg-red-400 opacity-40 animate-ping"></span>
                    </div>
                    {/* Enemy dot */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <span className="bg-red-500 rounded-full text-center font-bold text-white pointer-events-none flex items-center justify-center" style={{
                            width: TILE_SIZE * 0.7,
                            height: TILE_SIZE * 0.7,
                        }}>
                            E
                        </span>
                    </div>
                </div>
            ))}

            {/** Render projectiles */}
            {state.projectiles.map((proj, i) => (
                <div
                    key={i}
                    className="absolute bg-yellow-400 rounded-full pointer-events-none"
                    style={{
                        width: TILE_SIZE / 2,
                        height: TILE_SIZE / 2,
                        top: proj.posY * TILE_SIZE + TILE_SIZE / 4,
                        left: proj.posX * TILE_SIZE + TILE_SIZE / 4,
                        transition: 'top 0.1s linear, left 0.1s linear'
                    }}
                />
            ))}

            {/* Render laser beams */}
            {state.grid.map((row, y) =>
                row.map((cell, x) =>
                    cell?.cellType === "tower" && cell.target ? (
                        (() => {
                            const towerCenterX = x * TILE_SIZE + TILE_SIZE / 2;
                            const towerCenterY = y * TILE_SIZE + TILE_SIZE / 2;
                            const enemy = cell.target; // the enemy this tower is targeting
                            const enemyCenterX = enemy.posX * TILE_SIZE + TILE_SIZE / 2;
                            const enemyCenterY = enemy.posY * TILE_SIZE + TILE_SIZE / 2;

                            const dx = enemyCenterX - towerCenterX;
                            const dy = enemyCenterY - towerCenterY;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI); // degrees

                            return (
                                <div
                                    key={`laser-${y}-${x}`}
                                    className="absolute bg-yellow-400 opacity-70 pointer-events-none"
                                    style={{
                                        width: length,
                                        height: 2, // thickness of the laser
                                        top: towerCenterY,
                                        left: towerCenterX,
                                        transformOrigin: '0 0',
                                        transform: `rotate(${angle}deg)`,
                                    }}
                                />
                            );
                        })()
                    ) : null
                )
            )}
        </div>
    );


    return (
        <div >
            <TargetCursor spinDuration={2} hideDefaultCursor={true} />
            <h1>Tower Defense Game</h1>
            <div className="flex justify-center items-center ">
                {renderBoard()}
                {gameOver()}
                <button
                    className="cursor-none cursor-target ml-4 p-2 bg-blue-500 text-white rounded"
                    onClick={handleGameTick}>Next Turn</button>
                <button
                    className="cursor-target cursor-none ml-4 p-2 bg-yellow-500 text-white rounded"
                    onClick={() => setPause(!pause)}>
                    {pause ? "Resume" : "Pause"}
                </button>

                <button
                    className="cursor-target cursor-none ml-4 p-2 bg-red-500 text-white rounded"
                    onClick={handleReset}>
                    Reset
                </button>
            </div>
        </div>
    );
}       