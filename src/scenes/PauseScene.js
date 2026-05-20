import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width, height } = this.scale;

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Panel
    this.add.rectangle(width / 2, height / 2, 400, 350, COLORS.UI_BG, 0.95)
      .setStrokeStyle(2, COLORS.NEON_BLUE);

    // Title
    this.add.text(width / 2, height / 2 - 130, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#00d4ff'
    }).setOrigin(0.5);

    // Resume button
    this.createButton(width / 2, height / 2 - 40, 'RESUME', () => {
      this.scene.stop();
      this.gameScene.resumeGame();
    });

    // Settings button
    this.createButton(width / 2, height / 2 + 20, 'SETTINGS', () => {
      this.scene.start('SettingsScene', {
        returnScene: 'PauseScene',
        gameScene: this.gameScene
      });
    });

    // Fullscreen toggle
    this.createButton(width / 2, height / 2 + 80, 'TOGGLE FULLSCREEN', () => {
      this.scale.toggleFullscreen();
    });

    // Quit button
    this.createButton(width / 2, height / 2 + 140, 'QUIT TO MENU', () => {
      this.scene.stop('GameScene');
      this.scene.stop('GameUIScene');
      this.scene.stop();
      this.scene.start('MenuScene');
    });

    // ESC to resume
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.gameScene.resumeGame();
    });
  }

  createButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#aabbcc',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => { btn.setColor('#00d4ff'); btn.setScale(1.05); });
    btn.on('pointerout', () => { btn.setColor('#aabbcc'); btn.setScale(1); });
    btn.on('pointerdown', callback);
    return btn;
  }
}
