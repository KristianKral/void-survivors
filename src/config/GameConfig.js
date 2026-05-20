export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD = {
  WIDTH: 3200,
  HEIGHT: 3200,
  TILE_SIZE: 64
};

export const COLORS = {
  VOID_BLACK: 0x0a0a0f,
  DARK_PURPLE: 0x1a0a2e,
  NEON_BLUE: 0x00d4ff,
  NEON_PINK: 0xff0080,
  NEON_GREEN: 0x00ff88,
  NEON_YELLOW: 0xffee00,
  HEALTH_RED: 0xff3344,
  HEALTH_GREEN: 0x44ff66,
  XP_CYAN: 0x00ffcc,
  UI_BG: 0x111122,
  UI_BORDER: 0x334466,
  WHITE: 0xffffff,
  GOLD: 0xffaa00
};

export const PLAYER = {
  BASE_SPEED: 200,
  BASE_HP: 100,
  BASE_PICKUP_RANGE: 80,
  INVINCIBILITY_MS: 500,
  XP_PER_LEVEL: [10, 15, 25, 40, 60, 85, 115, 150, 200, 260]
};

export const WEAPONS = {
  VOID_BOLT: {
    key: 'void_bolt',
    name: 'Void Bolt',
    description: 'Auto-fires a bolt at the nearest enemy',
    damage: 10,
    cooldown: 800,
    speed: 400,
    range: 300,
    pierce: 1,
    projectileCount: 1
  },
  ORBITAL: {
    key: 'orbital',
    name: 'Void Orb',
    description: 'Orbs rotate around you dealing contact damage',
    damage: 15,
    cooldown: 0,
    speed: 0,
    range: 100,
    orbCount: 2,
    orbSpeed: 2
  },
  NOVA: {
    key: 'nova',
    name: 'Nova Pulse',
    description: 'Periodically explodes around you',
    damage: 25,
    cooldown: 3000,
    radius: 150
  },
  CHAIN_LIGHTNING: {
    key: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Bolts that chain between enemies',
    damage: 8,
    cooldown: 1200,
    speed: 600,
    range: 250,
    chains: 3
  }
};

export const ENEMIES = {
  CRAWLER: {
    key: 'crawler',
    name: 'Crawler',
    hp: 20,
    speed: 80,
    damage: 10,
    xp: 3,
    size: 16,
    color: 0xff4444
  },
  DASHER: {
    key: 'dasher',
    name: 'Dasher',
    hp: 12,
    speed: 160,
    damage: 8,
    xp: 4,
    size: 12,
    color: 0xff8800
  },
  TANK: {
    key: 'tank',
    name: 'Tank',
    hp: 80,
    speed: 40,
    damage: 20,
    xp: 8,
    size: 24,
    color: 0x8844ff
  },
  SPITTER: {
    key: 'spitter',
    name: 'Spitter',
    hp: 15,
    speed: 60,
    damage: 12,
    xp: 5,
    size: 14,
    color: 0x44ff44
  },
  BOSS_VOID_KING: {
    key: 'boss_void_king',
    name: 'Void King',
    hp: 500,
    speed: 50,
    damage: 30,
    xp: 50,
    size: 40,
    color: 0xff00ff,
    isBoss: true
  }
};

export const UPGRADES = [
  { key: 'max_hp', name: 'Vitality', description: '+20 Max HP', stat: 'maxHp', value: 20, icon: '❤️' },
  { key: 'speed', name: 'Swift Boots', description: '+15% Move Speed', stat: 'speed', value: 0.15, icon: '👟' },
  { key: 'damage', name: 'Power Shard', description: '+15% Damage', stat: 'damage', value: 0.15, icon: '⚔️' },
  { key: 'cooldown', name: 'Chrono Lens', description: '-10% Cooldowns', stat: 'cooldown', value: 0.10, icon: '⏱️' },
  { key: 'pickup_range', name: 'Magnet', description: '+30 Pickup Range', stat: 'pickupRange', value: 30, icon: '🧲' },
  { key: 'armor', name: 'Void Shield', description: '+5 Armor', stat: 'armor', value: 5, icon: '🛡️' },
  { key: 'regen', name: 'Regeneration', description: '+1 HP/sec', stat: 'regen', value: 1, icon: '💚' }
];

export const SPAWN = {
  BASE_INTERVAL: 2000,
  MIN_INTERVAL: 400,
  INTERVAL_DECREASE_PER_MIN: 150,
  BASE_COUNT: 2,
  COUNT_INCREASE_PER_MIN: 1,
  SPAWN_DISTANCE: 600,
  BOSS_INTERVAL_SEC: 120
};
