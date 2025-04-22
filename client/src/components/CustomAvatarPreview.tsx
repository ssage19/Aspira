import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCharacter } from '../lib/stores/useCharacter';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
}

// Simple debug cube to ensure rendering is working
function DebugCube() {
  useEffect(() => {
    console.log("Debug cube rendered");
  }, []);
  
  return (
    <mesh position={[-1.5, -1, 0]} scale={[0.3, 0.3, 0.3]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

// Very simple avatar model with basic shapes
function SimpleAvatar() {
  const character = useCharacter();
  const skinColor = character.avatarSkinTone || "#F5D0A9";
  const outfitType = character.selectedAccessories?.outfit || "";
  
  // Very basic outfit color based on type
  const outfitColor = 
    outfitType === 'outfit_business' ? "#303030" : 
    outfitType === 'outfit_sports' ? "#4267B2" : 
    outfitType === 'outfit_luxury' ? "#A36B2C" : 
    "#5591AF"; // default/casual
  
  // Add rotation animation
  useFrame((state) => {
    const group = state.scene.getObjectByName("avatarGroup");
    if (group) {
      group.rotation.y += 0.01;
    }
  });
  
  useEffect(() => {
    console.log("Avatar model is rendering with skin color:", skinColor);
  }, [skinColor]);
  
  return (
    // Main group - scale down to 0.7 to fit in view
    <group name="avatarGroup" scale={[0.7, 0.7, 0.7]}>
      {/* Head */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.12, -0.4, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.12, -0.4, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
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
  
  useEffect(() => {
    console.log("CustomAvatarPreview rendered with size:", size);
  }, [size]);
  
  return (
    <div 
      className={`${sizeClasses[size]} bg-muted/30 rounded-md relative overflow-hidden`}
      style={{border: '1px solid #4444ff'}} // Debug border
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
      ) : (
        <Canvas style={{background: 'rgba(30,30,30,0.3)'}}>
          {/* Basic lighting */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          
          {/* Debug grid to help with orientation */}
          <gridHelper args={[10, 10, '#444444', '#222222']} />
          
          {/* Debug cube for visibility testing */}
          <DebugCube />
          
          {/* Avatar */}
          <Suspense fallback={null}>
            <SimpleAvatar />
          </Suspense>
          
          {/* Camera - moved further back, wider FOV, and raised up slightly to show full avatar */}
          <PerspectiveCamera makeDefault position={[0, 0.2, 5]} fov={50} />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      )}
    </div>
  );
}