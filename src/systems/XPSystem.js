import { COLORS } from '../config/GameConfig.js';
import { distanceBetween } from '../utils/MathUtils.js';

export class XPSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.gems = [];
    this.magnetRange = 200;
    this.magnetSpeed = 400;
  }

  spawnGem(x, y, value) {
    const gem = this.group.create(x, y, 'xp_gem');
    gem.setDepth(3);
    gem.gemData = { value, collected: false };
    gem.body.setAllowGravity(false);

    // Spawn pop effect
    gem.setScale(0);
    this.scene.tweens.add({
      targets: gem,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // Slight random scatter
    gem.setVelocity(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );
    this.scene.time.delayedCall(300, () => {
      if (gem.active && gem.body) {
        gem.setVelocity(0, 0);
        gem.body.stop();
      }
    });

    // Pulsing glow
    this.scene.tweens.add({
      targets: gem,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.gems.push(gem);
    return gem;
  }

  collectGem(gem) {
    if (gem.gemData.collected) return;
    gem.gemData.collected = true;

    const player = this.scene.player;
    player.addXp(gem.gemData.value);

    // Collection effect
    this.scene.tweens.add({
      targets: gem,
      scale: 0,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        gem.destroy();
      }
    });

    // Small particle burst
    this.scene.particleManager.emit('xp', gem.x, gem.y, {
      tint: COLORS.XP_CYAN,
      count: 3
    });

    // Remove from tracking
    const idx = this.gems.indexOf(gem);
    if (idx !== -1) this.gems.splice(idx, 1);
  }

  update(delta, player) {
    const px = player.sprite.x;
    const py = player.sprite.y;
    const pickupRange = player.getPickupRange();

    for (let i = this.gems.length - 1; i >= 0; i--) {
      const gem = this.gems[i];
      if (!gem.active) {
        this.gems.splice(i, 1);
        continue;
      }
      if (gem.gemData.collected) continue;

      const dist = distanceBetween({ x: px, y: py }, gem);

      // Magnetic pull when in range
      if (dist < pickupRange + this.magnetRange) {
        const angle = Math.atan2(py - gem.y, px - gem.x);
        const pullStrength = Math.min(1, 1 - dist / (pickupRange + this.magnetRange));
        gem.x += Math.cos(angle) * this.magnetSpeed * pullStrength * (delta / 1000);
        gem.y += Math.sin(angle) * this.magnetSpeed * pullStrength * (delta / 1000);
      }
    }
  }

  destroy() {
    this.gems.forEach(g => g.destroy());
    this.gems = [];
  }
}
