import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from './Game';
import { Confetti } from './Confetti';
import { useAudio } from '../../lib/stores/useAudio';
import { useGame } from '../../lib/stores/useGame';

// Player character properties
const JUMP_FORCE = 8;
const PLAYER_SPEED = 5;
const GRAVITY = 25;

export function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const position = useRef<[number, number, number]>([0, 1, 0]);
  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  
  const [isGrounded, setIsGrounded] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { phase, addScore } = useGame();
  const { playSound } = useAudio();
  
  // Get keyboard controls state (doesn't cause re-renders)
  const [, getControls] = useKeyboardControls<Controls>();
  
  // Reset player when game phase changes
  useEffect(() => {
    if (phase === 'ready') {
      // Reset position and velocity
      position.current = [0, 1, 0];
      velocity.current = [0, 0, 0];
      
      if (playerRef.current) {
        playerRef.current.position.set(0, 1, 0);
      }
    }
  }, [phase]);
  
  // Handle player movement and physics
  useFrame((_, delta) => {
    if (!playerRef.current || phase !== 'playing') return;
    
    const controls = getControls();
    
    // Movement controls
    const moveZ = Number(controls.forward) - Number(controls.back);
    const moveX = Number(controls.right) - Number(controls.left);
    
    // Calculate movement direction
    let movementX = 0;
    let movementZ = 0;
    
    if (moveX !== 0 || moveZ !== 0) {
      // Normalize movement vector
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      movementX = (moveX / length) * PLAYER_SPEED * delta;
      movementZ = (moveZ / length) * PLAYER_SPEED * delta;
    }
    
    // Update velocity for horizontal movement
    velocity.current[0] = movementX;
    velocity.current[2] = movementZ;
    
    // Apply gravity
    if (!isGrounded) {
      velocity.current[1] -= GRAVITY * delta;
    } else if (controls.jump) {
      // Jump
      velocity.current[1] = JUMP_FORCE;
      setIsGrounded(false);
      playSound('jump');
    }
    
    // Update position
    position.current[0] += velocity.current[0];
    position.current[1] += velocity.current[1] * delta;
    position.current[2] += velocity.current[2];
    
    // Check if player hit ground
    if (position.current[1] < 1) {
      position.current[1] = 1;
      velocity.current[1] = 0;
      setIsGrounded(true);
    }
    
    // Apply position to mesh
    playerRef.current.position.set(
      position.current[0],
      position.current[1],
      position.current[2]
    );
    
    // Collect coins (simplified - just randomly add score)
    if (Math.random() < 0.01) {
      addScore(10);
      playSound('collect');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 500);
    }
  });
  
  return (
    <>
      <mesh ref={playerRef} position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* Confetti effect when collecting coins */}
      <Confetti 
        active={showConfetti} 
        position={[position.current[0], position.current[1] + 2, position.current[2]]}
        count={30}
        spread={2}
      />
    </>
  );
}