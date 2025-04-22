import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import { Character } from './Character';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ACCESSORY_MAPPINGS } from '../lib/data/avatarAccessories';
import { LifestyleItem } from '../lib/stores/useCharacter';
import { Button } from './ui/button';

export function AvatarPreview() {
  const { lifestyleItems } = useCharacter();
  const [unlockedAccessories, setUnlockedAccessories] = useState<string[]>([]);
  const [rotating, setRotating] = useState(true);
  
  // Map lifestyle items to unlocked accessories
  useEffect(() => {
    const accessoryNames: string[] = [];
    
    if (lifestyleItems && lifestyleItems.length > 0) {
      // Check each lifestyle item against our accessory mappings
      lifestyleItems.forEach((item: LifestyleItem) => {
        // Find matching accessories
        const matchingAccessories = ACCESSORY_MAPPINGS.filter(acc => {
          // Check if the item ID directly matches
          if (acc.lifestyleIds.includes(item.id)) {
            return true;
          }
          
          // Check if the item type matches
          if (typeof acc.lifestyleType === 'string') {
            return acc.lifestyleType === item.type;
          } else if (Array.isArray(acc.lifestyleType)) {
            return acc.lifestyleType.includes(item.type);
          }
          
          return false;
        });
        
        // Add accessory names to our list
        matchingAccessories.forEach(acc => {
          if (!accessoryNames.includes(acc.name)) {
            accessoryNames.push(acc.name);
          }
        });
      });
    }
    
    setUnlockedAccessories(accessoryNames);
  }, [lifestyleItems]);
  
  return (
    <Card className="w-full h-[480px] bg-gradient-to-br from-slate-900 to-slate-800">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold text-center text-white">
          Your Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full pt-2">
        {/* 3D Canvas for avatar preview */}
        <div className="relative w-full h-[320px] rounded-md overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
          <Canvas shadows>
            <color attach="background" args={["#0f172a"]} />
            
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={45} />
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              enableRotate={rotating}
              autoRotate={rotating}
              autoRotateSpeed={2}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />
            
            {/* Character */}
            <Character position={[0, -1, 0]} scale={1} />
            
            {/* Environment */}
            <Environment preset="city" />
          </Canvas>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute bottom-2 right-2 bg-black/30 text-white hover:bg-black/50"
            onClick={() => setRotating(!rotating)}
          >
            {rotating ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/></svg>
            )}
          </Button>
        </div>
        
        {/* Unlocked accessories list */}
        <div className="mt-4 max-h-24 overflow-y-auto">
          <h3 className="text-sm font-medium text-white mb-2">Unlocked Accessories</h3>
          {unlockedAccessories.length > 0 ? (
            <div className="space-y-1">
              {unlockedAccessories.map((accessory, index) => (
                <div key={index} className="text-xs text-green-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {accessory}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Purchase lifestyle items to unlock avatar accessories
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarPreview;