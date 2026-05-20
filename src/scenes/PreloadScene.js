import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Loading bar background
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 30, COLORS.UI_BG);
    barBg.setStrokeStyle(2, COLORS.UI_BORDER);

    const barFill = this.add.rectangle(width / 2 - 196, height / 2, 0, 24, COLORS.NEON_BLUE);
    barFill.setOrigin(0, 0.5);

    const loadText = this.add.text(width / 2, height / 2 - 40, 'INITIALIZING...', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#00d4ff'
    }).setOrigin(0.5);

    // Generate all procedural textures
    TextureGenerator.generate(this);

    // Simulate loading progress
    this.tweens.add({
      targets: barFill,
      width: 392,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        loadText.setText('READY');
        this.time.delayedCall(300, () => {
          this.scene.start('MenuScene');
        });
      }
    });
  }
}
