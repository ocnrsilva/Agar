
import { 
  GameState, PlayerCell, Pellet, Virus, EjectedMass, 
  Vector, GameObject 
} from '../types';
import { 
  INITIAL_MAP_SIZE, INITIAL_MASS, COLORS, getRadius, 
  getSpeedMultiplier, MIN_SPLIT_MASS, MAX_CELLS, 
  PELLET_BASE_COUNT, VIRUS_BASE_COUNT, VIRUS_COLOR, EJECT_MASS_COST, EJECT_MASS_VALUE,
  TICK_RATE, VIRUS_MAX_MASS, SKINS, TARGET_BOT_COUNT, BOT_NAMES, MAP_GROWTH_PER_PLAYER
} from '../constants';

export class GameServer {
  private state: GameState = {
    players: {},
    pellets: [],
    viruses: [],
    ejectedMasses: [],
    mapWidth: INITIAL_MAP_SIZE,
    mapHeight: INITIAL_MAP_SIZE
  };

  private lastTick = Date.now();

  constructor() {
    this.initWorld();
    this.startLoop();
  }

  private initWorld() {
    this.updateMapSize();
    this.ensureBots();
    this.refillEntities();
  }

  private updateMapSize() {
    const playerCount = Object.keys(this.state.players).length;
    const newSize = INITIAL_MAP_SIZE + (playerCount * MAP_GROWTH_PER_PLAYER);
    this.state.mapWidth = newSize;
    this.state.mapHeight = newSize;
  }

  private refillEntities() {
    const targetPellets = Math.floor(PELLET_BASE_COUNT * (this.state.mapWidth / INITIAL_MAP_SIZE));
    const targetViruses = Math.floor(VIRUS_BASE_COUNT * (this.state.mapWidth / INITIAL_MAP_SIZE));

    while (this.state.pellets.length < targetPellets) this.spawnPellet();
    while (this.state.viruses.length < targetViruses) this.spawnVirus();
  }

  private ensureBots() {
    const currentBots = Object.keys(this.state.players).filter(id => id.startsWith('bot_')).length;
    for (let i = currentBots; i < TARGET_BOT_COUNT; i++) {
      const botId = `bot_${Math.random().toString(36).substr(2, 5)}_${Date.now()}`;
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      this.addPlayer(botId, name);
    }
  }

