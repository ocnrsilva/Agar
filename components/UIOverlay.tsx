
import React from 'react';
import { LeaderboardEntry, GameState } from '../types';

interface UIOverlayProps {
  mass: number;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  gameState: GameState;
  playerId: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ mass, leaderboard, playerName, gameState, playerId }) => {
  const myCells = gameState.players[playerId] || [];
  const mapW = gameState.mapWidth;
  const mapH = gameState.mapHeight;

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-white font-sans overflow-hidden">
      {/* Leaderboard */}
      <div className="absolute top-4 right-4 w-52 bg-black/40 p-4 rounded-lg backdrop-blur-sm border border-white/10 shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-center border-b border-white/20 pb-2">Leaderboard</h2>
        <ol className="space-y-1 text-sm font-medium">
          {leaderboard.map((entry, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span className={`truncate max-w-[120px] ${entry.name === playerName ? 'text-yellow-400 font-bold drop-shadow-md' : ''}`}>
                {idx + 1}. {entry.name || 'Anonym'}
              </span>
              <span className="opacity-80">{Math.floor(entry.mass)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Minimap Adaptativo */}
      <div className="absolute bottom-4 right-4 w-40 h-40 bg-black/30 rounded-md border border-white/20 overflow-hidden backdrop-blur-xs">
         {myCells.map(c => (
           <div 
             key={c.id}
             className="absolute w-1.5 h-1.5 bg-white rounded-full border border-black/50"
             style={{ 
               left: `${(c.x / mapW) * 100}%`, 
               top: `${(c.y / mapH) * 100}%`,
               transform: 'translate(-50%, -50%)'
             }}
           />
         ))}
         <div className="absolute inset-0 border-[0.5px] border-white/5 pointer-events-none" />
      </div>

      {/* Score */}
      <div className="absolute bottom-4 left-4 bg-black/40 px-5 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
        <p className="text-xs font-bold text-white/50 uppercase tracking-tighter">Current Mass</p>
        <span className="text-3xl font-black">{Math.floor(mass)}</span>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/5">Space: Split</span>
        <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/5">W: Eject</span>
      </div>
    </div>
  );
};

export default UIOverlay;
