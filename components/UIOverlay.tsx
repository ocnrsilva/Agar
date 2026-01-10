
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, GameState } from '../types';
import { server } from '../services/GameServer';

interface UIOverlayProps {
  mass: number;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  gameState: GameState;
  playerId: string;
  onTogglePause: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ mass, leaderboard, playerName, gameState, playerId, onTogglePause }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const myCells = gameState.players[playerId] || [];
  const mapW = gameState.mapWidth;
  const mapH = gameState.mapHeight;

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-white font-sans overflow-hidden safe-top safe-left safe-right safe-bottom">
      {/* Botão de Pause (Alternativa ESC para Mobile) */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onTogglePause(); }}
          className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg group"
        >
          {isTouchDevice ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <span className="text-[10px] font-black opacity-60 group-hover:opacity-100">ESC</span>
          )}
        </button>
      </div>

      {/* Leaderboard - Responsivo */}
      <div className="absolute top-4 right-4 w-36 sm:w-52 bg-black/40 p-3 sm:p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
        <h2 className="text-xs sm:text-lg font-black mb-1 sm:mb-2 text-center border-b border-white/20 pb-1 uppercase tracking-tighter">Ranking</h2>
        <ol className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-sm font-bold">
          {leaderboard.map((entry, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span className={`truncate max-w-[70px] sm:max-w-[120px] ${entry.name === playerName ? 'text-yellow-400 drop-shadow-sm' : 'opacity-90'}`}>
                {idx + 1}. {entry.name || 'Anonym'}
              </span>
              <span className="opacity-60 tabular-nums">{Math.floor(entry.mass)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Minimap - Escondido em telas muito pequenas */}
      <div className="hidden md:block absolute bottom-6 right-6 w-40 h-40 bg-black/30 rounded-xl border border-white/10 overflow-hidden backdrop-blur-xs shadow-inner">
         {myCells.map(c => (
           <div 
             key={c.id}
             className="absolute w-1.5 h-1.5 bg-white rounded-full border border-black/50 shadow-sm"
             style={{ 
               left: `${(c.x / mapW) * 100}%`, 
               top: `${(c.y / mapH) * 100}%`,
               transform: 'translate(-50%, -50%)'
             }}
           />
         ))}
      </div>

      {/* Score / Massa Atual */}
      <div className="absolute bottom-6 left-6 bg-black/40 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Massa</p>
        <span className="text-2xl sm:text-4xl font-black tracking-tighter leading-none">{Math.floor(mass)}</span>
      </div>

      {/* Controles Mobile (Split e Eject) */}
      {isTouchDevice && (
        <div className="absolute bottom-10 right-6 flex flex-col gap-6 pointer-events-auto">
          <button 
            onTouchStart={(e) => { e.preventDefault(); server.handleSplit(playerId); }}
            className="w-20 h-20 bg-blue-600/90 backdrop-blur-lg rounded-full border-4 border-white/40 flex items-center justify-center shadow-2xl active:scale-95 active:bg-blue-500 transition-all"
          >
            <span className="font-black text-xs uppercase tracking-widest text-white shadow-sm">Split</span>
          </button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); server.handleEject(playerId); }}
            className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full border-4 border-white/40 flex items-center justify-center shadow-2xl active:scale-95 active:bg-white/40 transition-all"
          >
            <span className="font-black text-xs uppercase tracking-widest text-white shadow-sm">W</span>
          </button>
        </div>
      )}

      {/* Info de Atalhos para Desktop */}
      {!isTouchDevice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
          <span className="bg-black/40 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">SPACE: SPLIT</span>
          <span className="bg-black/40 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">W: EJECT</span>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
