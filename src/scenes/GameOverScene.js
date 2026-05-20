import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';
import { formatTime } from '../utils/MathUtils.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalTime = data.time || 0;
    this.finalLevel = data.level || 1;
    this.finalKills = data.kills || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Save the run
    const saveData = SaveManager.saveHighScore(
      this.finalScore,
      this.finalTime,
      this.finalLevel,
      this.finalKills
    );

    const isNewBest = saveData.highScores[0]?.score === this.finalScore;

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Panel
    this.add.rectangle(width / 2, height / 2, 500, 450, COLORS.UI_BG, 0.95)
      .setStrokeStyle(2, COLORS.HEALTH_RED);

    // Title
    this.add.text(width / 2, height / 2 - 180, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ff3344'
    }).setOrigin(0.5);

    if (isNewBest) {
      const newBest = this.add.text(width / 2, height / 2 - 130, '★ NEW HIGH SCORE ★', {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffaa00'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: newBest,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Stats
    const stats = [
      `Score: ${this.finalScore}`,
      `Time: ${formatTime(this.finalTime)}`,
      `Level: ${this.finalLevel}`,
      `Kills: ${this.finalKills}`
    ];

    stats.forEach((stat, i) => {
      this.add.text(width / 2, height / 2 - 70 + i * 35, stat, {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ccddee'
      }).setOrigin(0.5);
    });

    // Buttons
    this.createButton(width / 2, height / 2 + 100, 'PLAY AGAIN', () => {
      this.scene.stop();
      this.scene.start('GameScene');
    });

    this.createButton(width / 2, height / 2 + 160, 'MAIN MENU', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    });
  }

  createButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#aabbcc',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => { btn.setColor('#00d4ff'); btn.setScale(1.1); });
    btn.on('pointerout', () => { btn.setColor('#aabbcc'); btn.setScale(1); });
    btn.on('pointerdown', callback);
    return btn;
  }
}
