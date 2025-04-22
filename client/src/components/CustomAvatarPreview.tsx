import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useCharacter } from '../lib/stores/useCharacter';
import { avatarAccessories, getAccessoryById } from '../lib/data/avatarAccessories';
import { PerspectiveCamera, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg';
  showPlaceholder?: boolean;
}

// Component to render the custom avatar with accessories
function AvatarModel() {
  const characterState = useCharacter();
  const { selectedAccessories = {}, avatarSkinTone, avatarBodyType, avatarHeight } = characterState;
  
  // Create refs and load base model
  const baseModel = useGLTF('/models/accessories/default_body.glb');
  
  // Handle skin tone as material color
  React.useEffect(() => {
    if (baseModel && baseModel.scene) {
      baseModel.scene.traverse((obj: any) => {
        if (obj.isMesh && obj.material && obj.name.includes('body')) {
          // Clone material to avoid affecting other instances
          obj.material = obj.material.clone();
          
          // Apply skin tone if available
          if (avatarSkinTone) {
            obj.material.color = new THREE.Color(avatarSkinTone);
          }
        }
      });
    }
  }, [baseModel, avatarSkinTone]);
  
  // Apply body type as scaling
  const bodyScaleFactor = avatarBodyType === 'slim' ? 0.9 : 
                         avatarBodyType === 'athletic' ? 1.1 : 1;
  
  // Apply height
  const heightFactor = avatarHeight || 1;
  
  return (
    <group>
      {/* Base body model */}
      <primitive 
        object={baseModel.scene.clone()} 
        scale={[bodyScaleFactor, heightFactor, bodyScaleFactor]} 
      />
      
      {/* Selected accessories */}
      {Object.entries(selectedAccessories).map(([type, accessoryId]) => {
        const accessory = getAccessoryById(accessoryId);
        if (!accessory) return null;
        
        return (
          <AccessoryModel 
            key={accessoryId}
            modelPath={accessory.modelPath}
            scale={[bodyScaleFactor, heightFactor, bodyScaleFactor]}
          />
        );
      })}
    </group>
  );
}

// Component to load and render an accessory model
function AccessoryModel({ modelPath, scale = 1 }: { 
  modelPath: string;
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(modelPath);
  
  // Handle scale whether it's a single number or an array
  const scaleVector = Array.isArray(scale) 
    ? new THREE.Vector3(...scale)
    : new THREE.Vector3(scale, scale, scale);
  
  return (
    <primitive 
      object={scene.clone()} 
      scale={scaleVector}
    />
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
        <Canvas className="w-full h-full">
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <PerspectiveCamera makeDefault position={[0, 1.5, 2]} />
          <Suspense fallback={null}>
            <AvatarModel />
          </Suspense>
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