  private spawnPellet() {
    this.state.pellets.push({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * this.state.mapWidth,
      y: Math.random() * this.state.mapHeight,
      mass: 1,
      radius: getRadius(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  private spawnVirus(x?: number, y?: number) {
    const mass = 100;
    this.state.viruses.push({
      id: Math.random().toString(36).substr(2, 9),
      x: x ?? Math.random() * (this.state.mapWidth - 400) + 200,
      y: y ?? Math.random() * (this.state.mapHeight - 400) + 200,
      mass: mass,
      radius: getRadius(mass),
      color: VIRUS_COLOR
    });
  }

  public addPlayer(id: string, name: string) {
    const lowerName = name.toLowerCase();
    const color = SKINS[lowerName] || COLORS[Math.floor(Math.random() * COLORS.length)];
    const margin = 200;
    const x = Math.random() * (this.state.mapWidth - margin * 2) + margin;
    const y = Math.random() * (this.state.mapHeight - margin * 2) + margin;
    
    this.state.players[id] = [{
      id: Math.random().toString(36).substr(2, 9),
      playerId: id,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      targetX: x,
      targetY: y,
      mass: INITIAL_MASS,
      radius: getRadius(INITIAL_MASS),
      color,
      lastSplitTime: Date.now()
    }];
    this.updateMapSize();
  }

  public removePlayer(id: string) {
    delete this.state.players[id];
    this.updateMapSize();
  }

  public handleInput(playerId: string, targetX: number, targetY: number) {
    const cells = this.state.players[playerId];
    if (!cells) return;
    cells.forEach(cell => {
      cell.targetX = targetX;
      cell.targetY = targetY;
    });
  }

  public handleSplit(playerId: string) {
    const cells = this.state.players[playerId];
    if (!cells || cells.length >= MAX_CELLS) return;

    const newCells: PlayerCell[] = [];
    const now = Date.now();
    
    cells.forEach(cell => {
      if (cell.mass >= MIN_SPLIT_MASS && cells.length + newCells.length < MAX_CELLS) {
        const halfMass = cell.mass / 2;
        cell.mass = halfMass;
        cell.radius = getRadius(halfMass);

        const dx = cell.targetX - cell.x;
        const dy = cell.targetY - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        const newCell: PlayerCell = {
          ...cell,
          id: Math.random().toString(36).substr(2, 9),
          mass: halfMass,
          radius: getRadius(halfMass),
          vx: ux * 75, 
          vy: uy * 75,
          lastSplitTime: now
        };
        newCell.x += ux * cell.radius;
        newCell.y += uy * cell.radius;
        
        cell.lastSplitTime = now;
        newCells.push(newCell);
      }
    });
    this.state.players[playerId] = [...cells, ...newCells];
  }

  public handleEject(playerId: string) {
    const cells = this.state.players[playerId];
    if (!cells) return;

    cells.forEach(cell => {
      if (cell.mass > EJECT_MASS_COST + 15) {
        cell.mass -= EJECT_MASS_COST;
        cell.radius = getRadius(cell.mass);

        const dx = cell.targetX - cell.x;
        const dy = cell.targetY - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        this.state.ejectedMasses.push({
          id: Math.random().toString(36).substr(2, 9),
          playerId,
          x: cell.x + ux * (cell.radius + 15),
          y: cell.y + uy * (cell.radius + 15),
          vx: ux * 30,
          vy: uy * 30,
          mass: EJECT_MASS_VALUE,
          radius: getRadius(EJECT_MASS_VALUE),
          color: cell.color
        });
      }
    });
  }

  private startLoop() {
    setInterval(() => {
      const now = Date.now();
      const dt = (now - this.lastTick) / 1000;
      this.lastTick = now;
      this.update(dt);
    }, 1000 / TICK_RATE);
  }

  private update(dt: number) {
    const now = Date.now();
    this.ensureBots();
    this.refillEntities();

    Object.keys(this.state.players).forEach(pId => {
      const cells = this.state.players[pId];
      if (!cells || cells.length === 0) {
        delete this.state.players[pId];
        return;
      }

      if (pId.startsWith('bot_')) {
        this.runBotAI(pId, cells);
      }

      cells.forEach(cell => {
        cell.vx *= 0.93;
        cell.vy *= 0.93;

        const dx = cell.targetX - cell.x;
        const dy = cell.targetY - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const speed = getSpeedMultiplier(cell.mass);
        if (dist > 1) {
          const ux = dx / dist;
          const uy = dy / dist;
          cell.x += (ux * speed + cell.vx);
          cell.y += (uy * speed + cell.vy);
        } else {
          cell.x += cell.vx;
          cell.y += cell.vy;
        }

        cell.x = Math.max(cell.radius, Math.min(this.state.mapWidth - cell.radius, cell.x));
        cell.y = Math.max(cell.radius, Math.min(this.state.mapHeight - cell.radius, cell.y));

        cell.mass *= (1 - 0.00012 * dt);
        cell.radius = getRadius(cell.mass);
      });

      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const c1 = cells[i], c2 = cells[j];
          const dx = c2.x - c1.x, dy = c2.y - c1.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = c1.radius + c2.radius;
          
          const cooldown1 = 14000 + (c1.mass * 20);
          const cooldown2 = 14000 + (c2.mass * 20);
          const canMerge = now - c1.lastSplitTime > cooldown1 && now - c2.lastSplitTime > cooldown2;

          if (canMerge) {
            if (d < Math.max(c1.radius, c2.radius) * 0.9) {
              c1.mass += c2.mass;
              c1.radius = getRadius(c1.mass);
              c1.lastSplitTime = Math.max(c1.lastSplitTime, c2.lastSplitTime);
              cells.splice(j, 1);
              j--;
            }
          } else if (d < minDist) {
            const overlap = (minDist - d) * 0.07;
            const ux = dx / d, uy = dy / d;
            c1.x -= ux * overlap;
            c1.y -= uy * overlap;
            c2.x += ux * overlap;
            c2.y += uy * overlap;
          }
        }
      }
    });

    this.state.ejectedMasses = this.state.ejectedMasses.filter(m => {
      m.vx *= 0.96; m.vy *= 0.96;
      m.x += m.vx; m.y += m.vy;
      for (let v of this.state.viruses) {
        const d = Math.hypot(m.x - v.x, m.y - v.y);
        if (d < v.radius) {
          v.mass += m.mass; v.radius = getRadius(v.mass);
          if (v.mass > VIRUS_MAX_MASS) {
            v.mass = 100; v.radius = getRadius(v.mass);
            this.spawnVirus(v.x + m.vx * 15, v.y + m.vy * 15);
          }
          return false;
        }
      }
      return Math.abs(m.vx) > 0.1 && m.x > 0 && m.x < this.state.mapWidth && m.y > 0 && m.y < this.state.mapHeight;
    });

    Object.values(this.state.players).forEach(cells => {
      cells.forEach(cell => {
        this.state.pellets = this.state.pellets.filter(p => {
          if (Math.abs(cell.x - p.x) < cell.radius && Math.abs(cell.y - p.y) < cell.radius) {
            if (Math.hypot(cell.x - p.x, cell.y - p.y) < cell.radius) {
              cell.mass += p.mass; cell.radius = getRadius(cell.mass);
              return false;
            }
          }
          return true;
        });

        this.state.viruses = this.state.viruses.filter(v => {
          const dist = Math.hypot(cell.x - v.x, cell.y - v.y);
          // Detecção de colisão aprimorada: se a célula encostar na borda do vírus
          if (dist < cell.radius) {
            if (cell.mass > v.mass * 1.15) {
              // Regra de estouro
              if (cells.length < MAX_CELLS) {
                this.explodeCell(cell.playerId, cell);
                return false; // Remove vírus
              } else {
                // Se já estiver dividido ao máximo, apenas come o vírus
                cell.mass += v.mass / 2;
                cell.radius = getRadius(cell.mass);
                return false; // Remove vírus
              }
            }
          }
          return true;
        });
      });
    });

    const ids = Object.keys(this.state.players);
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;
        const p1 = this.state.players[ids[i]], p2 = this.state.players[ids[j]];
        if (!p1 || !p2) continue;
        for (let a = 0; a < p1.length; a++) {
          for (let b = 0; b < p2.length; b++) {
            const c1 = p1[a], c2 = p2[b];
            const d = Math.hypot(c1.x - c2.x, c1.y - c2.y);
            if (d < c1.radius * 0.8 && c1.mass > c2.mass * 1.2) {
              c1.mass += c2.mass; c1.radius = getRadius(c1.mass);
              p2.splice(b, 1); b--;
              if (p2.length === 0) delete this.state.players[ids[j]];
            }
          }
        }
      }
    }
  }

