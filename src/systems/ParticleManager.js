import Phaser from 'phaser';

export class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  emit(type, x, y, options = {}) {
    const count = options.count || 5;
    const tint = options.tint || 0xffffff;

    for (let i = 0; i < count; i++) {
      const p = this.scene.add.circle(
        x + (Math.random() - 0.5) * 10,
        y + (Math.random() - 0.5) * 10,
        type === 'levelup' ? Phaser.Math.Between(3, 6) : Phaser.Math.Between(2, 4),
        tint,
        1
      );
      p.setDepth(50);

      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'levelup' ? Phaser.Math.Between(80, 200) : Phaser.Math.Between(40, 120);
      const lifetime = type === 'levelup' ? 800 : 400;

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: p,
        x: p.x + vx * (lifetime / 1000),
        y: p.y + vy * (lifetime / 1000),
        alpha: 0,
        scale: 0,
        duration: lifetime,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });

      this.particles.push(p);
    }
  }

  update(delta) {
    // Clean up destroyed particles
    this.particles = this.particles.filter(p => p.active);
  }

  destroy() {
    this.particles.forEach(p => p.destroy());
    this.particles = [];
  }
}
