import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCharacter } from '../lib/stores/useCharacter';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
}

// Very simple avatar model with basic shapes
function SimpleAvatar() {
  // Get a ref to the group for animation
  const groupRef = useRef<THREE.Group>(null);
  
  // Get character state for colors
  const character = useCharacter();
  const skinColor = character.avatarSkinTone || "#F5D0A9";
  const hairColor = character.selectedAccessories?.hair === 'hair_fancy' 
    ? "#6B4226" : "#3B2E1F"; // Default brown hair
  
  // Simple outfit color selection based on type
  const outfitType = character.selectedAccessories?.outfit || "";
  const outfitColor = 
    outfitType === 'outfit_business' ? "#303030" : 
    outfitType === 'outfit_sports' ? "#4267B2" : 
    outfitType === 'outfit_luxury' ? "#A36B2C" : 
    "#5591AF"; // Default casual outfit
  
  // Simple rotation animation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, -0.7, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.2, -0.7, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Glasses if selected */}
      {character.selectedAccessories?.eyewear && (
        <mesh position={[0, 0.6, 0.25]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      )}
    </group>
  );
}

export default function CustomAvatarPreview({ 
  size = 'md',
  showPlaceholder = false
}: CustomAvatarPreviewProps) {
  
  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900`}>
      {showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
      ) : (
        <Canvas>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 2, 5]} intensity={1.2} />
          <directionalLight position={[-5, -2, -5]} intensity={0.5} color="#6080ff" />
          
          {/* Use Orthographic Camera with fixed zoom level */}
          <OrthographicCamera
            makeDefault
            position={[0, 0, 5]}
            zoom={70}
            near={0.1}
            far={1000}
          />
          
          {/* Avatar Model */}
          <Suspense fallback={null}>
            <SimpleAvatar />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}