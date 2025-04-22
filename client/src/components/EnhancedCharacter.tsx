import { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCharacter } from '../lib/stores/useCharacter';
import { GLTF } from 'three-stdlib';
import { ACCESSORY_MAPPINGS, AccessoryMapping, getAccessoriesForLifestyleItem, getAccessoriesForLifestyleType } from '../lib/data/avatarAccessories';

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
      // Find accessories that match this lifestyle item ID
      const accessoriesForItemId = getAccessoriesForLifestyleItem(item.id);
      
      // Find accessories that match this lifestyle type
      const accessoriesForItemType: AccessoryMapping[] = typeof item.type === 'string' ? 
        getAccessoriesForLifestyleType(item.type) : [];
      
      // Combine both sets
      const accessoriesForItem = [...accessoriesForItemId, ...accessoriesForItemType];
      
      // Add to our list if we found any
      if (accessoriesForItem.length > 0) {
        allMatchingAccessories = [...allMatchingAccessories, ...accessoriesForItem];
      }
    });
    
    // Remove duplicates (by ID)
    const uniqueAccessories = Array.from(
      new Map(allMatchingAccessories.map(item => [item.id, item])).values()
    );
    
    // Handle exclusive accessories (only one per category)
    // Group by category and take the latest one
    const categoryMap = new Map<string, AccessoryMapping>();
    uniqueAccessories.forEach(accessory => {
      categoryMap.set(accessory.category, accessory);
    });
    
    const finalAccessories = Array.from(categoryMap.values());
    
    setActiveAccessories(finalAccessories);
    console.log(`Avatar has ${finalAccessories.length} accessories based on lifestyle choices`);
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
  scale: number | [number, number, number];
}) {
  const { scene } = useGLTF(path) as unknown as GLTFResult;
  
  // Handle scale whether it's a single number or an array
  const scaleVector = Array.isArray(scale) 
    ? new THREE.Vector3(...scale)
    : new THREE.Vector3(scale, scale, scale);
  
  return (
    <primitive 
      object={scene.clone()} 
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={scaleVector}
    />
  );
}

// Preload models
useGLTF.preload('/models/base_avatar.glb');

// Only preload the models we've actually generated
const existingModels = [
  '/models/accessories/business_suit.glb',
  '/models/accessories/sports_outfit.glb'
];

existingModels.forEach(modelPath => {
  useGLTF.preload(modelPath);
});

export default EnhancedCharacter;