  private runBotAI(botId: string, cells: PlayerCell[]) {
    if (cells.length === 0) return;
    const head = cells[0];
    let forceX = 0;
    let forceY = 0;

    Object.entries(this.state.players).forEach(([otherId, otherCells]) => {
      if (otherId === botId) return;
      otherCells.forEach(enemy => {
        const d = Math.hypot(enemy.x - head.x, enemy.y - head.y);
        if (enemy.mass > head.mass * 1.1 && d < head.radius + enemy.radius + 400) {
          const weight = 3000 / (d || 1);
          forceX -= (enemy.x - head.x) * weight;
          forceY -= (enemy.y - head.y) * weight;
        }
      });
    });

    let target = { x: head.x, y: head.y, weight: 0 };
    Object.entries(this.state.players).forEach(([otherId, otherCells]) => {
      if (otherId === botId) return;
      otherCells.forEach(prey => {
        const d = Math.hypot(prey.x - head.x, prey.y - head.y);
        if (head.mass > prey.mass * 1.2 && d < 1500) {
          const weight = 1000 / (d || 1);
          if (weight > target.weight) target = { x: prey.x, y: prey.y, weight };
        }
      });
    });

    if (target.weight < 0.2) {
      this.state.pellets.slice(0, 10).forEach(p => {
        const d = Math.hypot(p.x - head.x, p.y - head.y);
        const weight = 100 / (d || 1);
        if (weight > target.weight) target = { x: p.x, y: p.y, weight };
      });
    }

    if (target.weight > 0) {
      forceX += (target.x - head.x) * target.weight;
      forceY += (target.y - head.y) * target.weight;
    }

    const wallRepulsion = 800;
    if (head.x < 300) forceX += wallRepulsion;
    if (head.x > this.state.mapWidth - 300) forceX -= wallRepulsion;
    if (head.y < 300) forceY += wallRepulsion;
    if (head.y > this.state.mapHeight - 300) forceY -= wallRepulsion;

    this.handleInput(botId, head.x + forceX, head.y + forceY);
  }

  private explodeCell(playerId: string, cell: PlayerCell) {
    const cells = this.state.players[playerId];
    if (!cells) return;
    const pieces = Math.min(MAX_CELLS - cells.length + 1, 8);
    const newMass = cell.mass / pieces;
    cell.mass = newMass; cell.radius = getRadius(newMass);
    const now = Date.now();
    for (let i = 0; i < pieces - 1; i++) {
      const ang = Math.random() * Math.PI * 2;
      cells.push({
        ...cell, id: Math.random().toString(36).substr(2, 9),
        mass: newMass, radius: getRadius(newMass),
        vx: Math.cos(ang) * 50, vy: Math.sin(ang) * 50, lastSplitTime: now
      });
    }
  }

  public getState() { return this.state; }
}

export const server = new GameServer();
