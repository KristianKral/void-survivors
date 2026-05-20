import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelUpScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.choices = data.choices || [];
  }

  create() {
    const { width, height } = this.scale;

    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Title
    const title = this.add.text(width / 2, height * 0.15, 'LEVEL UP!', {
      fontSize: '42px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffee00'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 400,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height * 0.15 + 40, `Level ${this.gameScene.player.level}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aabbcc'
    }).setOrigin(0.5);

    // Choice cards
    const cardWidth = 220;
    const cardHeight = 200;
    const totalWidth = this.choices.length * (cardWidth + 20) - 20;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    this.choices.forEach((choice, i) => {
      const cx = startX + i * (cardWidth + 20);
      const cy = height * 0.55;

      this.createCard(cx, cy, cardWidth, cardHeight, choice, i);
    });
  }

  createCard(x, y, w, h, choice, index) {
    // Card background
    const card = this.add.rectangle(x, y, w, h, COLORS.UI_BG, 0.95)
      .setStrokeStyle(2, COLORS.UI_BORDER)
      .setInteractive({ useHandCursor: true });

    // Name
    this.add.text(x, y - h / 2 + 30, choice.name, {
      fontSize: '18px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#00d4ff',
      wordWrap: { width: w - 20 },
      align: 'center'
    }).setOrigin(0.5);

    // Divider
    this.add.rectangle(x, y - h / 2 + 55, w - 30, 1, COLORS.UI_BORDER);

    // Description
    this.add.text(x, y + 10, choice.description, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aabbcc',
      wordWrap: { width: w - 30 },
      align: 'center'
    }).setOrigin(0.5);

    // Key hint
    this.add.text(x, y + h / 2 - 25, `[${index + 1}]`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#556677'
    }).setOrigin(0.5);

    // Hover effects
    card.on('pointerover', () => {
      card.setStrokeStyle(2, COLORS.NEON_BLUE);
      card.setFillStyle(0x1a2244, 0.95);
    });
    card.on('pointerout', () => {
      card.setStrokeStyle(2, COLORS.UI_BORDER);
      card.setFillStyle(COLORS.UI_BG, 0.95);
    });

    // Click to select
    card.on('pointerdown', () => {
      this.selectChoice(choice);
    });

    // Keyboard shortcut
    this.input.keyboard.on(`keydown-${index + 1}`, () => {
      this.selectChoice(choice);
    });

    // Entrance animation
    card.setScale(0);
    this.tweens.add({
      targets: card,
      scale: 1,
      duration: 300,
      delay: index * 100,
      ease: 'Back.easeOut'
    });
  }

  selectChoice(choice) {
    this.gameScene.player.applyUpgrade(choice);
    this.scene.stop();

    const player = this.gameScene.player;
    if (player.pendingLevelUps > 0) {
      // Show next level-up without resuming gameplay
      player.processNextLevelUp();
    } else {
      this.gameScene.scene.resume('GameScene');
    }
  }
}
