export default class TowerDefenseGame {
    constructor(options = {}) {
        this.grid = this.createGrid(options.rows || 10, options.cols || 10);
        this.towers = [];
        this.enemies = [];
        this.enemy_paths = options.enemy_paths || [];
        this.projectiles = [];
        this.towerTypes = ["basic", "freeze", "laser"];
        this.money = 100;
        this.isWin = false;
        this.isGameOver = false;
        this.wave = -1;             // current wave number (0-indexed)
        this.waveTimer = 0;         // Timer for managing wave intervals
        this.waveInterval = 20;     // ticks between enemy spawns within a wave
        this.activeWaveEnemies = 0;
        this.waves = options.waves || [
            { type: 'grunt', count: 1 , interval: 15 },
            { type: 'fast', count: 1, interval: 5 },
            { type: 'strong', count: 1, interval: 20 }
        ];
    }

    getGameState() {
        return {
            grid: this.grid,
            towers: this.towers,
            enemies: this.enemies,
            enemy_paths: this.enemy_paths,
            projectiles: this.projectiles,
            money: this.money,
            wave: this.wave,
        };
    }

    createGrid(rows, cols) {
        return Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    getTowerStats(type = "basic") {
        switch (type) {
            case "basic": return { level: 1, range: 2, power: 1, speed: 3, cost: 50 };
            case "freeze": return { level: 1, range: 2, power: 2, speed: 1, cost: 75 };
            case "laser": return { level: 1, range: 2.5, power: 1, speed: 2, cost: 100 };
            default: return { level: 1, range: 2, power: 1, speed: 3, cost: 50 };
        }
    }

    getEnemyStats(type = "grunt") {
        switch (type) {
            case "grunt": return { health: 10, speed: 0.1, reward: 10 };
            case "fast": return { health: 5, speed: 0.2, reward: 5 };
            case "strong": return { health: 20, speed: 0.05, reward: 20 };
            default: return { health: 10, speed: 0.1, reward: 10 };
        }
    }

    addTower(y, x, type) {
        const { level, range, power, cost } = this.getTowerStats(type);
        if (this.money < cost) return;
        this.money -= cost;
        const tower = { y, x, type, level, range, power, cost, target: null, cellType: "tower" };
        this.towers.push(tower);
        this.grid[y][x] = tower;
    }

    addEnemy(y, x, type) {
        const enemyStats = this.getEnemyStats(type);
        const enemy = {
            y, x, type,
            health: enemyStats.health,
            speed: enemyStats.speed,
            reward: enemyStats.reward,
            cellType: "enemy",
            posX: x, posY: y,
            currentPathIndex: 0, followPath: 0
        };
        this.enemies.push(enemy);
        this.grid[y][x] = enemy;

    }

    addProjectile(y, x, targetEnemy, type) {
        const towerStats = this.getTowerStats(type);
        const homing = type === "laser";
        const projectile = {
            startY: y, startX: x,
            posX: x, posY: y,
            target: targetEnemy,
            targetX: targetEnemy.posX, targetY: targetEnemy.posY,
            distanceTraveled: 0, type,
            range: towerStats.range, speed: towerStats.range, power: towerStats.power,
            cellType: "projectile", hit: false, homing
        };
        this.projectiles.push(projectile);
    }

    moveProjectiles() {
        const EPS = 0.5;
        for (const proj of this.projectiles) {
            let moveX = 0, moveY = 0;
            if (proj.homing) {
                if (!proj.target || proj.target.health <= 0) { proj.hit = true; continue; }
                const dx = proj.target.posX - proj.posX;
                const dy = proj.target.posY - proj.posY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const move = Math.min(proj.speed, dist);
                moveX = (dx / dist) * move || 0;
                moveY = (dy / dist) * move || 0;
                proj.posX += moveX;
                proj.posY += moveY;
                if (dist <= proj.range) { proj.target.health -= proj.power; }
            } else {
                const dx = proj.targetX - proj.posX;
                const dy = proj.targetY - proj.posY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const move = Math.min(proj.speed, dist);
                moveX = (dx / dist) * move || 0;
                moveY = (dy / dist) * move || 0;
                proj.posX += moveX; proj.posY += moveY;
                const enemy = this.enemies.find(e => Math.sqrt((e.posX - proj.posX) ** 2 + (e.posY - proj.posY) ** 2) < EPS);
                if (enemy) { enemy.health -= proj.power; proj.hit = true; }
            }
            proj.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
            if (!proj.hit && (proj.distanceTraveled >= proj.range || (Math.abs(proj.posX - proj.targetX) < EPS && Math.abs(proj.posY - proj.targetY) < EPS))) {
                proj.hit = true;
            }
        }
        this.projectiles = this.projectiles.filter(p => !p.hit);
    }

    updateTowerTargets() {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[0].length; x++) {
                const cell = this.grid[y][x];
                if (cell?.cellType === "tower") {
                    let nearestEnemy = null, nearestDist = Infinity;
                    for (const enemy of this.enemies) {
                        const dx = enemy.posX - (x + 0.5), dy = enemy.posY - (y + 0.5);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= cell.range && dist < nearestDist && enemy.health > 0) { nearestEnemy = enemy; nearestDist = dist; }
                    }
                    cell.target = nearestEnemy;
                    if (nearestEnemy) this.addProjectile(y, x, nearestEnemy, cell.type);
                }
            }
        }
    }

    moveEnemies() {
        for (const enemy of this.enemies) {
            if (enemy.health <= 0) continue;
            const path = this.enemy_paths[enemy.followPath];
            const idx = enemy.currentPathIndex;
            if (!path || idx >= path.length - 1) { this.isGameOver = true; continue; }
            const target = path[idx + 1];
            const dx = target.x - enemy.posX, dy = target.y - enemy.posY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= enemy.speed) { enemy.posX = target.x; enemy.posY = target.y; enemy.x = target.x; enemy.y = target.y; enemy.currentPathIndex++; }
            else { enemy.posX += dx / dist * enemy.speed; enemy.posY += dy / dist * enemy.speed; }
        }
        this.removeDeadEnemies();
    }

    removeDeadEnemies() {
        for (const enemy of this.enemies.filter(e => e.health <= 0)) this.money += enemy.reward || 5;
        this.enemies = this.enemies.filter(e => e.health > 0);
        if (this.activeWaveEnemies <= 0 && this.enemies.length === 0) this.startNextWave();
    }

    makeEnemyPath() {
        this.enemy_paths.push([
            { y: 5, x: 0, cellType: "enemy_path" }, { y: 5, x: 1, cellType: "enemy_path" }, { y: 5, x: 2, cellType: "enemy_path" },
            { y: 5, x: 3, cellType: "enemy_path" }, { y: 5, x: 4, cellType: "enemy_path" }, { y: 4, x: 4, cellType: "enemy_path" },
            { y: 4, x: 5, cellType: "enemy_path" }, { y: 4, x: 6, cellType: "enemy_path" }, { y: 4, x: 7, cellType: "enemy_path" },
            { y: 4, x: 8, cellType: "enemy_path" }, { y: 4, x: 9, cellType: "enemy_path" }
        ]);
        for (const path of this.enemy_paths) for (const step of path) this.grid[step.y][step.x] = step;
    }

    startNextWave() {
        console.log("****************************\n***************************\nStarting next wave");
        this.wave++;

        if (this.wave >= this.waves.length) {
            this.isGameOver = true;
            this.isWin = true;
            return;
        }
        const currentWave = this.waves[this.wave];
        console.log("Current Wave:", currentWave);
        this.activeWaveEnemies = currentWave.count;
        this.waveInterval = currentWave.interval || 20;
        this.waveTimer = 0;
    }

    spawnWaveTick() {
        if (this.wave > this.waves.length) return;
        const currentWave = this.waves[this.wave];
        if (this.waveTimer % this.waveInterval === 0 && this.activeWaveEnemies > 0) {
            const startTile = this.enemy_paths[0][0];
            this.activeWaveEnemies--;
            this.addEnemy(startTile.y, startTile.x, currentWave.type);
        }
        this.waveTimer++;
    }

    tick() {
        this.moveEnemies();
        this.updateTowerTargets();
        this.moveProjectiles();
        this.spawnWaveTick();
    }
}
