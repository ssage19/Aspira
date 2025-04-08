import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../../lib/stores/useGame';

export function GameLevel() {
  const groundRef = useRef<THREE.Mesh>(null);
  const coinsRef = useRef<THREE.Group>(null);
  const { phase } = useGame();
  
  // Load textures
  // Leaving this commented out until we have actual textures
  // const groundTexture = useTexture('/textures/ground.png');
  // if (groundTexture) {
  //   groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  //   groundTexture.repeat.set(20, 20);
  //   groundTexture.encoding = THREE.sRGBEncoding;
  // }
  
  // Animate the level elements
  useFrame((_, delta) => {
    if (phase !== 'playing') return;
    
    // Rotate coins if we had them
    if (coinsRef.current) {
      coinsRef.current.children.forEach((coin, i) => {
        coin.rotation.y += (0.5 + i * 0.1) * delta;
      });
    }
  });
  
  return (
    <>
      {/* Ground */}
      <mesh 
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#8eb44f"
          // map={groundTexture} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Walls to prevent player from going off edges */}
      <group>
        {/* North wall */}
        <mesh position={[0, 2, -50]} receiveShadow castShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial color="#6a8e35" />
        </mesh>
        
        {/* South wall */}
        <mesh position={[0, 2, 50]} receiveShadow castShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial color="#6a8e35" />
        </mesh>
        
        {/* East wall */}
        <mesh position={[50, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial color="#6a8e35" />
        </mesh>
        
        {/* West wall */}
        <mesh position={[-50, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial color="#6a8e35" />
        </mesh>
      </group>
      
      {/* Obstacles */}
      <group>
        {/* Some simple obstacles */}
        <mesh position={[-5, 1, -7]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#e67e22" />
        </mesh>
        
        <mesh position={[5, 1.5, 8]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#9b59b6" />
        </mesh>
        
        <mesh position={[-2, 0.5, 5]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>
      
      {/* Coins */}
      <group ref={coinsRef}>
        {/* We'll generate coins dynamically, but for now, one example */}
        <mesh position={[3, 1, -3]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
}