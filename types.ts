
export interface Vector {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  mass: number;
  radius: number;
  color: string;
}

export interface PlayerCell extends GameObject {
  playerId: string;
  name: string;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  lastSplitTime: number;
}

export interface Pellet extends GameObject {}

export interface Virus extends GameObject {}

export interface EjectedMass extends GameObject {
  vx: number;
  vy: number;
  playerId: string;
}

export interface GameState {
  players: Record<string, PlayerCell[]>;
  pellets: Pellet[];
  viruses: Virus[];
  ejectedMasses: EjectedMass[];
  mapWidth: number;
  mapHeight: number;
}

export interface LeaderboardEntry {
  name: string;
  mass: number;
}
