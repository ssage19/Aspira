import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import Character from './Character';
import PropertyCard from './PropertyCard';

export function MainScene() {
  const { wealth, properties } = useCharacter();
  
  // Calculate camera position based on wealth level
  const cameraHeight = Math.min(10 + (wealth / 1000000) * 5, 30);
  
  return (
    <Canvas shadows>
      <color attach="background" args={["#87CEEB"]} />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, cameraHeight, 20]} fov={45} />
      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={10}
        maxDistance={50}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      
      {/* Scenery */}
      <Environment preset="sunset" />
      {wealth > 10000000 && <Stars radius={100} depth={50} count={5000} factor={4} />}
      
      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#8ab56a" />
      </mesh>
      
      {/* Character */}
      <Character position={[0, 0, 0]} scale={1} />
      
      {/* Properties */}
      {properties.map((property, index) => {
        // Calculate property position in a semi-circle around the character
        const angle = (index / properties.length) * Math.PI;
        const radius = 8 + (index % 3) * 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <PropertyCard 
            key={property.id}
            property={property}
            position={[x, 0, z]}
          />
        );
      })}
    </Canvas>
  );
}

export default MainScene;
