import { SaveManager } from './SaveManager.js';

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.settings = SaveManager.loadSettings();
    this.sounds = {};
    this.currentMusic = null;
  }

  playSound(key, config = {}) {
    const vol = this.settings.sfxVolume * (config.volume || 1);
    if (vol <= 0) return;
    if (this.scene.sound && this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { ...config, volume: vol });
    }
  }

  playMusic(key, config = {}) {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
    }
    if (this.scene.cache.audio.exists(key)) {
      this.currentMusic = this.scene.sound.add(key, {
        loop: true,
        volume: this.settings.musicVolume * (config.volume || 1),
        ...config
      });
      this.currentMusic.play();
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
  }

  updateVolumes(settings) {
    this.settings = settings;
    if (this.currentMusic) {
      this.currentMusic.setVolume(settings.musicVolume);
    }
  }

  destroy() {
    this.stopMusic();
  }
}
