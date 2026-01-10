
import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { server } from './services/GameServer';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'spectating'>('menu');
  const [isDead, setIsDead] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [stats, setStats] = useState({ mass: 0 });

  const handlePlay = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setPlayerId(id);
    setIsDead(false);
    server.addPlayer(id, playerName || 'Anonym');
    setGameState('playing');
  };

  const handleSpectate = () => {
    setIsDead(false);
    setGameState('spectating');
  };

  const handleDie = (finalStats: { mass: number }) => {
    setStats(finalStats);
    setIsDead(true);
    // Ao morrer, mudamos para modo espectador visualmente, mas mantemos o overlay
    setGameState('spectating'); 
  };

  const handleExit = () => {
    if (playerId) {
      server.removePlayer(playerId);
    }
    setIsDead(false);
    setGameState('menu');
  };

  return (
    <div className="w-full h-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden">
      {gameState === 'menu' && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-[12px] border-blue-600 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-1">
              NEON <span className="text-blue-600">AGAR</span>
            </h1>
            <p className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Ultimate Edition</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Nickname"
                className="w-full px-6 py-5 text-xl border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 font-bold text-gray-700 placeholder:text-gray-300"
                value={playerName}
                maxLength={15}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Skins: Brasil, Doge...</span>
            </div>
            
            <button
              onClick={handlePlay}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-2xl py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all uppercase tracking-tighter"
            >
              Play
            </button>

            <button
              onClick={handleSpectate}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg py-4 rounded-2xl transition-all uppercase tracking-tight"
            >
              Spectate
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-50">
             <span>Space: Split</span>
             <span>•</span>
             <span>W: Eject</span>
             <span>•</span>
             <span>Esc: Menu</span>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'spectating') && (
        <div className="w-full h-full relative">
          <GameCanvas 
            playerId={isDead ? "" : playerId} 
            playerName={playerName || 'Anonym'} 
            onDie={handleDie} 
            onExit={handleExit}
            spectateMode={gameState === 'spectating' || isDead}
          />
          
          {/* Overlay de Morte (Sobre a Visão de Espectador) */}
          {isDead && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center border-t-[12px] border-red-500 animate-in fade-in slide-in-from-bottom-10 duration-500 pointer-events-auto">
                <h2 className="text-5xl font-black text-gray-900 mb-2 leading-none">WASTED</h2>
                <p className="text-gray-400 mb-8 font-black uppercase tracking-widest text-xs">Observe the game or return</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 flex flex-col items-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Final Mass</p>
                  <p className="text-6xl font-black text-blue-600 drop-shadow-sm">{Math.floor(stats.mass)}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlay}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-100 uppercase tracking-tight text-xl active:scale-95"
                  >
                    Respawn
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all uppercase tracking-tight text-sm"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'spectating' && !isDead && (
            <button 
              onClick={handleExit}
              className="absolute top-4 left-4 bg-white/90 hover:bg-white px-6 py-3 rounded-xl font-bold text-gray-800 shadow-lg transition-all active:scale-95"
            >
              Back to Menu
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
