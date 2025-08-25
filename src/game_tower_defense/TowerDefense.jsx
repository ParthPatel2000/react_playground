import React from "react";

export default function TowerDefense() {

    const [enemies, setEnemies] = React.useState([]);
    const [towers, setTowers] = React.useState([]);
    const enemyPath = [1, 2, 3, 4, 5];

    return (
        <div>
            <h1>Tower Defense Game</h1>
            <div className="justify-center items-center">
                <div className="grid grid-cols-6 gap-4">
                    
                </div>
            </div>
        </div>
    );
}