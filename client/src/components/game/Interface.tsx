import { useState, useEffect } from 'react';
import { Keyboard, RefreshCw, Volume2, VolumeX } from 'lucide-react';

// Game states
type GamePhase = 'ready' | 'playing' | 'ended';

export function Interface() {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [score, setScore] = useState(0);
  const [muted, setMuted] = useState(false);
  
  // Simulated game state
  useEffect(() => {
    const intervalId = setInterval(() => {
      setScore(prev => prev + 10);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Restart the game
  const handleRestart = () => {
    setScore(0);
    setPhase('playing');
    console.log('Game restarted');
  };
  
  // Toggle sound
  const handleToggleSound = () => {
    setMuted(prev => !prev);
    console.log(`Sound ${muted ? 'unmuted' : 'muted'}`);
  };
  
  return (
    <>
      {/* Score display */}
      <div className="fixed top-4 left-4 z-10 bg-black/60 text-white p-3 rounded-lg">
        <p className="font-bold">Score: {score}</p>
      </div>
      
      {/* Game controls */}
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={handleRestart}
          className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80"
          aria-label="Restart game"
        >
          <RefreshCw size={20} />
        </button>
        <button 
          onClick={handleToggleSound}
          className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
      
      {/* Instructions panel */}
      <div className="fixed bottom-4 left-4 z-10 bg-black/60 text-white p-3 rounded-lg max-w-xs">
        <h3 className="font-medium mb-2 flex items-center">
          <Keyboard size={16} className="mr-2" />
          Controls:
        </h3>
        <ul className="text-sm space-y-1">
          <li>WASD or Arrow Keys: Move the player</li>
          <li>Space: Jump</li>
          <li>R: Restart game</li>
          <li>M: Toggle sound</li>
        </ul>
      </div>
      
      {/* Game over screen */}
      {phase === 'ended' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg mb-4">Final Score: {score}</p>
            <button 
              onClick={handleRestart}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}