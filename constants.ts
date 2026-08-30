
/**
 * CONFIGURAÇÕES GERAIS E CONSTANTES DE BALANCEAMENTO DO JOGO
 * Altere estes valores para ajustar tamanho do mapa, velocidade, taxas de spawn e mecânicas de jogo.
 */

// Tamanho inicial da área do mapa em pixels (largura x altura)
export const INITIAL_MAP_SIZE = 5000;

// Quantos pixels o mapa expande proporcionalmente por cada jogador conectado
export const MAP_GROWTH_PER_PLAYER = 50;

// Massa inicial de uma célula ao renascer ou entrar no jogo
export const INITIAL_MASS = 20;

// Massa mínima necessária que uma célula precisa ter para conseguir se dividir (Split com Espaço)
export const MIN_SPLIT_MASS = 35;

// Número máximo de células que um único jogador pode ter simultaneamente
export const MAX_CELLS = 16;

// Quantidade base de vírus gerados no mapa
export const VIRUS_BASE_COUNT = 45;

// Massa máxima que um vírus pode acumular ao absorver comida ejetada antes de se duplicar
export const VIRUS_MAX_MASS = 180;

// Quantidade base de comidas (Pellets) espalhadas pelo mapa
export const PELLET_BASE_COUNT = 2000; 

// Custo de massa retirado da célula do jogador ao ejetar massa (tecla W)
export const EJECT_MASS_COST = 18;

// Quantidade real de massa que a bolinha ejetada ganha quando se materializa
export const EJECT_MASS_VALUE = 13;

// Taxa de atualização do servidor por segundo (Ticks por segundo / FPS do servidor)
export const TICK_RATE = 60;

// Quantidade total desejada de bots/IA jogando simultaneamente na partida
export const TARGET_BOT_COUNT = 85; 

// Paleta de cores aleatórias para células de jogadores comuns e bots
export const COLORS = [
  '#ff1a1a', '#33ff33', '#3333ff', '#ffff1a', '#ff1aff', '#1affff', '#ff8000', '#8000ff'
];

// Mapeamento de Skins por palavras-chave no Nickname (ex: digitar "brasil" aplica a cor verde)
export const SKINS: Record<string, string> = {
  'brasil': '#009739',
  'doge': '#ffcc00',
  'earth': '#2b82c9',
  'moon': '#bdc3c7',
  'cia': '#2c3e50',
  'poker': '#e74c3c'
};

// Lista de nomes aleatórios atribuídos aos Bots controlados pela Inteligência Artificial
export const BOT_NAMES = [
  'ProPlayer', 'Rex', 'Mestre', 'Agariano', 'Alpha', 'Ghost', 'Zumbie', 
  'Snack', 'Hunter', 'Ninja', 'Turbo', 'Shadow', 'Slayer', 'Titan', 'Void',
  'Hero', 'Zero', 'GodMode', 'AgarioMaster', 'Cell', 'Orb', 'Fast', 'Fury',
  'Rage', 'Storm', 'Blade', 'Flash', 'Dyna', 'Bolt', 'Crush', 'Mega'
];

// Estilo visual dos Vírus
export const VIRUS_COLOR = '#33ff33';
export const VIRUS_BORDER = '#26cc26';

/**
 * Calcula o raio visual e físico de uma célula com base em sua massa atual.
 * Fórmula baseada na área do círculo: Área = PI * r² => r = sqrt(Massa * Escala / PI)
 */
export const getRadius = (mass: number) => Math.sqrt(mass * 100 / Math.PI);

/**
 * Calcula a velocidade de movimento da célula com base na sua massa.
 * Células menores são significativamente mais rápidas que células gigantes.
 */
export const getSpeedMultiplier = (mass: number) => Math.pow(mass, -0.40) * 35;

