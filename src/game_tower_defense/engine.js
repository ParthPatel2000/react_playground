export default class TowerDefenseGame {
    constructor(options = {}) {
        this.grid = this.createGrid(options.rows || 10, options.cols || 10);
        this.towers = [];  // 2D array for tower positions and types [[{x: 0, y: 0, type: 'basic', level: 1 , range: 1, power: 1 }]]
        this.enemies = []; // enemy objects
        this.enemy_paths = []; // 2D array for enemy paths
        this.projectiles = []; // projectile objects
        this.isGameOver = false;
    }

    getGameState() {
        return {
            grid: this.grid,
            towers: this.towers,
            enemies: this.enemies,
            enemy_paths: this.enemy_paths
        };
    }

    createGrid(rows, cols) {
        return Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    // Get tower stats just add new tower types later.
    getTowerStats(type = "basic") {
        switch (type) {
            case "basic":
                return { level: 1, range: 1, power: 1, speed: 3 };
            case "freeze":
                return { level: 1, range: 2, power: 2, speed: 1 };
            case "laser":
                return { level: 1, range: 3, power: 1, speed: 2 };
            default:
                return { level: 1, range: 1, power: 1, speed: 3 };
        }
    }


    //add towers to the grid
    addTower(x, y, type) {
        const { level, range, power } = this.getTowerStats(type);
        const tower = { x, y, type, level, range, power, cellType: "tower" };
        this.towers.push(tower);
        this.grid[y][x] = tower;
    }

    addEnemy(x, y, type) {
        const enemy = { x, y, type, cellType: "enemy" };
        this.enemies.push(enemy);
        this.grid[x][y] = enemy;
    }

    addProjectile(x, y, type) {
        const tower_stats = this.getTowerStats(type);
        const { speed, power } = { speed: tower_stats.speed, power: tower_stats.power };
        const projectile = { x, y, type, speed, power, cellType: "projectile" };
        this.projectiles.push(projectile);
    }

    makeEnemyPath() {

        //simple hardcode for testing and development
        this.enemy_paths.push([
            { x: 5, y: 0, cellType: "enemy_path" },
            { x: 5, y: 1, cellType: "enemy_path" },
            { x: 5, y: 2, cellType: "enemy_path" },
            { x: 5, y: 3, cellType: "enemy_path" },
            { x: 5, y: 4, cellType: "enemy_path" },
            { x: 4, y: 4, cellType: "enemy_path" },
            { x: 4, y: 5, cellType: "enemy_path" },
            { x: 4, y: 6, cellType: "enemy_path" },
            { x: 4, y: 7, cellType: "enemy_path" },
            { x: 4, y: 8, cellType: "enemy_path" },
            { x: 4, y: 9, cellType: "enemy_path" }
        ]);

        for (const path of this.enemy_paths) {
            for (const step of path) {
                this.grid[step.x][step.y] = step;
            }
        }

    }

    walkEnemyStep() {
        // Simple pathfinding logic (e.g., move towards the right)
        for (const enemy of this.enemies) {
            console.log("Moving enemy at:", enemy.x, enemy.y);
            const path = this.enemy_paths.find(p =>
                p.some(block => block.x === enemy.x && block.y === enemy.y)
            );
            const current_pos = path.findIndex(block => block.x === enemy.x && block.y === enemy.y);
            if (path && current_pos !== -1) {
                if (current_pos === path.length - 1) {
                    this.isGameOver = true;
                }
                // Move the enemy along the path
                const last_step = path[current_pos];
                const next_step = path[current_pos + 1];
                if (next_step) {

                    //updating the grid to reflect enemy movement
                    this.grid[next_step.x][next_step.y] = enemy; // Set new position
                    this.grid[last_step.x][last_step.y] = last_step; // Clear old position

                    enemy.x = next_step.x;
                    enemy.y = next_step.y;

                }
            }
        }
    }

    tick() {
        this.walkEnemyStep();
    }
}


// function main()
// {
//     const game = new TowerDefenseGame();
//     game.makeEnemyPath();
//     game.addTower(1, 1, "basic");
//     game.addTower(2, 1, "freeze");
//     game.addTower(3, 1, "laser");
//     game.addEnemy(5, 0, "grunt");

//     // Game loop
//     console.log(game.getGameState());
//     game.walkEnemyStep();
//     console.log(game.getGameState());

//     game.walkEnemyStep();
//     console.log(game.getGameState());
// }

// main();