import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Player } from './Player';
import { GameLevel } from './GameLevel';
import { GameUI } from './GameUI';
import { Lighting } from './Lighting';
import { Debug } from './Debug';
import { useGame } from '../../lib/stores/useGame';

// Define controls as an enum for type safety
export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

export function Game() {
  const { phase, score, highScore, start, restart } = useGame();
  const [debugMode, setDebugMode] = useState(false);
  
  // Define key mappings
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];
  
  return (
    <div className="relative w-full h-full">
      {/* Game UI overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameUI 
          phase={phase} 
          score={score} 
          highScore={highScore}
          onStart={start}
          onRestart={restart}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
        />
      </div>
      
      {/* 3D Game Canvas */}
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 50 }}
          className="bg-black/90"
        >
          <Suspense fallback={null}>
            <GameLevel />
            <Player />
            <Lighting />
            
            {/* Debug elements (only shown when debug mode is on) */}
            {debugMode && <Debug />}
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}