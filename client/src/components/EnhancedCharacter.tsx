import { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCharacter } from '../lib/stores/useCharacter';
import { GLTF } from 'three-stdlib';
import { ACCESSORY_MAPPINGS, AccessoryMapping, getExclusiveAccessories, findAccessoriesForLifestyleItem } from '../lib/data/avatarAccessories';

// Define the types for our models
type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
  animations: THREE.AnimationClip[];
};

export function EnhancedCharacter({ position = [0, 0, 0], scale = 1 }) {
  const characterRef = useRef<THREE.Group>(null);
  const { wealth, lifestyleItems } = useCharacter();
  const [activeAccessories, setActiveAccessories] = useState<AccessoryMapping[]>([]);
  
  // Load the base character model
  const { scene: characterScene, animations } = useGLTF('/models/base_avatar.glb') as unknown as GLTFResult;
  const { actions } = useAnimations(animations, characterRef);
  
  // Calculate character scale based on wealth (legacy feature)
  const characterScale = Math.min(1 + (wealth / 1000000) * 0.2, 1.5);
  
  // Determine which accessories to display based on owned lifestyle items
  useEffect(() => {
    if (!lifestyleItems || lifestyleItems.length === 0) {
      setActiveAccessories([]);
      return;
    }
    
    // All matching accessories
    let allMatchingAccessories: AccessoryMapping[] = [];
    
    // Find accessories for each lifestyle item
    lifestyleItems.forEach(item => {
      // Find accessories that match this lifestyle item
      const accessoriesForItem = findAccessoriesForLifestyleItem(item.id, item.type);
      
      // Add to our list if we found any
      if (accessoriesForItem.length > 0) {
        allMatchingAccessories = [...allMatchingAccessories, ...accessoriesForItem];
      }
    });
    
    // Handle exclusive accessories (only one per category)
    const finalAccessories = getExclusiveAccessories(allMatchingAccessories);
    
    // Wealth-based filtering
    const wealthFilteredAccessories = finalAccessories.filter(acc => 
      !acc.minWealth || (acc.minWealth && wealth >= acc.minWealth)
    );
    
    setActiveAccessories(wealthFilteredAccessories);
    console.log(`Avatar has ${wealthFilteredAccessories.length} accessories based on lifestyle choices`);
  }, [lifestyleItems, wealth]);
  
  // Add subtle animation
  useFrame((state, delta) => {
    if (characterRef.current) {
      // Gentle idle animation - slight swaying
      characterRef.current.rotation.y += 0.002;
    }
  });
  
  // Play idle animation if available
  useEffect(() => {
    if (actions && actions.idle) {
      actions.idle.reset().fadeIn(0.5).play();
    }
  }, [actions]);
  
  // Custom clone function to handle materials
  const cloneGLTF = (original: THREE.Object3D) => {
    const clone = original.clone(true);
    
    // Make sure all materials are unique
    clone.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map((mat: THREE.Material) => mat.clone());
        } else {
          obj.material = obj.material.clone();
        }
      }
    });
    
    return clone;
  };
  
  return (
    <group 
      ref={characterRef} 
      position={new THREE.Vector3(...position)} 
      scale={[scale * characterScale, scale * characterScale, scale * characterScale]}
    >
      {/* Base character model */}
      <primitive object={cloneGLTF(characterScene)} />
      
      {/* Accessories based on lifestyle choices */}
      {activeAccessories.map((accessory, index) => (
        <AccessoryModel 
          key={index}
          path={accessory.modelPath}
          position={accessory.position || [0, 0, 0]}
          rotation={accessory.rotation || [0, 0, 0]}
          scale={accessory.scale || 1}
        />
      ))}
    </group>
  );
}

// Component to load and render an accessory model
function AccessoryModel({ path, position, rotation, scale }: {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const { scene } = useGLTF(path) as unknown as GLTFResult;
  
  return (
    <primitive 
      object={scene.clone()} 
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    />
  );
}

// Preload models
useGLTF.preload('/models/base_avatar.glb');
ACCESSORY_MAPPINGS.forEach(accessory => {
  useGLTF.preload(accessory.modelPath);
});

export default EnhancedCharacter;