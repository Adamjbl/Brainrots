
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character, GameState } from './types';
import { CHARACTERS } from './constants';
import CharacterCard from './components/CharacterCard';
import ModelView from './components/ModelView';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'PICKING',
    targetCharacter: null,
    eliminatedIds: [],
    attempts: 0,
    hints: ["VITE, CHOISIS TON BRAINROT 🧠"],
    isGameOver: false,
    score: 100,
  });

  const [showModelView, setShowModelView] = useState(false);
  const secretClicksRef = useRef({ count: 0, timerId: null as NodeJS.Timeout | null });
  const [keySequence, setKeySequence] = useState<string[]>([]);

  // Secret keyboard shortcut: Press 'B' 'R' 'O' to open model view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeySequence(prev => {
        const newSeq = [...prev, key].slice(-3);
        if (newSeq.join('') === 'bro') {
          setShowModelView(true);
          return [];
        }
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret click on title: 5 rapid clicks
  const handleSecretClick = useCallback(() => {
    // Clear any existing timer
    if (secretClicksRef.current.timerId) {
      clearTimeout(secretClicksRef.current.timerId);
    }

    secretClicksRef.current.count += 1;

    if (secretClicksRef.current.count >= 5) {
      setShowModelView(true);
      secretClicksRef.current.count = 0;
      secretClicksRef.current.timerId = null;
    } else {
      // Reset after 2 seconds of no clicks
      secretClicksRef.current.timerId = setTimeout(() => {
        secretClicksRef.current.count = 0;
        secretClicksRef.current.timerId = null;
      }, 2000);
    }
  }, []);

  const startPicking = () => {
    setGameState({
      phase: 'PICKING',
      targetCharacter: null,
      eliminatedIds: [],
      attempts: 0,
      hints: ["VITE, CHOISIS TON BRAINROT 🧠"],
      score: 100,
    });
  };

  const handleSelectTarget = (character: Character) => {
    setGameState(prev => ({
      ...prev,
      targetCharacter: character,
      phase: 'TRANSITION'
    }));
  };

  const startGuessing = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'GUESSING',
      hints: ["L'AUTRE A CHOISI SON BRAINROT. TROUVE OU T'ES RATIO. 💀"]
    }));
  };

  const handleToggleEliminate = (id: string) => {
    if (gameState.phase !== 'GUESSING') return;
    setGameState(prev => ({
      ...prev,
      eliminatedIds: prev.eliminatedIds.includes(id) 
        ? prev.eliminatedIds.filter(eid => eid !== id)
        : [...prev.eliminatedIds, id]
    }));
  };

  const handleGuess = (character: Character) => {
    if (gameState.phase !== 'GUESSING') return;

    if (character.id === gameState.targetCharacter?.id) {
      setGameState(prev => ({ ...prev, phase: 'GAMEOVER' }));
    } else {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        score: Math.max(0, prev.score - 20),
        eliminatedIds: [...prev.eliminatedIds, character.id]
      }));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col items-center select-none">
      <div className="fixed top-0 left-0 w-full h-2 status-bar z-50"></div>

      {/* MODEL VIEW (HIDDEN) */}
      {showModelView && (
        <ModelView
          characters={CHARACTERS}
          onClose={() => setShowModelView(false)}
        />
      )}

      {/* HEADER DYNAMIQUE */}
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1
          className="text-5xl md:text-8xl font-impact tracking-tighter italic scale-y-110 cursor-pointer select-none"
          onClick={handleSecretClick}
        >
          <span className="text-[#ff6b6b]">BRAINROT</span>
          <span className="text-white">_GUESS_</span>
          <span className="text-[#4ecdc4]">WHO</span>
        </h1>
        
        {gameState.phase === 'PICKING' && (
          <div className="bg-[#ff6b6b] text-black font-black px-6 py-2 mt-4 inline-block -rotate-1 text-xl shadow-[5px_5px_0_#fff]">
            JOUEUR 1 : CHOISIS TON BRAINROT EN SECRET 🧠
          </div>
        )}
        {gameState.phase === 'GUESSING' && (
          <div className="bg-[#4ecdc4] text-black font-black px-6 py-2 mt-4 inline-block rotate-1 text-xl shadow-[5px_5px_0_#000]">
            JOUEUR 2 : TROUVE LE BRAINROT x{gameState.attempts} 💀
          </div>
        )}
      </header>

      {/* PHASE 1: PICKING */}
      {gameState.phase === 'PICKING' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-7xl">
          {CHARACTERS.map(char => (
            <div key={char.id} onClick={() => handleSelectTarget(char)} className="cursor-pointer hover:scale-105 transition-transform">
              <CharacterCard
                character={char}
                isEliminated={false}
                onToggleEliminate={() => {}}
                onGuess={() => handleSelectTarget(char)}
                disabled={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* PHASE 2: TRANSITION */}
      {gameState.phase === 'TRANSITION' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white text-black rounded-[3rem] shadow-[20px_20px_0_#ff6b6b] animate-pulse">
          <h2 className="text-8xl font-impact mb-6">BRAINROT_LOADING...</h2>
          <p className="text-2xl font-bold mb-10">PASSE LE TEL AU BRO SANS REGARDER 💀</p>
          <button
            onClick={startGuessing}
            className="bg-black text-white font-impact text-4xl px-12 py-8 hover:bg-zinc-800 transition-all active:scale-90"
          >
            JE SUIS LE JOUEUR 2 🧠
          </button>
        </div>
      )}

      {/* PHASE 3: GUESSING */}
      {gameState.phase === 'GUESSING' && (
      <main className="w-full max-w-8xl flex flex-col lg:flex-row gap-6 items-center justify-center">

          <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {CHARACTERS.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                isEliminated={gameState.eliminatedIds.includes(char.id)}
                onToggleEliminate={handleToggleEliminate}
                onGuess={handleGuess}
                disabled={false}
              />
            ))}
          </div>
        </main>
      )}

      {/* PHASE 4: GAMEOVER (WIN) */}
      {gameState.phase === 'GAMEOVER' && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
          <div className="text-[15rem] leading-none mb-4 animate-bounce">🧠</div>
          <h2 className="text-8xl font-impact italic text-[#4ecdc4] mb-4">BRAINROT_FOUND</h2>
          <p className="text-3xl font-bold text-white mb-10">JOUEUR 2 A TROUVÉ LE BRAINROT !</p>
          <div className="bg-white text-black p-8 text-center mb-10 transform rotate-2">
             <div className="text-sm font-bold uppercase">C'était</div>
             <div className="text-4xl font-impact">{gameState.targetCharacter?.name}</div>
          </div>
          <button
            onClick={startPicking}
            className="bg-[#ff6b6b] text-white font-impact text-5xl px-12 py-8 hover:bg-red-400 shadow-[10px_10px_0_#fff] transition-transform active:translate-y-2"
          >
            ENCORE UN ROUND 🔥
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
