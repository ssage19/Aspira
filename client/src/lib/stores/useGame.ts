import { create } from 'zustand';

type GamePhase = 'ready' | 'playing' | 'ended';

interface GameState {
  // Game state
  phase: GamePhase;
  score: number;
  timeRemaining: number;
  highScore: number;
  
  // Audio state
  isMuted: boolean;
  
  // Functions
  start: () => void;
  end: () => void;
  restart: () => void;
  addScore: (points: number) => void;
  toggleMute: () => void;
}

// Create game store
export const useGame = create<GameState>((set) => {
  // Try to get high score from localStorage
  const savedHighScore = typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('game-high-score') || '0') 
    : 0;
  
  return {
    // Initial state
    phase: 'ready',
    score: 0,
    timeRemaining: 60, // 60 seconds game time
    highScore: savedHighScore,
    isMuted: false,
    
    // Start the game
    start: () => set({ phase: 'playing', score: 0, timeRemaining: 60 }),
    
    // End the game
    end: () => set(state => {
      // Check if current score is a new high score
      if (state.score > state.highScore) {
        // Save to localStorage
        localStorage.setItem('game-high-score', state.score.toString());
        return { phase: 'ended', highScore: state.score };
      }
      return { phase: 'ended' };
    }),
    
    // Restart the game
    restart: () => set({ phase: 'ready', score: 0, timeRemaining: 60 }),
    
    // Add points to the score
    addScore: (points) => set(state => ({ score: state.score + points })),
    
    // Toggle sound
    toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  };
});