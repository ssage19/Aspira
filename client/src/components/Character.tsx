import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCharacter } from '../lib/stores/useCharacter';
import { EnhancedCharacter } from './EnhancedCharacter';

export function Character({ position = [0, 0, 0], scale = 1 }) {
  const characterRef = useRef<THREE.Group>(null);
  const wealth = useCharacter(state => state.wealth);
  const lifestyleItems = useCharacter(state => state.lifestyleItems);
  
  // Check if we have any lifestyle items that should trigger the enhanced character
  const useEnhancedCharacter = lifestyleItems && lifestyleItems.length > 0;
  
  // If we have lifestyle items, use the enhanced character with accessories
  if (useEnhancedCharacter) {
    return <EnhancedCharacter position={position} scale={scale} />;
  }
  
  // Otherwise, use the simple character (legacy implementation)
  useFrame(() => {
    if (characterRef.current) {
      // Add some subtle animation
      characterRef.current.rotation.y += 0.005;
    }
  });
  
  // Calculate character scale based on wealth
  const characterScale = Math.min(1 + (wealth / 1000000) * 0.5, 2);
  
  return (
    <group 
      ref={characterRef} 
      position={new THREE.Vector3(...position)} 
      scale={[scale * characterScale, scale * characterScale, scale * characterScale]}
    >
      {/* Character body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color={wealth > 1000000 ? "#FFD700" : wealth > 100000 ? "#C0C0C0" : "#6b7280"} />
      </mesh>
      
      {/* Character head */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f5d0c5" />
      </mesh>
      
      {/* Optional: Add accessories based on wealth level */}
      {wealth > 500000 && (
        <mesh position={[0, 2.7, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
  );
}

export default Character;
