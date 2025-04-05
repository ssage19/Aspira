import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { formatCurrency } from '../lib/utils';

export function PropertyCard({ property, position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Get appropriate texture based on property type
  const textureName = property.type === 'commercial' ? 'asphalt.png' : 
                     property.type === 'mansion' ? 'wood.jpg' : 'grass.png';
  
  const texture = useTexture(`/textures/${textureName}`);
  
  // Calculate building height based on property value
  const buildingHeight = Math.min(2 + (property.value / 1000000) * 3, 10);
  const buildingWidth = Math.min(2 + (property.value / 2000000), 5);
  
  // Hover animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + buildingHeight / 2;
    }
  });
  
  return (
    <group position={position} ref={meshRef}>
      {/* Building base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingWidth]} />
        <meshStandardMaterial 
          map={texture} 
          color={property.type === 'residential' ? '#e0e0e0' : 
                property.type === 'commercial' ? '#4a7c99' : 
                property.type === 'mansion' ? '#d4af37' : '#9c9c9c'} 
        />
      </mesh>
      
      {/* Roof for residential/mansion */}
      {(property.type === 'residential' || property.type === 'mansion') && (
        <mesh 
          position={[0, buildingHeight / 2 + 0.5, 0]} 
          castShadow
        >
          <coneGeometry args={[buildingWidth / 1.5, 1, 4]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      )}
      
      {/* Property info floating above */}
      <Billboard
        position={[0, buildingHeight + 1, 0]}
        follow={true}
      >
        <Text
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {property.name}
        </Text>
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {formatCurrency(property.value)}
        </Text>
      </Billboard>
    </group>
  );
}

export default PropertyCard;
