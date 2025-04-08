import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../../lib/stores/useGame';

export function Lighting() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const { phase } = useGame();
  
  // Animate the sun position
  useFrame((_, delta) => {
    if (phase !== 'playing' || !directionalLightRef.current) return;
    
    // Slowly rotate the sun
    directionalLightRef.current.position.x = 
      Math.sin(Date.now() * 0.0001) * 50;
    directionalLightRef.current.position.z = 
      Math.cos(Date.now() * 0.0001) * 50;
  });
  
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Additional point lights for interest */}
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#e84393" />
      <pointLight position={[10, 5, 10]} intensity={0.5} color="#00cec9" />
    </>
  );
}