
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { server } from '../services/GameServer';
import { LeaderboardEntry, GameState, PlayerCell } from '../types';
import { VIRUS_BORDER, VIRUS_COLOR, INITIAL_MAP_SIZE } from '../constants';
import UIOverlay from './UIOverlay';

/**
 * Propriedades do componente GameCanvas
 */
interface GameCanvasProps {
  playerId: string;                  // ID do jogador ativo
  playerName: string;                // Nome de exibição do jogador
  onDie: (stats: { mass: number }) => void; // Callback acionado na derrota do jogador
  onTogglePause: () => void;         // Callback para alternar tela de pause
  spectateMode?: boolean;            // Flag indicando se está no modo de observação
  isPaused?: boolean;                // Flag indicando se o jogo está pausado
}

/**
 * Estado visual interpolado para suavizar o movimento e mudança de tamanho das células na tela.
 */
interface VisualState {
  x: number;
  y: number;
  radius: number;
}

/**
 * Componente Principal de Renderização 2D (Canvas do Jogo).
 * Controla o loop gráfico (requestAnimationFrame), câmera com zoom dinâmico,
 * interpolação visual de movimento e captura de eventos de entrada (Mouse, Touch, Teclado).
 */
const GameCanvas: React.FC<GameCanvasProps> = ({ playerId, playerName, onDie, onTogglePause, spectateMode, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMass, setCurrentMass] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const requestRef = useRef<number>(0);
  const maxMassReached = useRef<number>(0);
  
  // Guardas de posição suavizada por ID da célula para evitar engasgos de movimento
  const visualStates = useRef<Record<string, VisualState>>({});
  
  // Estado da câmera (coordenadas do centro de visão e nível de zoom)
  const camera = useRef({ x: INITIAL_MAP_SIZE / 2, y: INITIAL_MAP_SIZE / 2, zoom: 0.5 });

  /**
   * Desenha um Vírus verde pontagudo usando rotinas geométricas do Canvas 2D.
   */
  const drawVirus = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const spikes = 22; // Quantidade de pontas do vírus
    const outerRadius = radius;
    const innerRadius = radius * 0.9;
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.closePath();
    ctx.fillStyle = VIRUS_COLOR;
    ctx.fill();
    ctx.strokeStyle = VIRUS_BORDER;
    ctx.lineWidth = radius * 0.08;
    ctx.stroke();
    ctx.shadowColor = VIRUS_COLOR;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  };

  /**
   * LOOP DE RENDERIZAÇÃO GRÁFICA (executa a ~60+ FPS via requestAnimationFrame).
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = server.getState();
    const mapW = state.mapWidth;
    const mapH = state.mapHeight;

    // Identifica células pertencentes ao jogador
    let targetCells = (playerId ? state.players[playerId] : []) || [];
    const isPlaying = !!playerId && targetCells.length > 0;

    // Verificação de Morte do Jogador
    if (playerId && targetCells.length === 0 && !spectateMode) {
        onDie({ mass: maxMassReached.current });
        return;
    }

    // Se estiver em Modo Espectador, segue a câmera do 1º colocado do Ranking
    if (spectateMode || (playerId && targetCells.length === 0)) {
      const topPlayerId = Object.keys(state.players).sort((a, b) => {
        const massA = state.players[a].reduce((sum, c) => sum + c.mass, 0);
        const massB = state.players[b].reduce((sum, c) => sum + c.mass, 0);
        return massB - massA;
      })[0];
      if (topPlayerId) targetCells = state.players[topPlayerId];
    }

    // Calcula o centro de massa médio para focar a câmera
    let avgX = 0, avgY = 0, totalMass = 0;
    if (targetCells.length > 0) {
        targetCells.forEach(c => { avgX += c.x; avgY += c.y; totalMass += c.mass; });
        avgX /= targetCells.length;
        avgY /= targetCells.length;
        if (isPlaying && totalMass > maxMassReached.current) maxMassReached.current = totalMass;
    } else {
        avgX = mapW / 2;
        avgY = mapH / 2;
    }

    // Cálculo do Zoom Dinâmico da Câmera (quanto maior a massa, mais distante a câmera)
    const targetZoom = Math.max(0.12, Math.min(1.2, 1 / Math.pow(Math.max(100, totalMass) / 100, 0.35)));
    
    // Interpolação suave do movimento da Câmera
    camera.current.x += (avgX - camera.current.x) * 0.12;
    camera.current.y += (avgY - camera.current.y) * 0.12;
    camera.current.zoom += (targetZoom - camera.current.zoom) * 0.05;

    setCurrentMass(isPlaying ? totalMass : 0);

    // Limpeza da tela e fundo
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Aplicação das transformações de Câmera (Translada centro e escala zoom)
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.current.zoom, camera.current.zoom);
    ctx.translate(-camera.current.x, -camera.current.y);

    // Renderiza a Grade de Fundo (Grid)
    ctx.beginPath(); ctx.strokeStyle = '#e2e2e2'; ctx.lineWidth = 1;
    for (let x = 0; x <= mapW; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, mapH); }
    for (let y = 0; y <= mapH; y += 50) { ctx.moveTo(0, y); ctx.lineTo(mapW, y); }
    ctx.stroke();

    // Bordas externas do Mapa
    ctx.strokeStyle = '#333'; ctx.lineWidth = 20; ctx.strokeRect(0, 0, mapW, mapH);

    // Renderiza Comidas (Pellets)
    state.pellets.forEach(p => {
      ctx.beginPath(); ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Renderiza Massas Ejetadas
    state.ejectedMasses.forEach(m => {
      ctx.beginPath(); ctx.fillStyle = m.color;
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Renderiza Células de Todos os Jogadores e Bots
    Object.values(state.players).forEach(cells => {
      cells.forEach(cell => {
        // Inicializa estado visual suave se for célula nova
        if (!visualStates.current[cell.id]) {
          visualStates.current[cell.id] = { x: cell.x, y: cell.y, radius: cell.radius };
        }
        const vs = visualStates.current[cell.id];
        // Interpolação Linear (LERP) para garantir 60 FPS fluídos no cliente
        vs.x += (cell.x - vs.x) * 0.15;
        vs.y += (cell.y - vs.y) * 0.15;
        vs.radius += (cell.radius - vs.radius) * 0.12;

        ctx.beginPath(); ctx.fillStyle = cell.color;
        ctx.arc(vs.x, vs.y, vs.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = vs.radius * 0.05; ctx.stroke();

        // Renderiza o Nickname do jogador sobre a célula
        if (vs.radius > 12) {
          ctx.fillStyle = 'white';
          ctx.font = `bold ${Math.max(10, vs.radius * 0.35)}px Ubuntu, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 2;
          ctx.fillText(cell.name, vs.x, vs.y);
          ctx.shadowBlur = 0;
        }
      });
    });

    // Renderiza Vírus Verdes
    state.viruses.forEach(v => drawVirus(ctx, v.x, v.y, v.radius));

    // Limpeza de cache de células destruídas
    const currentCellIds = new Set(Object.values(state.players).flatMap(cells => cells.map(c => c.id)));
    Object.keys(visualStates.current).forEach(id => {
      if (!currentCellIds.has(id)) delete visualStates.current[id];
    });

    // Atualiza a Tabela do Ranking (Top 10)
    const scores = Object.values(state.players).map(cells => ({
      name: cells[0]?.name || 'Unknown',
      mass: cells.reduce((acc, c) => acc + c.mass, 0)
    })).sort((a, b) => b.mass - a.mass).slice(0, 10);
    setLeaderboard(scores);

    requestRef.current = requestAnimationFrame(render);
  }, [playerId, onDie, spectateMode]);

  // Efeito para ajustar dimensões do canvas ao redimensionar a janela do navegador
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [render]);

  // Efeito para escutar interações do usuário (Mouse, Touch e Teclado)
  useEffect(() => {
    const handleInput = (clientX: number, clientY: number) => {
      if (spectateMode || !playerId || isPaused) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Converte coordenadas da tela (Pixels) para coordenadas do Mundo 2D
      const worldX = (clientX - canvas.width / 2) / camera.current.zoom + camera.current.x;
      const worldY = (clientY - canvas.height / 2) / camera.current.zoom + camera.current.y;
      server.handleInput(playerId, worldX, worldY);
    };

    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY);
    
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleInput(touch.clientX, touch.clientY);
      }
    };

    // Atalhos de teclado: ESC (Pause), Espaço (Split), Tecla W (Eject)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onTogglePause();
        return;
      }
      if (spectateMode || !playerId || isPaused) return;
      if (e.code === 'Space') server.handleSplit(playerId);
      if (e.code === 'KeyW') server.handleEject(playerId);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouch, { passive: false });
    window.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerId, spectateMode, onTogglePause, isPaused]);

  return (
    <div className="relative w-full h-full bg-[#f2f2f2] overflow-hidden">
      <canvas ref={canvasRef} />
      {spectateMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-2 rounded-full font-bold animate-pulse uppercase tracking-widest text-[10px] sm:text-xs border border-white/10 select-none">
          Modo Espectador
        </div>
      )}
      <UIOverlay 
        mass={currentMass} 
        leaderboard={leaderboard} 
        playerName={playerName} 
        gameState={server.getState()} 
        playerId={playerId}
        onTogglePause={onTogglePause}
      />
    </div>
  );
};

export default GameCanvas;

