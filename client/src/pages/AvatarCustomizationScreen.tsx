import React, { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import CustomAvatarPreview from '../components/CustomAvatarPreview';
import { 
  avatarAccessories, 
  getAvailableAccessories, 
  getAccessoriesByType,
  AvatarAccessoryType 
} from '../lib/data/avatarAccessories';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Brush, 
  Shirt, 
  Glasses, 
  Palette, 
  ArrowLeft, 
  ChevronLeft, 
  Sparkles 
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function AvatarCustomizationScreen() {
  const navigate = useNavigate();
  const character = useCharacter();
  const [activeTab, setActiveTab] = useState<string>('body');
  
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
  
  // Handle accessory removal
  const handleRemoveAccessory = (type: string) => {
    character.removeAccessory(type);
  };
  
  // Get icon for accessory type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'body': return <User className="h-4 w-4" />;
      case 'hair': return <Brush className="h-4 w-4" />;
      case 'outfit': return <Shirt className="h-4 w-4" />;
      case 'eyewear': return <Glasses className="h-4 w-4" />;
      case 'accessory': return <Sparkles className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };
  
  // Handle skin tone change
  const handleSkinToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    character.updateAvatarSkinTone(e.target.value);
  };
  
  // Handle eye color change
  const handleEyeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    character.updateAvatarEyeColor(e.target.value);
  };
  
  // Handle body type change
  const handleBodyTypeChange = (bodyType: 'slim' | 'average' | 'athletic') => {
    character.updateAvatarBodyType(bodyType);
  };
  
  // Handle height change
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    character.updateAvatarHeight(parseFloat(e.target.value));
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Avatar Customization</h1>
          <p className="text-gray-500">Customize your avatar's appearance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Avatar</CardTitle>
              <CardDescription>Preview your character</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 mb-4">
                <CustomAvatarPreview size="lg" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 w-full">
                {Object.entries(character.selectedAccessories || {}).map(([type, id]) => {
                  const accessory = avatarAccessories.find(a => a.id === id);
                  return accessory ? (
                    <Badge key={id} variant="outline" className="flex items-center justify-center">
                      {getIconForType(type)}
                      <span className="ml-1 text-xs truncate">{accessory.name}</span>
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Physical Features</CardTitle>
              <CardDescription>Adjust your avatar's appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Skin Tone</Label>
                  <div className="flex items-center mt-2">
                    <Input 
                      type="color" 
                      value={character.avatarSkinTone || '#F5D0A9'} 
                      onChange={handleSkinToneChange}
                      className="w-12 h-8 p-1" 
                    />
                    <div 
                      className="ml-4 w-8 h-8 rounded-full border" 
                      style={{ backgroundColor: character.avatarSkinTone || '#F5D0A9' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <Label>Eye Color</Label>
                  <div className="flex items-center mt-2">
                    <Input 
                      type="color" 
                      value={character.avatarEyeColor || '#6B8E23'} 
                      onChange={handleEyeColorChange}
                      className="w-12 h-8 p-1"
                    />
                    <div 
                      className="ml-4 w-8 h-8 rounded-full border" 
                      style={{ backgroundColor: character.avatarEyeColor || '#6B8E23' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <Label>Body Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant={character.avatarBodyType === 'slim' ? 'default' : 'outline'}
                      onClick={() => handleBodyTypeChange('slim')}
                    >
                      Slim
                    </Button>
                    <Button 
                      size="sm" 
                      variant={character.avatarBodyType === 'average' ? 'default' : 'outline'}
                      onClick={() => handleBodyTypeChange('average')}
                    >
                      Average
                    </Button>
                    <Button 
                      size="sm" 
                      variant={character.avatarBodyType === 'athletic' ? 'default' : 'outline'}
                      onClick={() => handleBodyTypeChange('athletic')}
                    >
                      Athletic
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Height: {Math.round(((character.avatarHeight || 0.5) * 100))}%</Label>
                  <Input 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.01" 
                    value={character.avatarHeight || 0.5} 
                    onChange={handleHeightChange}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Accessory Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Accessories</CardTitle>
              <CardDescription>
                Customize your avatar with accessories from your lifestyle choices
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
                      {accessoryTypeMap[type].map((accessory, index) => {
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