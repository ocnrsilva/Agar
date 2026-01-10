
import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { server } from './services/GameServer';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'spectating'>('menu');
  const [isDead, setIsDead] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [stats, setStats] = useState({ mass: 0 });

  const handlePlay = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setPlayerId(id);
    setIsDead(false);
    setIsPaused(false);
    server.addPlayer(id, playerName || 'Anonym');
    setGameState('playing');
  };

  const handleSpectate = () => {
    setIsDead(false);
    setIsPaused(false);
    setGameState('spectating');
  };

  const handleDie = (finalStats: { mass: number }) => {
    setStats(finalStats);
    setIsDead(true);
    setIsPaused(false);
    setGameState('spectating'); 
  };

  const togglePause = () => {
    if (gameState === 'playing' && !isDead) {
      setIsPaused(prev => !prev);
    } else if (gameState === 'spectating' || isDead) {
      handleExit();
    }
  };

  const handleExit = () => {
    if (playerId) {
      server.removePlayer(playerId);
    }
    setIsDead(false);
    setIsPaused(false);
    setGameState('menu');
  };

  return (
    <div className="w-full h-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden">
      {gameState === 'menu' && (
        <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm sm:max-w-md border-t-[12px] border-blue-600 animate-in fade-in zoom-in duration-500 mx-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter mb-1">
              NEON <span className="text-blue-600">AGAR</span>
            </h1>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">Ultimate Edition</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Nickname"
                className="w-full px-6 py-5 text-xl border-2 border-gray-100 rounded-[24px] focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 font-bold text-gray-700 placeholder:text-gray-300"
                value={playerName}
                maxLength={15}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
              />
            </div>
            
            <button
              onClick={handlePlay}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-2xl py-5 rounded-[24px] shadow-2xl shadow-blue-200 transition-all uppercase tracking-tight"
            >
              Começar
            </button>

            <button
              onClick={handleSpectate}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-lg py-4 rounded-[24px] transition-all uppercase tracking-tight active:scale-[0.98]"
            >
              Observar
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-40">
             <span>Space: Dividir</span>
             <span>•</span>
             <span>W: Atirar</span>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'spectating') && (
        <div className="w-full h-full relative">
          <GameCanvas 
            playerId={isDead ? "" : playerId} 
            playerName={playerName || 'Anonym'} 
            onDie={handleDie} 
            onTogglePause={togglePause}
            spectateMode={gameState === 'spectating' || isDead}
            isPaused={isPaused}
          />
          
          {/* Overlay de Pause (Modern App Style) */}
          {isPaused && !isDead && (
            <div className="absolute inset-0 flex items-center justify-center z-50 animate-overlay bg-black/50">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-[320px] text-center border-t-[12px] border-blue-500 animate-in zoom-in duration-300 mx-4">
                <h2 className="text-5xl font-black text-gray-900 mb-2 leading-none">PAUSADO</h2>
                <p className="text-gray-400 mb-8 font-black uppercase tracking-widest text-[10px]">O mundo continua girando</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-blue-100 uppercase tracking-tight text-xl active:scale-[0.95]"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={handleExit}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-[20px] transition-all uppercase tracking-tight text-sm active:scale-[0.95]"
                  >
                    Sair do Jogo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay de Morte */}
          {isDead && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-overlay bg-black/30">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-[320px] text-center border-t-[12px] border-red-500 animate-in slide-in-from-bottom-20 duration-500 pointer-events-auto mx-4">
                <h2 className="text-5xl font-black text-gray-900 mb-2 leading-none">DERROTA</h2>
                <p className="text-gray-400 mb-8 font-black uppercase tracking-widest text-[10px]">Você virou comida de alguém</p>
                
                <div className="bg-gray-50 rounded-[24px] p-6 mb-8 border border-gray-100 flex flex-col items-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Massa Final</p>
                  <p className="text-6xl font-black text-blue-600 drop-shadow-sm">{Math.floor(stats.mass)}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlay}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-blue-100 uppercase tracking-tight text-xl active:scale-[0.95]"
                  >
                    Renascer
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-[20px] transition-all uppercase tracking-tight text-sm"
                  >
                    Menu Principal
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'spectating' && !isDead && (
            <button 
              onClick={handleExit}
              className="absolute top-4 left-4 bg-white/90 hover:bg-white px-6 py-3 rounded-2xl font-black text-gray-800 shadow-xl transition-all active:scale-95 z-40 pointer-events-auto safe-top safe-left uppercase text-xs tracking-widest"
            >
              Sair
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
