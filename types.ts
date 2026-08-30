
/**
 * Interface para vetores e posições bidimensionais (X, Y).
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Interface base para qualquer elemento ou objeto presente no mapa do jogo.
 */
export interface GameObject {
  id: string;      // Identificador único do objeto
  x: number;       // Posição no eixo X no mapa
  y: number;       // Posição no eixo Y no mapa
  mass: number;    // Massa/Tamanho do objeto
  radius: number;  // Raio derivado da massa para renderização e colisões
  color: string;   // Cor hexadecimal ou de preenchimento do objeto
}

/**
 * Interface que representa uma célula individual pertencente a um jogador ou bot.
 * Um único jogador pode controlar múltiplas células após se dividir (Split).
 */
export interface PlayerCell extends GameObject {
  playerId: string;       // ID do jogador dono da célula
  name: string;           // Nickname do jogador para exibição na tela
  vx: number;             // Velocidade atual no eixo X (usada na aceleração do Split/Impulso)
  vy: number;             // Velocidade atual no eixo Y
  targetX: number;        // Posição X do cursor/alvo para onde a célula se move
  targetY: number;        // Posição Y do cursor/alvo
  lastSplitTime: number;  // Timestamp da última divisão (usado para calcular cooldown de fusão)
}

/**
 * Interface para bolinhas de comida simples (Pellets) espalhadas pelo mapa.
 */
export interface Pellet extends GameObject {}

/**
 * Interface para Vírus verdes (obstáculos estáticos/dinâmicos que dividem células grandes).
 */
export interface Virus extends GameObject {}

/**
 * Interface para massas ejetadas pelos jogadores (tecla W ou botão de eject).
 */
export interface EjectedMass extends GameObject {
  vx: number;        // Vetor de velocidade no eixo X após ser ejetado
  vy: number;        // Vetor de velocidade no eixo Y após ser ejetado
  playerId: string;  // ID do jogador que ejetou a massa
}

/**
 * Interface do Estado Global do Jogo mantido pelo GameServer.
 */
export interface GameState {
  players: Record<string, PlayerCell[]>;  // Dicionário mapeando ID do jogador para suas células
  pellets: Pellet[];                      // Lista de comidas no mapa
  viruses: Virus[];                       // Lista de vírus no mapa
  ejectedMasses: EjectedMass[];           // Lista de massas ejetadas em movimento
  mapWidth: number;                       // Largura atual do mapa (dinâmica)
  mapHeight: number;                      // Altura atual do mapa (dinâmica)
}

/**
 * Entrada individual para a tabela de classificação (Leaderboard).
 */
export interface LeaderboardEntry {
  name: string;  // Nome do jogador
  mass: number;  // Soma da massa total de todas as suas células
}
