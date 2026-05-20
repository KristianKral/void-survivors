import { WEAPONS, COLORS } from '../config/GameConfig.js';
import { distanceBetween, angleBetween } from '../utils/MathUtils.js';

export class WeaponSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.weapons = [];
    this.projectileGroup = scene.physics.add.group();
    this.activeProjectiles = [];
    this.orbs = [];
    this.orbAngle = 0;
  }

  addWeapon(weaponConfig) {
    this.weapons.push({
      config: { ...weaponConfig },
      cooldownTimer: 0,
      level: 1
    });
  }

  addWeaponByKey(key) {
    const configs = {
      orbital: WEAPONS.ORBITAL,
      nova: WEAPONS.NOVA,
      chain_lightning: WEAPONS.CHAIN_LIGHTNING
    };
    if (configs[key]) {
      this.addWeapon(configs[key]);
      if (key === 'orbital') this.createOrbs();
    }
  }

  hasWeapon(key) {
    const keyMap = {
      new_weapon_orbital: 'orbital',
      new_weapon_nova: 'nova',
      new_weapon_chain: 'chain_lightning'
    };
    const weaponKey = keyMap[key] || key;
    return this.weapons.some(w => w.config.key === weaponKey);
  }

  createOrbs() {
    const orbWeapon = this.weapons.find(w => w.config.key === 'orbital');
    if (!orbWeapon) return;

    // Clear existing orbs
    this.orbs.forEach(o => o.destroy());
    this.orbs = [];

    const count = orbWeapon.config.orbCount || 2;
    for (let i = 0; i < count; i++) {
      const orb = this.scene.physics.add.sprite(0, 0, 'orb');
      orb.setDepth(11);
      orb.orbData = { damage: orbWeapon.config.damage, hitCooldowns: new Map() };
      this.orbs.push(orb);

      // Add overlap with enemies
      this.scene.physics.add.overlap(orb, this.scene.enemyManager.group, (orbSprite, enemySprite) => {
        if (!enemySprite.active || !enemySprite.enemyData) return;
        const cd = orbSprite.orbData.hitCooldowns.get(enemySprite);
        if (cd && cd > this.scene.time.now) return;
        orbSprite.orbData.hitCooldowns.set(enemySprite, this.scene.time.now + 500);

        const dmgMult = 1 + (this.player.stats.damageBonus || 0);
        const dmg = Math.max(1, orbSprite.orbData.damage * dmgMult);
        enemySprite.enemyData.currentHp -= dmg;

        this.scene.particleManager.emit('hit', enemySprite.x, enemySprite.y, {
          tint: COLORS.NEON_PINK, count: 3
        });
        this.scene.showDamageNumber(enemySprite.x, enemySprite.y, Math.round(dmg));

        if (enemySprite.enemyData.currentHp <= 0) {
          this.scene.onEnemyKilled(enemySprite);
        }
      });
    }
  }

  update(delta, enemies) {
    const cdReduction = 1 - (this.player.stats.cooldownReduction || 0);

    for (const weapon of this.weapons) {
      weapon.cooldownTimer -= delta;

      if (weapon.config.key === 'void_bolt') {
        this.updateVoidBolt(weapon, enemies, cdReduction);
      } else if (weapon.config.key === 'orbital') {
        this.updateOrbital(weapon, delta);
      } else if (weapon.config.key === 'nova') {
        this.updateNova(weapon, enemies, cdReduction);
      } else if (weapon.config.key === 'chain_lightning') {
        this.updateChainLightning(weapon, enemies, cdReduction);
      }
    }

    // Clean up off-screen / expired projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.activeProjectiles[i];
      if (!p.active) {
        this.activeProjectiles.splice(i, 1);
        continue;
      }
      p.projData.lifetime -= delta;
      if (p.projData.lifetime <= 0) {
        this.releaseProjectile(p);
        this.activeProjectiles.splice(i, 1);
      }
    }
  }

  updateVoidBolt(weapon, enemies, cdReduction) {
    if (weapon.cooldownTimer > 0 || enemies.length === 0) return;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    // Find nearest enemy in range
    let nearest = null;
    let nearestDist = weapon.config.range;

    for (const enemy of enemies) {
      const dist = distanceBetween({ x: px, y: py }, enemy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    weapon.cooldownTimer = weapon.config.cooldown * cdReduction;

    const angle = angleBetween({ x: px, y: py }, nearest);
    this.fireProjectile(px, py, angle, weapon.config);
  }

  updateOrbital(weapon, delta) {
    const orbSpeed = weapon.config.orbSpeed || 2;
    this.orbAngle += orbSpeed * delta * 0.001 * Math.PI * 2;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const range = weapon.config.range || 100;

    this.orbs.forEach((orb, i) => {
      const angle = this.orbAngle + (i / this.orbs.length) * Math.PI * 2;
      orb.setPosition(
        px + Math.cos(angle) * range,
        py + Math.sin(angle) * range
      );
    });
  }

  updateNova(weapon, enemies, cdReduction) {
    if (weapon.cooldownTimer > 0) return;

    weapon.cooldownTimer = weapon.config.cooldown * cdReduction;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const radius = weapon.config.radius;
    const dmgMult = 1 + (this.player.stats.damageBonus || 0);
    const damage = weapon.config.damage * dmgMult;

    // Visual effect
    const nova = this.scene.add.sprite(px, py, 'nova');
    nova.setDepth(15);
    nova.setAlpha(0.8);
    nova.setScale(0.5);
    this.scene.tweens.add({
      targets: nova,
      scale: radius / 32,
      alpha: 0,
      duration: 400,
      onComplete: () => nova.destroy()
    });

    // Damage enemies in radius
    for (const enemy of enemies) {
      if (distanceBetween({ x: px, y: py }, enemy) <= radius) {
        enemy.enemyData.currentHp -= damage;
        this.scene.showDamageNumber(enemy.x, enemy.y, Math.round(damage));
        this.scene.particleManager.emit('hit', enemy.x, enemy.y, {
          tint: COLORS.NEON_YELLOW, count: 4
        });
        if (enemy.enemyData.currentHp <= 0) {
          this.scene.onEnemyKilled(enemy);
        }
      }
    }
  }

  updateChainLightning(weapon, enemies, cdReduction) {
    if (weapon.cooldownTimer > 0 || enemies.length === 0) return;

    weapon.cooldownTimer = weapon.config.cooldown * cdReduction;

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const dmgMult = 1 + (this.player.stats.damageBonus || 0);
    const damage = weapon.config.damage * dmgMult;

    // Find nearest
    let current = { x: px, y: py };
    const hit = new Set();
    const chains = weapon.config.chains || 3;

    for (let c = 0; c < chains; c++) {
      let nearest = null;
      let nearestDist = weapon.config.range;

      for (const enemy of enemies) {
        if (hit.has(enemy) || !enemy.active) continue;
        const dist = distanceBetween(current, enemy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = enemy;
        }
      }

      if (!nearest) break;

      hit.add(nearest);

      // Lightning visual
      this.drawLightning(current.x, current.y, nearest.x, nearest.y);

      // Damage
      nearest.enemyData.currentHp -= damage;
      this.scene.showDamageNumber(nearest.x, nearest.y, Math.round(damage));

      if (nearest.enemyData.currentHp <= 0) {
        this.scene.onEnemyKilled(nearest);
      }

      current = { x: nearest.x, y: nearest.y };
    }
  }

  drawLightning(x1, y1, x2, y2) {
    const g = this.scene.add.graphics();
    g.lineStyle(2, COLORS.NEON_BLUE, 0.8);
    g.setDepth(15);

    // Jagged line
    const segments = 5;
    let px = x1;
    let py = y1;

    g.beginPath();
    g.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
      g.lineTo(mx, my);
    }
    g.lineTo(x2, y2);
    g.strokePath();

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 200,
      onComplete: () => g.destroy()
    });
  }

  fireProjectile(x, y, angle, config) {
    const proj = this.projectileGroup.create(x, y, `projectile_${config.key}`);
    proj.setDepth(8);
    proj.setVelocity(
      Math.cos(angle) * config.speed,
      Math.sin(angle) * config.speed
    );
    proj.setRotation(angle);

    proj.projData = {
      damage: config.damage,
      pierceLeft: config.pierce || 1,
      lifetime: 2000
    };

    this.activeProjectiles.push(proj);
    return proj;
  }

  releaseProjectile(proj) {
    proj.projData = null;
    proj.destroy();
  }

  destroy() {
    this.activeProjectiles.forEach(p => p.destroy());
    this.orbs.forEach(o => o.destroy());
    this.activeProjectiles = [];
    this.orbs = [];
  }
}
