import Phaser from 'phaser';
import { PLAYER, COLORS } from '../config/GameConfig.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Stats
    this.level = 1;
    this.currentXp = 0;
    this.xpToNext = PLAYER.XP_PER_LEVEL[0];
    this.maxHp = PLAYER.BASE_HP;
    this.currentHp = this.maxHp;
    this.baseSpeed = PLAYER.BASE_SPEED;
    this.pickupRange = PLAYER.BASE_PICKUP_RANGE;

    this.stats = {
      speedBonus: 0,
      damageBonus: 0,
      cooldownReduction: 0,
      armor: 0,
      regen: 0,
      maxHpBonus: 0,
      pickupRangeBonus: 0
    };

    this.invincibleTimer = 0;
    this.regenAccumulator = 0;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.setDamping(true);
    this.sprite.setDrag(0.9);

    // Pickup zone (invisible circle for collecting XP)
    this.pickupZone = scene.physics.add.sprite(x, y, null);
    this.pickupZone.setVisible(false);
    this.pickupZone.body.setCircle(this.getPickupRange());
    this.pickupZone.body.setOffset(
      -this.getPickupRange() + 16,
      -this.getPickupRange() + 16
    );

    // Shadow
    this.shadow = scene.add.ellipse(x, y + 12, 24, 10, 0x000000, 0.3);
    this.shadow.setDepth(9);

    // Invincibility flash tween (created when needed)
    this.flashTween = null;
  }

  getSpeed() {
    return this.baseSpeed * (1 + this.stats.speedBonus);
  }

  getPickupRange() {
    return this.pickupRange + this.stats.pickupRangeBonus;
  }

  getMaxHp() {
    return this.maxHp + this.stats.maxHpBonus;
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return;

    const dmg = Math.max(1, amount - this.stats.armor);
    this.currentHp -= dmg;
    this.currentHp = Math.max(0, this.currentHp);

    this.invincibleTimer = PLAYER.INVINCIBILITY_MS;

    // Flash effect
    if (this.flashTween) this.flashTween.stop();
    this.flashTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => { this.sprite.alpha = 1; }
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);

    // Hit particles
    this.scene.particleManager.emit('hit', this.sprite.x, this.sprite.y, {
      tint: COLORS.HEALTH_RED,
      count: 5
    });
  }

  heal(amount) {
    this.currentHp = Math.min(this.getMaxHp(), this.currentHp + amount);
  }

  addXp(amount) {
    this.currentXp += amount;
    this.pendingLevelUps = this.pendingLevelUps || 0;

    while (this.currentXp >= this.xpToNext) {
      this.currentXp -= this.xpToNext;
      this.level++;
      const idx = Math.min(this.level - 1, PLAYER.XP_PER_LEVEL.length - 1);
      this.xpToNext = PLAYER.XP_PER_LEVEL[idx] + Math.max(0, this.level - PLAYER.XP_PER_LEVEL.length) * 50;
      this.heal(Math.floor(this.getMaxHp() * 0.1));
      this.pendingLevelUps++;
    }

    if (this.pendingLevelUps > 0) {
      this.processNextLevelUp();
    }
  }

  processNextLevelUp() {
    if (this.pendingLevelUps <= 0) return;
    this.pendingLevelUps--;

    this.scene.particleManager.emit('levelup', this.sprite.x, this.sprite.y, {
      tint: COLORS.NEON_YELLOW,
      count: 20
    });

    this.scene.triggerLevelUp(this.getRandomUpgrades(3));
  }

  getRandomUpgrades(count) {
    // Dynamic import workaround — pull from config
    const upgrades = [
      { key: 'max_hp', name: 'Vitality', description: '+20 Max HP', apply: () => { this.stats.maxHpBonus += 20; this.currentHp += 20; } },
      { key: 'speed', name: 'Swift Boots', description: '+15% Move Speed', apply: () => { this.stats.speedBonus += 0.15; } },
      { key: 'damage', name: 'Power Shard', description: '+15% Damage', apply: () => { this.stats.damageBonus += 0.15; } },
      { key: 'cooldown', name: 'Chrono Lens', description: '-10% Cooldowns', apply: () => { this.stats.cooldownReduction += 0.10; } },
      { key: 'pickup_range', name: 'Magnet', description: '+30 Pickup Range', apply: () => { this.stats.pickupRangeBonus += 30; this.updatePickupZone(); } },
      { key: 'armor', name: 'Void Shield', description: '+5 Armor', apply: () => { this.stats.armor += 5; } },
      { key: 'regen', name: 'Regeneration', description: '+1 HP/sec', apply: () => { this.stats.regen += 1; } },
      { key: 'new_weapon_orbital', name: 'Void Orb', description: 'Orbs rotate around you', apply: () => { this.scene.weaponSystem.addWeaponByKey('orbital'); }, unique: true },
      { key: 'new_weapon_nova', name: 'Nova Pulse', description: 'Periodic explosion around you', apply: () => { this.scene.weaponSystem.addWeaponByKey('nova'); }, unique: true },
      { key: 'new_weapon_chain', name: 'Chain Lightning', description: 'Bolts chain between enemies', apply: () => { this.scene.weaponSystem.addWeaponByKey('chain_lightning'); }, unique: true }
    ];

    // Filter out already-acquired unique upgrades
    const available = upgrades.filter(u => {
      if (u.unique && this.scene.weaponSystem.hasWeapon(u.key)) return false;
      return true;
    });

    // Shuffle and pick
    const shuffled = Phaser.Utils.Array.Shuffle([...available]);
    return shuffled.slice(0, count);
  }

  updatePickupZone() {
    const range = this.getPickupRange();
    this.pickupZone.body.setCircle(range);
    this.pickupZone.body.setOffset(-range + 16, -range + 16);
  }

  applyUpgrade(upgrade) {
    upgrade.apply();
  }

  update(delta, input) {
    // Movement
    let vx = 0;
    let vy = 0;

    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    // Normalize diagonal
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx /= len;
      vy /= len;
    }

    const speed = this.getSpeed();
    this.sprite.setVelocity(vx * speed, vy * speed);

    // Update pickup zone position
    this.pickupZone.setPosition(this.sprite.x, this.sprite.y);

    // Update shadow
    this.shadow.setPosition(this.sprite.x, this.sprite.y + 12);

    // Invincibility timer
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
    }

    // Regen
    if (this.stats.regen > 0) {
      this.regenAccumulator += delta;
      if (this.regenAccumulator >= 1000) {
        this.heal(this.stats.regen);
        this.regenAccumulator -= 1000;
      }
    }

    // Sprite facing
    if (vx < 0) this.sprite.setFlipX(true);
    else if (vx > 0) this.sprite.setFlipX(false);

    // Subtle bob animation
    const bob = Math.sin(this.scene.time.now * 0.005) * 1.5;
    this.sprite.y += bob * 0.1;
  }
}
