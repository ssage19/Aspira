import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import { Character } from '../components/Character';
import GameUI from '../components/GameUI';
import { Button } from '../components/ui/button';
import { ChevronLeft, Sparkles, User, Shirt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ACCESSORY_MAPPINGS, AccessoryMapping } from '../lib/data/avatarAccessories';
import { allEnhancedLifestyleItems } from '../lib/data/enhancedLifestyleItems';

export default function AvatarCustomizationScreen() {
  const navigate = useNavigate();
  const { lifestyleItems } = useCharacter();
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 3, y: 2, z: 3 });
  
  // Get accessories based on character's lifestyle items
  const unlockedAccessories = ACCESSORY_MAPPINGS.filter(acc => {
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
  
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 pt-20 max-w-5xl mx-auto">
          <Button 
            variant="outline"
            size="default"
            onClick={() => navigate('/lifestyle')}
            className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Lifestyle
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Avatar Preview
                  </CardTitle>
                  <CardDescription>
                    Your character reflects your lifestyle choices
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="relative w-full h-[500px] bg-gradient-to-b from-slate-900 to-indigo-900">
                    <Canvas shadows>
                      <color attach="background" args={["transparent"]} />
                      
                      <PerspectiveCamera 
                        makeDefault 
                        position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} 
                        fov={50}
                      />
                      
                      <OrbitControls 
                        enablePan={false}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1}
                        minPolarAngle={Math.PI/6}
                        maxPolarAngle={Math.PI/2}
                      />
                      
                      <ambientLight intensity={0.6} />
                      <directionalLight 
                        position={[5, 5, 5]} 
                        intensity={0.8} 
                        castShadow 
                        shadow-mapSize={[1024, 1024]}
                      />
                      
                      <Character position={[0, -1, 0]} scale={1.2} />
                      <Environment preset="city" />
                    </Canvas>
                    
                    {/* Controls */}
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/30 hover:bg-black/50 text-white"
                        onClick={() => setAutoRotate(!autoRotate)}
                      >
                        {autoRotate ? "Pause Rotation" : "Auto Rotate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                    Unlocked Accessories
                  </CardTitle>
                  <CardDescription>
                    Based on your lifestyle choices
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've unlocked {unlockedAccessories.length} of {ACCESSORY_MAPPINGS.length} accessories.
                  </p>
                  
                  <div className="h-2 bg-gray-200 rounded-full mb-6">
                    <div 
                      className="h-2 bg-indigo-500 rounded-full" 
                      style={{ width: `${(unlockedAccessories.length / ACCESSORY_MAPPINGS.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  {unlockedAccessories.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-auto pr-2">
                      {unlockedAccessories.map((accessory, index) => (
                        <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                          <h4 className="font-medium text-sm">{accessory.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {accessory.category.charAt(0).toUpperCase() + accessory.category.slice(1)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-secondary/20 rounded-lg">
                      <p className="text-muted-foreground text-sm">
                        Purchase lifestyle items to unlock accessories for your avatar.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate('/lifestyle')}
                      >
                        <Shirt className="h-4 w-4 mr-2" />
                        Browse Lifestyle Items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}