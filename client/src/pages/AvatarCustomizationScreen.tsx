import React, { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import CustomAvatarPreview from '../components/CustomAvatarPreview';
import { 
  avatarAccessories, 
  getAvailableAccessories, 
  AvatarAccessoryMapping
} from '../lib/data/avatarAccessories';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  User, 
  Brush, 
  Shirt, 
  Glasses, 
  Watch,
  Laptop,
  ChevronLeft, 
  Sparkles 
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function AvatarCustomizationScreen() {
  const navigate = useNavigate();
  const character = useCharacter();
  const [activeTab, setActiveTab] = useState<string>('outfit');
  
  // Get all available accessories based on owned lifestyle items
  const availableAccessories = getAvailableAccessories(character.lifestyleItems || []);
  
  // Group accessories by type
  const accessoryTypeMap: Record<string, AvatarAccessoryMapping[]> = {};
  availableAccessories.forEach((acc: AvatarAccessoryMapping) => {
    if (!accessoryTypeMap[acc.type]) {
      accessoryTypeMap[acc.type] = [];
    }
    accessoryTypeMap[acc.type].push(acc);
  });
  
  // Available accessory types
  const accessoryTypes = Object.keys(accessoryTypeMap);
  
  // Handle accessory selection
  const handleSelectAccessory = (type: string, id: string) => {
    character.selectAccessory(type, id);
  };
  
  // Get icon for accessory type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'body': return <User className="h-4 w-4" />;
      case 'hair': return <Brush className="h-4 w-4" />;
      case 'outfit': return <Shirt className="h-4 w-4" />;
      case 'eyewear': return <Glasses className="h-4 w-4" />;
      case 'accessory': return <Watch className="h-4 w-4" />;
      case 'tech': return <Laptop className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lifestyle Choices</h1>
          <p className="text-gray-500">Select items that reflect your character's lifestyle</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Character Preview */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Character</CardTitle>
              <CardDescription>Your selected lifestyle items</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 mb-4">
                <CustomAvatarPreview size="lg" />
              </div>
              
              <div className="w-full mt-4">
                <h3 className="font-semibold text-sm mb-2">Selected Items:</h3>
                <div className="space-y-2">
                  {Object.entries(character.selectedAccessories || {}).length > 0 ? (
                    Object.entries(character.selectedAccessories || {}).map(([type, id]) => {
                      const accessory = avatarAccessories.find(a => a.id === id);
                      return accessory ? (
                        <Badge key={id} variant="outline" className="flex items-center justify-start p-2 w-full">
                          {getIconForType(type)}
                          <span className="ml-2 text-sm truncate">{accessory.name}</span>
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No items selected yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Item Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Options</CardTitle>
              <CardDescription>
                Choose items that reflect your lifestyle and status
              </CardDescription>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex flex-wrap mb-4">
                  {accessoryTypes.map(type => (
                    <TabsTrigger key={type} value={type} className="flex items-center">
                      {getIconForType(type)}
                      <span className="ml-2 capitalize">{type}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {accessoryTypes.map(type => (
                  <TabsContent key={type} value={type}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                      {accessoryTypeMap[type].map((accessory: AvatarAccessoryMapping, index: number) => {
                        const isSelected = character.selectedAccessories?.[type] === accessory.id;
                        return (
                          <div 
                            key={accessory.id} 
                            className={`relative p-3 border rounded-lg cursor-pointer transition-all 
                              ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => handleSelectAccessory(type, accessory.id)}
                          >
                            <div className="text-center">
                              <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center bg-gray-100 rounded-md">
                                {getIconForType(type)}
                              </div>
                              <div className="text-sm font-medium truncate">{accessory.name}</div>
                              
                              {accessory.lifestyleItemId && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Unlocked
                                  <Sparkles className="h-3 w-3 ml-1 inline text-amber-500" />
                                </div>
                              )}
                              
                              {accessory.prestigeRequired && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Prestige: {accessory.prestigeRequired}+
                                </div>
                              )}
                              
                              {accessory.defaultUnlocked && (
                                <div className="text-xs text-emerald-500 mt-1">
                                  Default
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}