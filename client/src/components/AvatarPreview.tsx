import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, SpotLight } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Shirt, RotateCw, PauseCircle, PlayCircle } from 'lucide-react';
import { Character } from './Character';
import { ACCESSORY_MAPPINGS } from '../lib/data/avatarAccessories';

export function AvatarPreview() {
  const navigate = useNavigate();
  const { lifestyleItems } = useCharacter();
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Get unlocked accessories count
  const unlockedAccessories = ACCESSORY_MAPPINGS.filter(acc => {
    // Check if any lifestyle item matches this accessory
    return lifestyleItems.some(item => {
      // Direct ID match
      if (acc.lifestyleIds.includes(item.id)) {
        return true;
      }
      
      // Type match
      if (typeof acc.lifestyleType === 'string') {
        return acc.lifestyleType === item.type;
      } else if (Array.isArray(acc.lifestyleType)) {
        return acc.lifestyleType.includes(item.type);
      }
      
      return false;
    });
  });
  
  // Get total accessories
  const totalAccessories = ACCESSORY_MAPPINGS.length;
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shirt className="h-4 w-4 mr-2 text-indigo-500" />
          Your Avatar
        </CardTitle>
        <CardDescription>
          Customize with lifestyle choices
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* 3D Avatar Preview */}
        <div className="relative w-full h-[250px] bg-gradient-to-b from-indigo-900 to-purple-900">
          <Canvas shadows>
            <color attach="background" args={["transparent"]} />
            
            {/* Camera */}
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI/3}
              maxPolarAngle={Math.PI/2}
              autoRotate={autoRotate}
              autoRotateSpeed={3}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <SpotLight
              position={[5, 5, 5]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
            />
            
            {/* Character */}
            <Suspense fallback={null}>
              <Character position={[0, -0.9, 0]} scale={1.0} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
          
          {/* Controls */}
          <div className="absolute bottom-2 right-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Avatar Stats */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Unlocked Accessories</h4>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {unlockedAccessories.length}/{totalAccessories}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-indigo-500 rounded-full" 
                style={{ width: `${(unlockedAccessories.length / totalAccessories) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate('/avatar')}
          >
            <Shirt className="h-4 w-4 mr-2" />
            Customize Avatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarPreview;