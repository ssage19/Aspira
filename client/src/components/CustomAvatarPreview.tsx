import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useCharacter } from '../lib/stores/useCharacter';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg';
  showPlaceholder?: boolean;
}

// Component to render stylized avatar using primitive shapes
function SimpleAvatarModel() {
  const characterState = useCharacter();
  const { selectedAccessories = {}, avatarSkinTone, avatarBodyType, avatarHeight } = characterState;
  
  // Apply body type as scaling
  const bodyScaleFactor = avatarBodyType === 'slim' ? 0.9 : 
                         avatarBodyType === 'athletic' ? 1.1 : 1;
  
  // Apply height
  const heightFactor = avatarHeight || 1;
  
  // Body color based on skin tone or default
  const bodyColor = avatarSkinTone || "#F5D0A9";
  
  // Get outfit color based on selected outfit
  const getOutfitColor = () => {
    const outfitId = selectedAccessories.outfit;
    if (outfitId === 'outfit_business') return "#303030"; // Business suit - dark
    if (outfitId === 'outfit_sports') return "#4267B2"; // Sports outfit - blue
    if (outfitId === 'outfit_luxury') return "#A36B2C"; // Designer clothes - gold/brown
    return "#5591AF"; // Default/casual outfit - blue-ish
  };
  
  // Get hair color based on selected hairstyle
  const getHairColor = () => {
    const hairId = selectedAccessories.hair;
    if (hairId === 'hair_fancy') return "#6B4226"; // Fancy hair - rich brown
    if (hairId === 'hair_professional') return "#2B2B2B"; // Professional hair - dark
    return "#3B2E1F"; // Default hair - brown
  };
  
  const outfitColor = getOutfitColor();
  const hairColor = getHairColor();
  
  return (
    <group scale={[bodyScaleFactor, heightFactor, bodyScaleFactor]}>
      {/* Base body - torso */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.25, -0.9, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.3]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      <mesh position={[0.25, -0.9, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.3]} />
        <meshStandardMaterial color={outfitColor} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.35, 0.15, 0.35]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Accessories - glasses if present */}
      {selectedAccessories.eyewear && (
        <mesh position={[0, 0.85, 0.2]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      )}
      
      {/* Watch if present */}
      {selectedAccessories.accessory === 'accessory_watch' && (
        <mesh position={[-0.5, -0.2, 0.15]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
      
      {/* Headphones if present */}
      {selectedAccessories.accessory === 'accessory_headphones' && (
        <group position={[0, 0.9, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[0.3, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
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
    lg: 'w-48 h-48'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-muted/30 rounded-md relative overflow-hidden`}>
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
          <ambientLight intensity={1.0} />
          <directionalLight position={[2, 2, 5]} intensity={1.5} />
          
          {/* Camera Setup */}
          <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={45} />
          
          {/* Avatar Model */}
          <Suspense fallback={null}>
            <SimpleAvatarModel />
          </Suspense>
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1}
          />
        </Canvas>
      )}
    </div>
  );
}