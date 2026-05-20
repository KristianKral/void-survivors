import Phaser from 'phaser';
import { COLORS } from '../config/GameConfig.js';
import { formatTime } from '../utils/MathUtils.js';

export class GameUIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameUIScene' });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width } = this.scale;

    // Top bar background
    this.topBar = this.add.rectangle(width / 2, 0, width, 50, 0x000000, 0.5).setOrigin(0.5, 0);

    // HP Bar
    this.hpBarBg = this.add.rectangle(20, 12, 200, 16, 0x333333, 0.8).setOrigin(0);
    this.hpBarBg.setStrokeStyle(1, COLORS.UI_BORDER);
    this.hpBarFill = this.add.rectangle(21, 13, 198, 14, COLORS.HEALTH_GREEN).setOrigin(0);
    this.hpText = this.add.text(120, 20, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(10);

    // XP Bar
    this.xpBarBg = this.add.rectangle(20, 32, 200, 10, 0x333333, 0.8).setOrigin(0);
    this.xpBarBg.setStrokeStyle(1, COLORS.UI_BORDER);
    this.xpBarFill = this.add.rectangle(21, 33, 0, 8, COLORS.XP_CYAN).setOrigin(0);

    // Level text
    this.levelText = this.add.text(230, 12, 'LV 1', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#00d4ff'
    });

    // Timer
    this.timerText = this.add.text(width / 2, 10, '0:00', {
      fontSize: '22px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // Kill count
    this.killText = this.add.text(width - 20, 10, 'Kills: 0', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aabbcc'
    }).setOrigin(1, 0);

    // Score
    this.scoreText = this.add.text(width - 20, 30, 'Score: 0', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffaa00'
    }).setOrigin(1, 0);

    // Weapon icons area
    this.weaponIcons = [];
    this.weaponIconsContainer = this.add.container(20, 55);

    // Set depth
    this.children.list.forEach(child => child.setDepth(100));
  }

  update() {
    if (!this.gameScene || !this.gameScene.player) return;

    const player = this.gameScene.player;

    // HP bar
    const hpPercent = player.currentHp / player.getMaxHp();
    this.hpBarFill.width = 198 * Math.max(0, hpPercent);
    this.hpBarFill.fillColor = hpPercent > 0.5 ? COLORS.HEALTH_GREEN :
      (hpPercent > 0.25 ? 0xffaa00 : COLORS.HEALTH_RED);
    this.hpText.setText(`${Math.ceil(player.currentHp)} / ${player.getMaxHp()}`);

    // XP bar
    const xpPercent = player.currentXp / player.xpToNext;
    this.xpBarFill.width = 198 * Math.max(0, xpPercent);

    // Level
    this.levelText.setText(`LV ${player.level}`);

    // Timer
    this.timerText.setText(formatTime(this.gameScene.gameTime));

    // Kills & score
    this.killText.setText(`Kills: ${this.gameScene.killCount}`);
    this.scoreText.setText(`Score: ${this.gameScene.score}`);

    // Update weapon icons
    this.updateWeaponIcons();
  }

  updateWeaponIcons() {
    // Clear old icons
    this.weaponIconsContainer.removeAll(true);

    const weapons = this.gameScene.weaponSystem.weapons;
    weapons.forEach((w, i) => {
      const bg = this.add.rectangle(i * 36, 0, 32, 32, COLORS.UI_BG, 0.8)
        .setStrokeStyle(1, COLORS.UI_BORDER).setOrigin(0);
      const label = this.add.text(i * 36 + 16, 16, w.config.name.charAt(0), {
        fontSize: '16px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#00d4ff'
      }).setOrigin(0.5);

      this.weaponIconsContainer.add(bg);
      this.weaponIconsContainer.add(label);
    });
  }
}
