import { useEffect, useState } from 'react';
import { useAudio } from '../../lib/stores/useAudio';

interface GameUIProps {
  phase: 'ready' | 'playing' | 'ended';
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
}

export function GameUI({ 
  phase, 
  score, 
  highScore, 
  onStart, 
  onRestart,
  debugMode,
  setDebugMode
}: GameUIProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const { playSound, toggleMute, isMuted } = useAudio();
  
  // Handle keyboard shortcuts for the UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle debug mode with 'B' key
      if (e.code === 'KeyB') {
        setDebugMode(!debugMode);
      }
      
      // Toggle mute with 'M' key
      if (e.code === 'KeyM') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode, setDebugMode, toggleMute]);
  
  // Timer for gameplay
  useEffect(() => {
    let timer: number;
    
    if (phase === 'playing') {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);
  
  return (
    <div className="w-full h-full flex flex-col p-4 text-white">
      {/* Top bar with score and time */}
      <div className="flex justify-between w-full mb-4">
        <div className="bg-black/70 px-4 py-2 rounded-lg pointer-events-auto">
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-sm">High Score: {highScore}</div>
        </div>
        
        {phase === 'playing' && (
          <div className="bg-black/70 px-4 py-2 rounded-lg">
            <div className="text-lg font-bold">Time: {timeLeft}s</div>
          </div>
        )}
        
        <div className="bg-black/70 px-4 py-2 rounded-lg flex items-center pointer-events-auto">
          <button 
            className="text-white hover:text-blue-400"
            onClick={toggleMute}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <button 
            className="ml-4 text-white hover:text-green-400"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? '🐞' : '⚙️'}
          </button>
        </div>
      </div>
      
      {/* Center screen content based on game phase */}
      <div className="flex-grow flex items-center justify-center">
        {phase === 'ready' && (
          <div className="bg-black/80 p-8 rounded-lg text-center pointer-events-auto">
            <h1 className="text-3xl font-bold mb-4">Financial Rush</h1>
            <p className="mb-6">Collect as many coins as possible!</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
              onClick={() => {
                playSound('success');
                onStart();
              }}
            >
              Start Game
            </button>
          </div>
        )}
        
        {phase === 'ended' && (
          <div className="bg-black/80 p-8 rounded-lg text-center pointer-events-auto">
            <h1 className="text-3xl font-bold mb-4">Game Over!</h1>
            <p className="mb-2">Your Score: {score}</p>
            <p className="mb-6">High Score: {highScore}</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
              onClick={() => {
                playSound('success');
                onRestart();
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      {/* Controls help (only visible in 'ready' or 'ended' phases) */}
      {(phase === 'ready' || phase === 'ended') && (
        <div className="mt-4 bg-black/70 p-4 rounded-lg max-w-md mx-auto">
          <h3 className="font-bold mb-2">Controls:</h3>
          <ul className="text-sm">
            <li>WASD or Arrow Keys: Move</li>
            <li>Space: Jump</li>
            <li>M: Toggle Sound</li>
            <li>B: Toggle Debug View</li>
          </ul>
        </div>
      )}
    </div>
  );
}