import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stats } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import { Character } from '../components/Character';
import GameUI from '../components/GameUI';
import { Button } from '../components/ui/button';
import { ChevronLeft, Sparkles, User, Shirt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ACCESSORY_MAPPINGS, AccessoryMapping } from '../lib/data/avatarAccessories';
import { allEnhancedLifestyleItems } from '../lib/data/enhancedLifestyleItems';

export function AvatarCustomizationScreen() {
  const navigate = useNavigate();
  const { lifestyleItems, wealth } = useCharacter();
  const [showStats, setShowStats] = useState(false);
  const [rotating, setRotating] = useState(true);
  
  // Get unlocked accessories
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
  
  // Get locked accessories
  const lockedAccessories = ACCESSORY_MAPPINGS.filter(acc => {
    return !unlockedAccessories.some(unlocked => unlocked.id === acc.id);
  });
  
  // Convert accessory to lifestyle name
  const getLifestyleNameForAccessory = (accessory: AccessoryMapping) => {
    // Try to find a matching lifestyle item to recommend for purchase
    const matchingItem = allEnhancedLifestyleItems.find(item => 
      accessory.lifestyleIds.includes(item.id) || 
      (typeof accessory.lifestyleType === 'string' && item.type === accessory.lifestyleType) ||
      (Array.isArray(accessory.lifestyleType) && accessory.lifestyleType.includes(item.type))
    );
    
    if (matchingItem) {
      return matchingItem.name;
    }
    
    // Fallback to the type name
    if (typeof accessory.lifestyleType === 'string') {
      return accessory.lifestyleType.charAt(0).toUpperCase() + accessory.lifestyleType.slice(1);
    }
    
    return 'Lifestyle item';
  };
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      <GameUI />
      
      <div className="relative z-10 w-full">
        <div className="p-4 pt-20 max-w-6xl mx-auto">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => navigate('/')}
            className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm w-full sm:w-auto"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Your Avatar</h1>
            <p className="text-gray-500">
              Your appearance is influenced by your lifestyle choices and purchases. 
              Unlock new accessories by making different lifestyle choices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Preview */}
            <div className="lg:col-span-2">
              <Card className="w-full h-[500px] bg-gradient-to-br from-indigo-900 to-slate-900 overflow-hidden shadow-xl">
                <CardContent className="p-0 h-full">
                  <Canvas shadows>
                    <color attach="background" args={["#111827"]} />
                    
                    {/* Debug Stats */}
                    {showStats && <Stats />}
                    
                    {/* Camera */}
                    <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={40} />
                    <OrbitControls 
                      enablePan={false}
                      minDistance={2}
                      maxDistance={8}
                      enableRotate={true}
                      autoRotate={rotating}
                      autoRotateSpeed={1}
                    />
                    
                    {/* Lighting */}
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} intensity={0.8} />
                    <spotLight position={[0, 8, 0]} angle={0.25} penumbra={1} intensity={0.8} castShadow />
                    
                    {/* Character */}
                    <Character position={[0, -1, 0]} scale={1.2} />
                    
                    {/* Environment */}
                    <Environment preset="city" />
                  </Canvas>
                  
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-black/30 text-white hover:bg-black/50"
                      onClick={() => setShowStats(!showStats)}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-black/30 text-white hover:bg-black/50"
                      onClick={() => setRotating(!rotating)}
                    >
                      {rotating ? "Stop Rotation" : "Rotate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Accessories List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shirt className="h-5 w-5 mr-2 text-indigo-500" />
                    Avatar Accessories
                  </CardTitle>
                  <CardDescription>
                    Unlock new looks by purchasing lifestyle items
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Unlocked Accessories */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
                      Unlocked Accessories
                    </h3>
                    
                    {unlockedAccessories.length > 0 ? (
                      <div className="space-y-2">
                        {unlockedAccessories.map((accessory, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded-md flex items-center">
                            <div className="bg-green-100 text-green-700 rounded-full p-1 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{accessory.name}</p>
                              <p className="text-xs text-gray-500">{accessory.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No accessories unlocked yet. Purchase lifestyle items to customize your avatar.
                      </p>
                    )}
                  </div>
                  
                  {/* Locked Accessories */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Locked Accessories</h3>
                    
                    <div className="space-y-2">
                      {lockedAccessories.slice(0, 5).map((accessory, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-md flex items-center">
                          <div className="bg-gray-200 text-gray-400 rounded-full p-1 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{accessory.name}</p>
                            <p className="text-xs text-gray-400">
                              Unlock with: {getLifestyleNameForAccessory(accessory)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {lockedAccessories.length > 5 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{lockedAccessories.length - 5} more accessories to unlock
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/lifestyle')}
                  >
                    <Shirt className="h-4 w-4 mr-2" />
                    Purchase Lifestyle Items
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarCustomizationScreen;