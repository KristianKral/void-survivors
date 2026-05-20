# Void Survivors

A top-down roguelite survivor browser game built with **Phaser 3** and **Vite**.

Survive endless waves of void creatures. Auto-attack enemies, collect XP gems, level up with random ability choices, and see how long you can last.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

The production build outputs to `dist/`.

## Controls

| Key | Action |
|---|---|
| WASD / Arrow Keys | Move |
| ESC | Pause |
| F | Toggle fullscreen |
| 1 / 2 / 3 | Select upgrade on level-up |

## Tech Stack

- **Phaser 3** — game framework (Canvas/WebGL)
- **Vite** — dev server & bundler
- **JavaScript ES6 modules** — clean modular architecture
- **LocalStorage** — save system (high scores & settings)

## Architecture

```
src/
  config/       — game constants, balance values
  entities/     — Player class
  systems/      — EnemyManager, WeaponSystem, XPSystem, ParticleManager
  managers/     — AudioManager, SaveManager
  scenes/       — Boot, Preload, Menu, Game, GameUI, Pause, GameOver, LevelUp, Settings
  utils/        — MathUtils, ObjectPool, TextureGenerator
  main.js       — Phaser game config & entry point
```

## Game Systems

- **Weapons**: Void Bolt (auto-aim projectile), Void Orb (orbital), Nova Pulse (AoE), Chain Lightning
- **Enemies**: Crawler, Dasher, Spitter, Tank, Void King (boss)
- **Upgrades**: Vitality, Speed, Damage, Cooldown, Magnet, Armor, Regen + new weapons
- **Difficulty scaling**: enemy count, speed, and HP increase over time; bosses every 2 minutes

## Expanding the Game

- Add new weapons in `src/config/GameConfig.js` → `WEAPONS` and implement in `WeaponSystem.js`
- Add new enemies in `GameConfig.js` → `ENEMIES` and add AI in `EnemyManager.js`
- Add new upgrades in `Player.js` → `getRandomUpgrades()`
- Swap procedural textures for real sprites in `TextureGenerator.js`
- Add audio files to `assets/audio/` and `assets/music/`, load in `PreloadScene`

## License

ISC
