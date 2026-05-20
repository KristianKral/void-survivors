import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.returnScene = data.returnScene || 'MenuScene';
    this.gameScene = data.gameScene || null;
  }

  create() {
    const { width, height } = this.scale;
    this.settings = SaveManager.loadSettings();

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    this.add.rectangle(width / 2, height / 2, 500, 400, COLORS.UI_BG, 0.95)
      .setStrokeStyle(2, COLORS.NEON_BLUE);

    this.add.text(width / 2, height / 2 - 170, 'SETTINGS', {
      fontSize: '32px', fontFamily: 'monospace', fontStyle: 'bold', color: '#00d4ff'
    }).setOrigin(0.5);

    this.createSlider(width / 2, height / 2 - 90, 'Music Volume', this.settings.musicVolume, (val) => { this.settings.musicVolume = val; });
    this.createSlider(width / 2, height / 2 - 20, 'SFX Volume', this.settings.sfxVolume, (val) => { this.settings.sfxVolume = val; });
    this.createToggle(width / 2, height / 2 + 50, 'Screen Shake', this.settings.screenShake, (val) => { this.settings.screenShake = val; });

    this.createButton(width / 2, height / 2 + 110, 'TOGGLE FULLSCREEN', () => { this.scale.toggleFullscreen(); });

    this.createButton(width / 2, height / 2 + 170, 'BACK', () => { this.goBack(); });
    this.input.keyboard.on('keydown-ESC', () => { this.goBack(); });
  }

  goBack() {
    SaveManager.saveSettings(this.settings);
    if (this.returnScene === 'PauseScene') {
      this.scene.start('PauseScene', { gameScene: this.gameScene });
    } else {
      this.scene.start(this.returnScene);
    }
  }

  createSlider(x, y, label, initialValue, onChange) {
    this.add.text(x - 180, y, label, { fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc' }).setOrigin(0, 0.5);
    const sliderWidth = 160;
    const sliderBg = this.add.rectangle(x + 60, y, sliderWidth, 8, 0x333333).setInteractive({ useHandCursor: true });
    const fillWidth = sliderWidth * initialValue;
    const sliderFill = this.add.rectangle(x + 60 - sliderWidth / 2, y, fillWidth, 8, COLORS.NEON_BLUE).setOrigin(0, 0.5);
    const handle = this.add.circle(x + 60 - sliderWidth / 2 + fillWidth, y, 10, COLORS.WHITE).setInteractive({ useHandCursor: true, draggable: true });
    const valueText = this.add.text(x + 160, y, `${Math.round(initialValue * 100)}%`, { fontSize: '14px', fontFamily: 'monospace', color: '#ffffff' }).setOrigin(0, 0.5);

    const minX = x + 60 - sliderWidth / 2;
    sliderBg.on('pointerdown', (pointer) => {
      const localX = pointer.x - minX;
      const val = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      sliderFill.width = sliderWidth * val;
      handle.x = minX + sliderWidth * val;
      valueText.setText(`${Math.round(val * 100)}%`);
      onChange(val);
    });
    this.input.on('drag', (pointer, gameObject, dragX) => {
      if (gameObject !== handle) return;
      const clampedX = Phaser.Math.Clamp(dragX, minX, minX + sliderWidth);
      handle.x = clampedX;
      const val = (clampedX - minX) / sliderWidth;
      sliderFill.width = sliderWidth * val;
      valueText.setText(`${Math.round(val * 100)}%`);
      onChange(val);
    });
  }

  createToggle(x, y, label, initialValue, onChange) {
    this.add.text(x - 180, y, label, { fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc' }).setOrigin(0, 0.5);
    let isOn = initialValue;
    const btn = this.add.text(x + 60, y, isOn ? 'ON' : 'OFF', {
      fontSize: '18px', fontFamily: 'monospace', fontStyle: 'bold', color: isOn ? '#44ff66' : '#ff3344'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      isOn = !isOn;
      btn.setText(isOn ? 'ON' : 'OFF');
      btn.setColor(isOn ? '#44ff66' : '#ff3344');
      onChange(isOn);
    });
  }

  createButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, { fontSize: '20px', fontFamily: 'monospace', color: '#aabbcc', padding: { x: 16, y: 8 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => { btn.setColor('#00d4ff'); btn.setScale(1.05); });
    btn.on('pointerout', () => { btn.setColor('#aabbcc'); btn.setScale(1); });
    btn.on('pointerdown', callback);
    return btn;
  }
}
