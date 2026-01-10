
export const INITIAL_MAP_SIZE = 5000;
export const MAP_GROWTH_PER_PLAYER = 50; // Quantos pixels o mapa cresce por jogador
export const INITIAL_MASS = 20;
export const MIN_SPLIT_MASS = 35;
export const MAX_CELLS = 16;
export const VIRUS_BASE_COUNT = 45;
export const VIRUS_MAX_MASS = 180;
export const PELLET_BASE_COUNT = 2000; 
export const EJECT_MASS_COST = 18;
export const EJECT_MASS_VALUE = 13;
export const TICK_RATE = 60;

export const TARGET_BOT_COUNT = 85; 

export const COLORS = [
  '#ff1a1a', '#33ff33', '#3333ff', '#ffff1a', '#ff1aff', '#1affff', '#ff8000', '#8000ff'
];

export const SKINS: Record<string, string> = {
  'brasil': '#009739',
  'doge': '#ffcc00',
  'earth': '#2b82c9',
  'moon': '#bdc3c7',
  'cia': '#2c3e50',
  'poker': '#e74c3c'
};

export const BOT_NAMES = [
  'ProPlayer', 'Rex', 'Mestre', 'Agariano', 'Alpha', 'Ghost', 'Zumbie', 
  'Snack', 'Hunter', 'Ninja', 'Turbo', 'Shadow', 'Slayer', 'Titan', 'Void',
  'Hero', 'Zero', 'GodMode', 'AgarioMaster', 'Cell', 'Orb', 'Fast', 'Fury',
  'Rage', 'Storm', 'Blade', 'Flash', 'Dyna', 'Bolt', 'Crush', 'Mega'
];

export const VIRUS_COLOR = '#33ff33';
export const VIRUS_BORDER = '#26cc26';

export const getRadius = (mass: number) => Math.sqrt(mass * 100 / Math.PI);
export const getSpeedMultiplier = (mass: number) => Math.pow(mass, -0.40) * 35;
