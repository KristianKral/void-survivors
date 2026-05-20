import { COLORS, ENEMIES } from '../config/GameConfig.js';

export class TextureGenerator {
  static generate(scene) {
    this.createPlayerTexture(scene);
    this.createEnemyTextures(scene);
    this.createProjectileTextures(scene);
    this.createXPGemTexture(scene);
    this.createParticleTextures(scene);
    this.createBackgroundTile(scene);
    this.createOrbTexture(scene);
    this.createNovaTexture(scene);
    this.createLightningTexture(scene);
  }

  static createPlayerTexture(scene) {
    const g = scene.make.graphics({ add: false });
    // Body
    g.fillStyle(COLORS.NEON_BLUE, 1);
    g.fillCircle(16, 16, 14);
    // Inner glow
    g.fillStyle(COLORS.WHITE, 0.3);
    g.fillCircle(16, 14, 8);
    // Eyes
    g.fillStyle(COLORS.WHITE, 1);
    g.fillCircle(12, 13, 3);
    g.fillCircle(20, 13, 3);
    g.fillStyle(COLORS.VOID_BLACK, 1);
    g.fillCircle(13, 13, 1.5);
    g.fillCircle(21, 13, 1.5);
    g.generateTexture('player', 32, 32);
    g.destroy();
  }

  static createEnemyTextures(scene) {
    for (const [, data] of Object.entries(ENEMIES)) {
      const g = scene.make.graphics({ add: false });
      const s = data.size;
      const s2 = s * 2;

      if (data.isBoss) {
        // Boss: spiky circle
        g.fillStyle(data.color, 1);
        g.fillCircle(s, s, s - 2);
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(s, s - 4, s / 2);
        // Spikes
        g.lineStyle(3, data.color, 0.8);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          g.lineBetween(
            s + Math.cos(angle) * (s - 4),
            s + Math.sin(angle) * (s - 4),
            s + Math.cos(angle) * (s + 4),
            s + Math.sin(angle) * (s + 4)
          );
        }
      } else if (data.key === 'dasher') {
        // Triangle shape
        g.fillStyle(data.color, 1);
        g.fillTriangle(s, 2, 2, s2 - 2, s2 - 2, s2 - 2);
        g.fillStyle(0xffffff, 0.2);
        g.fillTriangle(s, 6, 8, s2 - 6, s2 - 8, s2 - 6);
      } else if (data.key === 'tank') {
        // Square shape
        g.fillStyle(data.color, 1);
        g.fillRect(2, 2, s2 - 4, s2 - 4);
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(6, 6, s2 - 12, s2 - 12);
      } else if (data.key === 'spitter') {
        // Diamond shape
        g.fillStyle(data.color, 1);
        g.fillTriangle(s, 2, 2, s, s, s2 - 2);
        g.fillTriangle(s, 2, s2 - 2, s, s, s2 - 2);
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(s, s, 4);
      } else {
        // Circle (crawler)
        g.fillStyle(data.color, 1);
        g.fillCircle(s, s, s - 2);
        g.fillStyle(0xffffff, 0.15);
        g.fillCircle(s, s - 2, s / 2);
      }

      // Eyes for all
      const eyeOffset = data.isBoss ? 8 : 3;
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(s - eyeOffset, s - 2, data.isBoss ? 4 : 2);
      g.fillCircle(s + eyeOffset, s - 2, data.isBoss ? 4 : 2);

      g.generateTexture(`enemy_${data.key}`, s2, s2);
      g.destroy();
    }
  }

  static createProjectileTextures(scene) {
    // Void bolt
    const g1 = scene.make.graphics({ add: false });
    g1.fillStyle(COLORS.NEON_BLUE, 1);
    g1.fillCircle(6, 6, 5);
    g1.fillStyle(COLORS.WHITE, 0.6);
    g1.fillCircle(6, 5, 2);
    g1.generateTexture('projectile_void_bolt', 12, 12);
    g1.destroy();

    // Enemy projectile
    const g2 = scene.make.graphics({ add: false });
    g2.fillStyle(COLORS.NEON_GREEN, 1);
    g2.fillCircle(5, 5, 4);
    g2.fillStyle(COLORS.WHITE, 0.4);
    g2.fillCircle(5, 4, 2);
    g2.generateTexture('projectile_enemy', 10, 10);
    g2.destroy();
  }

  static createXPGemTexture(scene) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(COLORS.XP_CYAN, 1);
    g.fillTriangle(8, 0, 0, 8, 8, 16);
    g.fillTriangle(8, 0, 16, 8, 8, 16);
    g.fillStyle(COLORS.WHITE, 0.4);
    g.fillTriangle(8, 2, 3, 8, 8, 14);
    g.generateTexture('xp_gem', 16, 16);
    g.destroy();
  }

  static createParticleTextures(scene) {
    // Generic particle
    const g1 = scene.make.graphics({ add: false });
    g1.fillStyle(0xffffff, 1);
    g1.fillCircle(4, 4, 4);
    g1.generateTexture('particle', 8, 8);
    g1.destroy();

    // Glow particle
    const g2 = scene.make.graphics({ add: false });
    g2.fillStyle(0xffffff, 0.5);
    g2.fillCircle(8, 8, 8);
    g2.fillStyle(0xffffff, 1);
    g2.fillCircle(8, 8, 4);
    g2.generateTexture('particle_glow', 16, 16);
    g2.destroy();
  }

  static createBackgroundTile(scene) {
    const g = scene.make.graphics({ add: false });
    const size = 64;
    g.fillStyle(COLORS.DARK_PURPLE, 1);
    g.fillRect(0, 0, size, size);

    // Grid lines
    g.lineStyle(1, 0x221144, 0.4);
    g.lineBetween(0, 0, size, 0);
    g.lineBetween(0, 0, 0, size);

    // Corner dot
    g.fillStyle(0x332255, 0.5);
    g.fillCircle(0, 0, 2);

    g.generateTexture('bg_tile', size, size);
    g.destroy();
  }

  static createOrbTexture(scene) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(COLORS.NEON_PINK, 1);
    g.fillCircle(10, 10, 9);
    g.fillStyle(COLORS.WHITE, 0.4);
    g.fillCircle(10, 8, 4);
    g.generateTexture('orb', 20, 20);
    g.destroy();
  }

  static createNovaTexture(scene) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(COLORS.NEON_YELLOW, 0.3);
    g.fillCircle(32, 32, 32);
    g.fillStyle(COLORS.NEON_YELLOW, 0.6);
    g.fillCircle(32, 32, 16);
    g.fillStyle(COLORS.WHITE, 0.8);
    g.fillCircle(32, 32, 6);
    g.generateTexture('nova', 64, 64);
    g.destroy();
  }

  static createLightningTexture(scene) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(COLORS.NEON_BLUE, 1);
    g.fillRect(0, 2, 12, 2);
    g.fillStyle(COLORS.WHITE, 0.7);
    g.fillRect(0, 3, 12, 1);
    g.generateTexture('lightning', 12, 6);
    g.destroy();
  }
}
