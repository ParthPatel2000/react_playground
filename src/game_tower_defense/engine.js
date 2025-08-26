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
            enemy_paths: this.enemy_paths,
            projectiles: this.projectiles
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
    addTower(y, x, type) {
        const { level, range, power } = this.getTowerStats(type);
        const tower = { y, x, type, level, range, power, cellType: "tower" };
        this.towers.push(tower);
        this.grid[y][x] = tower;
    }

    addEnemy(y, x, type) {
        const enemy = {
            y,
            x,
            type,
            health: 100,
            cellType: "enemy",
            posX: x,
            posY: y,
            speed: 0.5,
            currentPathIndex: 0,
            followPath: 0
        };
        this.enemies.push(enemy);
        this.grid[y][x] = enemy;
    }

    //call from each tower and pass the y and x so we can determine the origin cell
    addProjectile(y, x, targetEnemy, type) {
        const towerStats = this.getTowerStats(type);

        const homing = type === "laser"; // laser is homing, others are straight

        const projectile = {
            y,
            x,
            posX: x,
            posY: y,
            target: homing ? targetEnemy : null, // only needed for homing
            targetX: !homing ? targetEnemy.posX : null, // straight target
            targetY: !homing ? targetEnemy.posY : null,
            type,
            speed: towerStats.speed / 5,
            power: towerStats.power,
            cellType: "projectile",
            hit: false,
            homing
        };

        this.projectiles.push(projectile);
    }


    moveProjectiles() {
        for (const proj of this.projectiles) {
            if (proj.homing) {
                if (!proj.target || proj.target.health <= 0) {
                    proj.hit = true;
                    continue;
                }
                const dx = proj.target.posX - proj.posX;
                const dy = proj.target.posY - proj.posY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 0.1) {
                    proj.target.health -= proj.power;
                    proj.hit = true;
                } else {
                    proj.posX += (dx / dist) * proj.speed;
                    proj.posY += (dy / dist) * proj.speed;
                }
            } else { // straight projectile
                const dx = proj.targetX - proj.posX;
                const dy = proj.targetY - proj.posY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 0.1) {
                    // check if enemy is still there
                    const enemy = this.enemies.find(e => Math.floor(e.posX) === Math.floor(proj.targetX) && Math.floor(e.posY) === Math.floor(proj.targetY));
                    if (enemy) enemy.health -= proj.power;
                    proj.hit = true;
                } else {
                    proj.posX += (dx / dist) * proj.speed;
                    proj.posY += (dy / dist) * proj.speed;
                }
            }
        }

        // remove hit projectiles
        this.projectiles = this.projectiles.filter(p => !p.hit);
    }





    walkEnemyStep() {
        for (const enemy of this.enemies) {
            const path = this.enemy_paths[enemy.followPath]; // select correct path
            const idx = enemy.currentPathIndex;

            if (!path || idx >= path.length - 1) {
                this.isGameOver = true;
                continue;
            }

            const target = path[idx + 1];

            const dx = target.x - enemy.posX;
            const dy = target.y - enemy.posY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= enemy.speed) {
                // reached next tile
                enemy.posX = target.x;
                enemy.posY = target.y;
                enemy.x = target.x; // logical grid update
                enemy.y = target.y;
                enemy.currentPathIndex++;
            } else {
                // fractional movement
                enemy.posX += (dx / distance) * enemy.speed;
                enemy.posY += (dy / distance) * enemy.speed;
            }
        }
    }


    makeEnemyPath() {

        //simple hardcode for testing and development
        this.enemy_paths.push([
            { y: 5, x: 0, cellType: "enemy_path" },
            { y: 5, x: 1, cellType: "enemy_path" },
            { y: 5, x: 2, cellType: "enemy_path" },
            { y: 5, x: 3, cellType: "enemy_path" },
            { y: 5, x: 4, cellType: "enemy_path" },
            { y: 4, x: 4, cellType: "enemy_path" },
            { y: 4, x: 5, cellType: "enemy_path" },
            { y: 4, x: 6, cellType: "enemy_path" },
            { y: 4, x: 7, cellType: "enemy_path" },
            { y: 4, x: 8, cellType: "enemy_path" },
            { y: 4, x: 9, cellType: "enemy_path" }
        ]);

        for (const path of this.enemy_paths) {
            for (const step of path) {
                this.grid[step.y][step.x] = step;
            }
        }

    }

    tick() {
        this.walkEnemyStep();
    }
}


function main() {
    const game = new TowerDefenseGame();
    game.makeEnemyPath();
    game.addTower(1, 1, "basic");
    game.addTower(2, 1, "freeze");
    game.addTower(3, 1, "laser");
    game.addEnemy(5, 0, "grunt");
    game.addProjectile(0, 9, game.enemies[0], "basic");
    game.addProjectile(0, 8, game.enemies[0], "homing");

    // Game loop
    console.log(game.getGameState().enemies, game.getGameState().projectiles);
    game.walkEnemyStep();
    game.moveProjectiles();
    console.log(game.getGameState().enemies, game.getGameState().projectiles);

    game.walkEnemyStep();
    game.moveProjectiles();
    console.log(game.getGameState().enemies, game.getGameState().projectiles);


}

main();