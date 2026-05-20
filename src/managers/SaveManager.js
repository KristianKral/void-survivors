const SAVE_KEY = 'void_survivors_save';
const SETTINGS_KEY = 'void_survivors_settings';

export class SaveManager {
  static getDefaultSettings() {
    return {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      fullscreen: false,
      screenShake: true
    };
  }

  static saveHighScore(score, time, level, kills) {
    const data = this.loadData();
    const entry = { score, time, level, kills, date: Date.now() };
    data.highScores.push(entry);
    data.highScores.sort((a, b) => b.score - a.score);
    data.highScores = data.highScores.slice(0, 10);
    data.totalRuns = (data.totalRuns || 0) + 1;
    data.totalKills = (data.totalKills || 0) + kills;
    if (time > (data.bestTime || 0)) data.bestTime = time;
    this.saveData(data);
    return data;
  }

  static loadData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return { highScores: [], totalRuns: 0, totalKills: 0, bestTime: 0 };
  }

  static saveData(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }

  static loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...this.getDefaultSettings(), ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return this.getDefaultSettings();
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  static clearAll() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
}
