import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const data = SaveManager.loadData();

    // Animated background particles
    this.bgParticles = [];
    for (let i = 0; i < 50; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        COLORS.NEON_BLUE,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        yoyo: true
      });
      this.bgParticles.push(p);
    }

    // Title
    const title = this.add.text(width / 2, height * 0.2, 'VOID SURVIVORS', {
      fontSize: '64px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#00d4ff',
      stroke: '#0066aa',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height * 0.2 + 50, 'Survive the Void', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#8888cc'
    }).setOrigin(0.5);

    // Menu buttons
    this.createButton(width / 2, height * 0.5, 'START GAME', () => {
      this.scene.start('GameScene');
    });

    this.createButton(width / 2, height * 0.5 + 60, 'SETTINGS', () => {
      this.scene.start('SettingsScene', { returnScene: 'MenuScene' });
    });

    if (data.highScores.length > 0) {
      this.createButton(width / 2, height * 0.5 + 120, 'HIGH SCORES', () => {
        this.showHighScores(data);
      });
    }

    // Stats
    if (data.totalRuns > 0) {
      this.add.text(width / 2, height - 60, `Runs: ${data.totalRuns}  |  Total Kills: ${data.totalKills}`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#556688'
      }).setOrigin(0.5);
    }

    // Controls hint
    this.add.text(width / 2, height - 30, 'WASD / Arrow Keys to move  |  ESC to pause  |  F for fullscreen', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#334455'
    }).setOrigin(0.5);
  }

  createButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#aabbcc',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setColor('#00d4ff');
      btn.setScale(1.1);
    });
    btn.on('pointerout', () => {
      btn.setColor('#aabbcc');
      btn.setScale(1);
    });
    btn.on('pointerdown', callback);
    return btn;
  }

  showHighScores(data) {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.rectangle(width / 2, height / 2, 500, 400, COLORS.UI_BG, 0.95)
      .setStrokeStyle(2, COLORS.NEON_BLUE);

    const title = this.add.text(width / 2, height / 2 - 170, 'HIGH SCORES', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#00d4ff'
    }).setOrigin(0.5);

    const scores = data.highScores.slice(0, 8).map((s, i) => {
      const timeStr = `${Math.floor(s.time / 60000)}:${Math.floor((s.time % 60000) / 1000).toString().padStart(2, '0')}`;
      return this.add.text(width / 2, height / 2 - 120 + i * 35,
        `#${i + 1}  Score: ${s.score}  Time: ${timeStr}  Kills: ${s.kills}`, {
          fontSize: '14px',
          fontFamily: 'monospace',
          color: i === 0 ? '#ffaa00' : '#aabbcc'
        }).setOrigin(0.5);
    });

    const closeBtn = this.createButton(width / 2, height / 2 + 170, 'CLOSE', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      scores.forEach(s => s.destroy());
      closeBtn.destroy();
    });
  }
}
