import Phaser from 'phaser';
import { ENEMIES, SPAWN, WORLD } from '../config/GameConfig.js';
import { randomPointOnCircle, distanceBetween, angleBetween } from '../utils/MathUtils.js';

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.spawnTimer = 0;
    this.bossTimer = 0;
    this.activeEnemies = [];

    this.enemyTypes = [
      ENEMIES.CRAWLER,
      ENEMIES.DASHER,
      ENEMIES.TANK,
      ENEMIES.SPITTER
    ];
  }

  getSpawnInterval() {
    const minutesElapsed = this.scene.gameTime / 60000;
    return Math.max(
      SPAWN.MIN_INTERVAL,
      SPAWN.BASE_INTERVAL - minutesElapsed * SPAWN.INTERVAL_DECREASE_PER_MIN
    );
  }

  getSpawnCount() {
    const minutesElapsed = this.scene.gameTime / 60000;
    return Math.floor(SPAWN.BASE_COUNT + minutesElapsed * SPAWN.COUNT_INCREASE_PER_MIN);
  }

  getAvailableTypes() {
    const minutes = this.scene.gameTime / 60000;
    const types = [ENEMIES.CRAWLER];
    if (minutes >= 0.5) types.push(ENEMIES.DASHER);
    if (minutes >= 1.5) types.push(ENEMIES.SPITTER);
    if (minutes >= 3) types.push(ENEMIES.TANK);
    return types;
  }

  update(delta, gameTime) {
    this.spawnTimer += delta;
    this.bossTimer += delta;

    // Spawn regular enemies
    if (this.spawnTimer >= this.getSpawnInterval()) {
      this.spawnTimer = 0;
      this.spawnWave();
    }

    // Spawn boss
    if (this.bossTimer >= SPAWN.BOSS_INTERVAL_SEC * 1000) {
      this.bossTimer = 0;
      this.spawnBoss();
    }

    // Update all active enemies
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      if (!enemy.active) {
        this.activeEnemies.splice(i, 1);
        continue;
      }
      this.updateEnemy(enemy, delta);
    }
  }

  spawnWave() {
    const count = this.getSpawnCount();
    const types = this.getAvailableTypes();
    const player = this.scene.player.sprite;
    const difficultyMult = 1 + this.scene.gameTime / 120000; // scales over 2 min

    for (let i = 0; i < count; i++) {
      const type = Phaser.Utils.Array.GetRandom(types);
      const pos = randomPointOnCircle(player.x, player.y, SPAWN.SPAWN_DISTANCE);

      // Clamp to world bounds
      pos.x = Phaser.Math.Clamp(pos.x, 20, WORLD.WIDTH - 20);
      pos.y = Phaser.Math.Clamp(pos.y, 20, WORLD.HEIGHT - 20);

      this.spawnEnemy(type, pos.x, pos.y, difficultyMult);
    }
  }

  spawnBoss() {
    const player = this.scene.player.sprite;
    const pos = randomPointOnCircle(player.x, player.y, SPAWN.SPAWN_DISTANCE);
    pos.x = Phaser.Math.Clamp(pos.x, 50, WORLD.WIDTH - 50);
    pos.y = Phaser.Math.Clamp(pos.y, 50, WORLD.HEIGHT - 50);

    const difficultyMult = 1 + this.scene.gameTime / 60000;
    this.spawnEnemy(ENEMIES.BOSS_VOID_KING, pos.x, pos.y, difficultyMult);
  }

  spawnEnemy(config, x, y, difficultyMult = 1) {
    const sprite = this.group.create(x, y, `enemy_${config.key}`);
    sprite.setDepth(5);
    sprite.body.setCollideWorldBounds(true);

    sprite.enemyData = {
      config,
      currentHp: Math.floor(config.hp * difficultyMult),
      maxHp: Math.floor(config.hp * difficultyMult),
      speed: config.speed,
      damage: Math.floor(config.damage * (1 + (difficultyMult - 1) * 0.5)),
      armor: 0,
      attackCooldown: 0,
      dashCooldown: 0,
      dashTimer: 0,
      isDashing: false
    };

    this.activeEnemies.push(sprite);
    return sprite;
  }

  updateEnemy(enemySprite, delta) {
    const enemy = enemySprite.enemyData;
    const player = this.scene.player.sprite;
    const dist = distanceBetween(enemySprite, player);
    const angle = angleBetween(enemySprite, player);

    const config = enemy.config;

    if (config.key === 'dasher') {
      this.updateDasher(enemySprite, enemy, player, dist, angle, delta);
    } else if (config.key === 'spitter') {
      this.updateSpitter(enemySprite, enemy, player, dist, angle, delta);
    } else {
      // Default chase behavior
      enemySprite.setVelocity(
        Math.cos(angle) * enemy.speed,
        Math.sin(angle) * enemy.speed
      );
    }

    // Face player
    if (Math.cos(angle) < 0) enemySprite.setFlipX(true);
    else enemySprite.setFlipX(false);

    // Health bar for bosses / damaged enemies
    if (config.isBoss || enemy.currentHp < enemy.maxHp) {
      this.drawHealthBar(enemySprite, enemy);
    }
  }

  updateDasher(sprite, enemy, player, dist, angle, delta) {
    enemy.dashCooldown -= delta;

    if (enemy.isDashing) {
      enemy.dashTimer -= delta;
      if (enemy.dashTimer <= 0) {
        enemy.isDashing = false;
        enemy.dashCooldown = 2000;
      }
    } else if (dist < 200 && enemy.dashCooldown <= 0) {
      // Dash towards player
      enemy.isDashing = true;
      enemy.dashTimer = 300;
      sprite.setVelocity(
        Math.cos(angle) * enemy.speed * 3,
        Math.sin(angle) * enemy.speed * 3
      );
    } else {
      sprite.setVelocity(
        Math.cos(angle) * enemy.speed,
        Math.sin(angle) * enemy.speed
      );
    }
  }

  updateSpitter(sprite, enemy, player, dist, angle, delta) {
    enemy.attackCooldown -= delta;

    if (dist > 150) {
      // Move closer
      sprite.setVelocity(
        Math.cos(angle) * enemy.speed,
        Math.sin(angle) * enemy.speed
      );
    } else {
      // Stop and shoot
      sprite.setVelocity(0, 0);
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = 2000;
        this.fireEnemyProjectile(sprite, angle);
      }
    }
  }

  fireEnemyProjectile(sprite, angle) {
    const proj = this.scene.physics.add.sprite(sprite.x, sprite.y, 'projectile_enemy');
    proj.setDepth(4);
    proj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

    // Overlap with player
    this.scene.physics.add.overlap(proj, this.scene.player.sprite, () => {
      this.scene.player.takeDamage(12);
      proj.destroy();
    });

    // Auto-destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (proj.active) proj.destroy();
    });
  }

  drawHealthBar(sprite, enemy) {
    // Remove old health bar if present
    if (sprite.hpBar) sprite.hpBar.destroy();

    const g = this.scene.add.graphics();
    const width = sprite.width;
    const hpPercent = enemy.currentHp / enemy.maxHp;
    const barY = sprite.y - sprite.height / 2 - 8;

    g.fillStyle(0x333333, 0.8);
    g.fillRect(sprite.x - width / 2, barY, width, 4);

    const color = hpPercent > 0.5 ? 0x44ff66 : (hpPercent > 0.25 ? 0xffaa00 : 0xff3344);
    g.fillStyle(color, 1);
    g.fillRect(sprite.x - width / 2, barY, width * hpPercent, 4);

    g.setDepth(20);
    sprite.hpBar = g;

    // Clean up next frame
    this.scene.time.delayedCall(50, () => {
      if (g.active) g.destroy();
    });
  }

  killEnemy(sprite) {
    if (sprite.hpBar) sprite.hpBar.destroy();
    sprite.enemyData = null;
    sprite.destroy();
  }

  getActiveEnemies() {
    return this.activeEnemies.filter(e => e.active);
  }

  destroy() {
    this.activeEnemies.forEach(e => {
      if (e.hpBar) e.hpBar.destroy();
      e.destroy();
    });
    this.activeEnemies = [];
  }
}
