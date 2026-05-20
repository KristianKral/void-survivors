import Phaser from 'phaser';
import { WORLD, COLORS, PLAYER, SPAWN, ENEMIES, WEAPONS } from '../config/GameConfig.js';
import { Player } from '../entities/Player.js';
import { EnemyManager } from '../systems/EnemyManager.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { XPSystem } from '../systems/XPSystem.js';
import { ParticleManager } from '../systems/ParticleManager.js';
import { AudioManager } from '../managers/AudioManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameTime = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.killCount = 0;
    this.score = 0;

    this.createWorld();
    this.createPlayer();
    this.createSystems();
    this.createCollisions();
    this.createInput();

    // Launch UI overlay
    this.scene.launch('GameUIScene', { gameScene: this });

    this.audioManager = new AudioManager(this);

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor(COLORS.VOID_BLACK);
  }

  createWorld() {
    // Tiled background
    for (let x = 0; x < WORLD.WIDTH; x += WORLD.TILE_SIZE) {
      for (let y = 0; y < WORLD.HEIGHT; y += WORLD.TILE_SIZE) {
        this.add.image(x, y, 'bg_tile').setOrigin(0);
      }
    }

    // World bounds
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    // Border visual
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.NEON_PINK, 0.5);
    border.strokeRect(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
  }

  createPlayer() {
    this.player = new Player(this, WORLD.WIDTH / 2, WORLD.HEIGHT / 2);
  }

  createSystems() {
    this.particleManager = new ParticleManager(this);
    this.enemyManager = new EnemyManager(this);
    this.weaponSystem = new WeaponSystem(this, this.player);
    this.xpSystem = new XPSystem(this);

    // Give player their starting weapon
    this.weaponSystem.addWeapon(WEAPONS.VOID_BOLT);
  }

  createCollisions() {
    // Player vs enemies
    this.physics.add.overlap(
      this.player.sprite,
      this.enemyManager.group,
      (playerSprite, enemySprite) => {
        if (!enemySprite.active || !enemySprite.enemyData) return;
        this.player.takeDamage(enemySprite.enemyData.damage);
      }
    );

    // Projectiles vs enemies
    this.physics.add.overlap(
      this.weaponSystem.projectileGroup,
      this.enemyManager.group,
      (projSprite, enemySprite) => {
        if (!projSprite.active || !enemySprite.active) return;
        if (!projSprite.projData || !enemySprite.enemyData) return;
        this.handleProjectileHit(projSprite, enemySprite);
      }
    );

    // Player vs XP gems
    this.physics.add.overlap(
      this.player.pickupZone,
      this.xpSystem.group,
      (pickupZone, gem) => {
        if (!gem.active) return;
        this.xpSystem.collectGem(gem);
      }
    );
  }

  handleProjectileHit(projSprite, enemySprite) {
    const proj = projSprite.projData;
    const enemy = enemySprite.enemyData;

    const dmgMult = 1 + (this.player.stats.damageBonus || 0);
    const damage = proj.damage * dmgMult - (enemy.armor || 0);
    const actualDmg = Math.max(1, damage);

    enemy.currentHp -= actualDmg;

    // Hit particles
    this.particleManager.emit('hit', enemySprite.x, enemySprite.y, {
      tint: enemy.config.color,
      count: 3
    });

    // Show damage number
    this.showDamageNumber(enemySprite.x, enemySprite.y, Math.round(actualDmg));

    if (enemy.currentHp <= 0) {
      this.onEnemyKilled(enemySprite);
    }

    // Handle pierce
    proj.pierceLeft--;
    if (proj.pierceLeft <= 0) {
      this.weaponSystem.releaseProjectile(projSprite);
    }
  }

  onEnemyKilled(enemySprite) {
    const enemy = enemySprite.enemyData;
    this.killCount++;
    this.score += enemy.config.xp * 10;

    // Spawn XP gem
    this.xpSystem.spawnGem(enemySprite.x, enemySprite.y, enemy.config.xp);

    // Death particles
    this.particleManager.emit('death', enemySprite.x, enemySprite.y, {
      tint: enemy.config.color,
      count: 8
    });

    this.enemyManager.killEnemy(enemySprite);
  }

  showDamageNumber(x, y, amount) {
    const txt = this.add.text(x, y - 10, amount.toString(), {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.isGameOver) this.pauseGame();
    });

    this.input.keyboard.on('keydown-F', () => {
      this.scale.toggleFullscreen();
    });
  }

  pauseGame() {
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch('PauseScene', { gameScene: this });
  }

  resumeGame() {
    this.isPaused = false;
    this.scene.resume();
  }

  triggerLevelUp(choices) {
    if (this.scene.isPaused()) {
      // Already paused (queued level-up), just launch the UI
      this.scene.launch('LevelUpScene', { gameScene: this, choices });
    } else {
      this.scene.pause();
      this.scene.launch('LevelUpScene', { gameScene: this, choices });
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.scene.pause();
    this.scene.stop('GameUIScene');
    this.scene.launch('GameOverScene', {
      score: this.score,
      time: this.gameTime,
      level: this.player.level,
      kills: this.killCount
    });
  }

  update(time, delta) {
    if (this.isPaused || this.isGameOver) return;

    this.gameTime += delta;

    // Player update
    const input = {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown
    };
    this.player.update(delta, input);

    // Systems update
    this.enemyManager.update(delta, this.gameTime);
    this.weaponSystem.update(delta, this.enemyManager.getActiveEnemies());
    this.xpSystem.update(delta, this.player);
    this.particleManager.update(delta);

    // Check game over
    if (this.player.currentHp <= 0) {
      this.gameOver();
    }
  }

  shutdown() {
    this.scene.stop('GameUIScene');
    if (this.audioManager) this.audioManager.destroy();
  }
}
