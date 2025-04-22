import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { useCharacter } from '../lib/stores/useCharacter';
import { avatarAccessories, getAccessoryById } from '../lib/data/avatarAccessories';
import { PerspectiveCamera, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg';
  showPlaceholder?: boolean;
}

// Preload the models to avoid loading issues
// Using strings in an array to preload models
const modelsToPreload = [
  '/models/accessories/default_body.glb',
  '/models/accessories/default_hair.glb',
  '/models/accessories/fancy_hair.glb', 
  '/models/accessories/professional_hair.glb',
  '/models/accessories/casual_outfit.glb',
  '/models/accessories/business_suit.glb',
  '/models/accessories/sports_outfit.glb',
  '/models/accessories/designer_clothes.glb',
  '/models/accessories/reading_glasses.glb',
  '/models/accessories/luxury_sunglasses.glb',
  '/models/accessories/luxury_watch.glb',
  '/models/accessories/premium_headphones.glb'
];

// Preload the models
modelsToPreload.forEach(path => {
  useGLTF.preload(path);
});

// Component to render the custom avatar with accessories
function AvatarModel() {
  const characterState = useCharacter();
  const { selectedAccessories = {}, avatarSkinTone, avatarBodyType, avatarHeight } = characterState;
  const [modelError, setModelError] = useState<boolean>(false);
  const { scene: baseScene } = useLoader(GLTFLoader, '/models/accessories/default_body.glb', 
    (loader) => {
      // Add any loader configuration here
    },
    (error) => {
      console.error("Error loading base model with GLTFLoader:", error);
      setModelError(true);
    }
  );
  
  const baseModel = useRef(baseScene ? baseScene.clone() : null);
  
  // Handle skin tone as material color
  useEffect(() => {
    try {
      if (baseModel.current) {
        baseModel.current.traverse((obj: any) => {
          if (obj.isMesh && obj.material) {
            // Clone material to avoid affecting other instances
            obj.material = obj.material.clone();
            
            // Apply skin tone if available
            if (avatarSkinTone) {
              obj.material.color = new THREE.Color(avatarSkinTone);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error applying skin tone:", error);
    }
  }, [baseModel, avatarSkinTone]);
  
  // Apply body type as scaling
  const bodyScaleFactor = avatarBodyType === 'slim' ? 0.9 : 
                         avatarBodyType === 'athletic' ? 1.1 : 1;
  
  // Apply height
  const heightFactor = avatarHeight || 1;
  
  // Show fallback mesh if there's an error or model is null
  if (modelError || !baseModel.current) {
    return (
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={avatarSkinTone || "#F5D0A9"} />
      </mesh>
    );
  }
  
  return (
    <group>
      {/* Base body model */}
      <primitive 
        object={baseModel.current} 
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
  const [modelError, setModelError] = useState<boolean>(false);
  const { scene } = useLoader(GLTFLoader, modelPath, 
    (loader) => {
      // Add any loader configuration here
    },
    (error) => {
      console.error(`Error loading accessory model ${modelPath}:`, error);
      setModelError(true);
    }
  );
  
  const model = useRef(scene ? scene.clone() : null);
  
  // Handle scale whether it's a single number or an array
  const scaleVector = Array.isArray(scale) 
    ? new THREE.Vector3(...scale)
    : new THREE.Vector3(scale, scale, scale);
  
  // Return null if there's an error or the model isn't loaded properly
  if (modelError || !model.current) {
    return null; 
  }
  
  return (
    <primitive 
      object={model.current} 
      scale={scaleVector}
    />
  );
}

// Debug component to render when models fail to load
function DebugBox() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
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
  
  const [loadError, setLoadError] = useState(false);
  
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
        <Canvas className="w-full h-full" onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <PerspectiveCamera makeDefault position={[0, 1.5, 2]} />
          <Suspense fallback={<DebugBox />}>
            {loadError ? <DebugBox /> : <AvatarModel />}
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