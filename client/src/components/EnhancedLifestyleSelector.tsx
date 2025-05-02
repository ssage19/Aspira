import React, { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
// Audio removed
import { 
  allEnhancedLifestyleItems, 
  EnhancedLifestyleItem 
} from '../lib/data/enhancedLifestyleItems';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import {
  Activity,
  Award,
  Brain,
  Briefcase,
  Check,
  CircleDollarSign,
  Clock,
  Flame,
  Gem,
  HeartPulse,
  Info,
  Leaf,
  PartyPopper,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Users,
  Wallet,
  Wind,
  X
} from 'lucide-react';

type CategoryTab = 'owned' | 'wellness' | 'social' | 'habits' | 'education';

export function EnhancedLifestyleSelector() {
  const { 
    wealth, 
    lifestyleItems: ownedItems, 
    addWealth, 
    addLifestyleItem, 
    removeLifestyleItem,
    calculateNetWorth
  } = useCharacter();
  
  // Audio removed - using empty functions
  const playSuccess = () => {};
  const playHit = () => {};
  const [activeTab, setActiveTab] = useState<CategoryTab>('wellness');
  const [selectedItem, setSelectedItem] = useState<EnhancedLifestyleItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Filter items by category
  const filteredItems = allEnhancedLifestyleItems.filter(item => {
    if (activeTab === 'wellness') return item.type === 'wellness';
    if (activeTab === 'social') return item.type === 'social';
    if (activeTab === 'habits') return item.type === 'habit';
    if (activeTab === 'education') return item.type === 'education';
    return false;
  });
  
  // Check if the player owns a specific item
  const isItemOwned = (id: string) => {
    return ownedItems.some(item => item.id === id);
  };
  
  // Handle item purchase
  const handlePurchase = (item: EnhancedLifestyleItem) => {
    // Check if player can afford the item
    if (wealth < item.price) {
      toast.error("Not enough funds to purchase this item");
      playHit();
      return;
    }
    
    // Check if the item is already owned (for unique items)
    if (item.unique && isItemOwned(item.id)) {
      toast.error("You already own this item");
      playHit();
      return;
    }
    
    // Check prerequisites if any
    if (item.requires) {
      // Check net worth requirement
      if (item.requires.netWorth) {
        const currentNetWorth = calculateNetWorth();
        if (currentNetWorth < item.requires.netWorth) {
          toast.error(`This requires a net worth of at least ${formatCurrency(item.requires.netWorth)}`);
          playHit();
          return;
        }
      }
      
      // Check required items
      if (item.requires.itemIds && item.requires.itemIds.length > 0) {
        const hasAllRequiredItems = item.requires.itemIds.every(id => isItemOwned(id));
        if (!hasAllRequiredItems) {
          toast.error("You're missing some prerequisites for this lifestyle choice");
          playHit();
          return;
        }
      }
      
      // Check required attributes - would check character attributes if implemented
    }
    
    // Check for excluding items
    if (item.excludes && item.excludes.length > 0) {
      const hasExcludedItems = item.excludes.some(id => isItemOwned(id));
      if (hasExcludedItems) {
        toast.error("This is incompatible with one of your current lifestyle choices");
        playHit();
        return;
      }
    }
    
    // Process purchase
    addWealth(-item.price);
    
    // Create lifestyle item structure
    const lifestyleItem = {
      id: item.id,
      name: item.name,
      type: item.type as any, // Force type casting to handle new lifestyle types
      purchasePrice: item.price,
      maintenanceCost: item.maintenanceCost,
      happiness: item.happiness || 0,
      prestige: item.prestige || 0,
      purchaseDate: new Date().toISOString(),
      durationInDays: item.durationInDays,
      
      // Copy relevant attributes
      healthImpact: item.attributes.healthImpact,
      socialStatus: item.attributes.socialStatus,
      timeCommitment: item.attributes.timeCommitment,
      environmentalImpact: item.attributes.environmentalImpact,
      stressReduction: item.attributes.stressReduction,
      skillDevelopment: item.attributes.skillDevelopment,
      specialBenefits: item.attributes.specialBenefits
    };
    
    // Add item to character
    addLifestyleItem(lifestyleItem);
    
    // Avatar accessory functionality has been removed
    
    // Show success message
    toast.success(`You've acquired ${item.name}!`);
    playSuccess();
    
    // Close the details modal if open
    setShowDetails(false);
  };
  
  // Handle removing an item
  const handleRemoveItem = (id: string) => {
    removeLifestyleItem(id);
    toast.success("Item removed from your lifestyle");
  };
  
  // Open item details modal
  const openItemDetails = (item: EnhancedLifestyleItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };
  
  // Get an icon component for an attribute
  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'health': return <HeartPulse className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'environment': return <Leaf className="h-4 w-4" />;
      case 'stress': return <Wind className="h-4 w-4" />;
      case 'skill': return <Brain className="h-4 w-4" />;
      case 'special': return <Sparkles className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };
  
  // Get an icon for category tab
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wellness': return <HeartPulse className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'habits': return <Activity className="h-4 w-4" />;
      case 'education': return <Brain className="h-4 w-4" />;
      case 'owned': return <Check className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };
  
  // Format attribute value into a readable string
  const formatAttributeValue = (value: number) => {
    if (value === 0) return "Neutral";
    if (value > 0) return `+${value} Positive`;
    return `${value} Negative`;
  };
  
  // Render attribute with value bar
  const renderAttributeWithBar = (label: string, value: number, icon: React.ReactNode) => {
    let progressValue = 50; // Neutral
    if (value > 0) progressValue = 50 + (value * 10);
    if (value < 0) progressValue = 50 + (value * 10);
    
    // Color based on value
    let progressColor = "bg-gray-400"; // Neutral
    if (value > 0) progressColor = "bg-green-500";
    if (value < 0) progressColor = "bg-red-500";
    
    return (
      <div className="flex flex-col space-y-1 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {icon}
            <span className="text-xs">{label}</span>
          </div>
          <span className="text-xs font-medium">{formatAttributeValue(value)}</span>
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </div>
    );
  };
  
  // Format price display
  const formatPrice = (price: number) => {
    return (
      <div className="flex items-center justify-between text-sm">
        <span>Price:</span>
        <span className="font-semibold">{formatCurrency(price)}</span>
      </div>
    );
  };
  
  // Format maintenance cost display
  const formatMaintenance = (cost: number) => {
    if (cost === 0) return null;
    
    return (
      <div className="flex items-center justify-between text-sm text-orange-600 dark:text-orange-400">
        <span>Monthly Cost:</span>
        <span className="font-semibold">{formatCurrency(cost)}/mo</span>
      </div>
    );
  };
  
  // Format duration display
  const formatDuration = (days: number | undefined) => {
    if (!days || days === 0) return null; // Permanent item
    
    let durationText = "";
    if (days <= 30) durationText = `${days} days`;
    else if (days <= 365) durationText = `${Math.floor(days / 30)} months`;
    else durationText = `${Math.floor(days / 365)} years`;
    
    return (
      <div className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400">
        <span>Duration:</span>
        <span className="font-semibold">{durationText}</span>
      </div>
    );
  };
  
  // Render a list of all owned items
  const renderOwnedItems = () => {
    if (ownedItems.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">You haven't acquired any lifestyle items yet.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
        {ownedItems.map(item => (
          <Card key={item.id} className="overflow-hidden border border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium leading-tight">{item.name}</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this lifestyle item? 
                        This will remove all associated benefits and effects.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveItem(item.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardDescription className="text-xs mt-0.5 flex items-center">
                <Badge variant="outline" className="mr-2 px-1 py-0 text-[10px] h-4">
                  {item.type}
                </Badge>
                {item.maintenanceCost > 0 && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] h-4 text-orange-600 border-orange-300">
                    ${item.maintenanceCost}/mo
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1">
                  <PartyPopper className="h-3 w-3 text-purple-500" />
                  <span>Happiness: +{item.happiness}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  <span>Prestige: +{item.prestige}</span>
                </div>
                {/* Could add more attributes as needed */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render the grid of lifestyle items for purchase
  const renderLifestyleItems = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
        {filteredItems.map(item => {
          const isOwned = isItemOwned(item.id);
          
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer overflow-hidden border transition-all duration-150 
                ${isOwned ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700' : 'hover:border-gray-300 dark:hover:border-gray-700'}`}
              onClick={() => openItemDetails(item)}
            >
              <CardHeader className="p-3 pb-1.5">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium leading-tight">{item.name}</CardTitle>
                  {isOwned && <Check className="h-4 w-4 text-green-500" />}
                </div>
                <CardDescription className="text-xs flex items-center mt-0.5">
                  <Badge variant="outline" className="mr-2 px-1 py-0 text-[10px] h-4">
                    {item.type}
                  </Badge>
                  {item.maintenanceCost > 0 && (
                    <Badge variant="outline" className="px-1 py-0 text-[10px] h-4 text-orange-600 border-orange-300">
                      ${item.maintenanceCost}/mo
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0">
                <div className="text-xs space-y-1 mb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <PartyPopper className="h-3 w-3 text-purple-500" />
                      <span>Happiness: +{item.happiness}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      <span>Prestige: +{item.prestige}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Render the detailed modal view for a selected item
  const renderItemDetailsModal = () => {
    if (!selectedItem) return null;
    
    const isOwned = isItemOwned(selectedItem.id);
    const canAfford = wealth >= selectedItem.price;
    
    // Format purchase button
    const renderPurchaseButton = () => {
      if (isOwned && selectedItem.unique) {
        return (
          <Button disabled className="w-full mt-4">
            <Check className="h-4 w-4 mr-2" />
            Already Owned
          </Button>
        );
      }
      
      if (!canAfford) {
        return (
          <Button disabled className="w-full mt-4 bg-red-500 hover:bg-red-600">
            <Wallet className="h-4 w-4 mr-2" />
            Can't Afford
          </Button>
        );
      }
      
      return (
        <Button className="w-full mt-4" onClick={() => handlePurchase(selectedItem)}>
          <CircleDollarSign className="h-4 w-4 mr-2" />
          Purchase - {formatCurrency(selectedItem.price)}
        </Button>
      );
    };
    
    return (
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center">
              <div>{selectedItem.name}</div>
              <Badge className="ml-2">{selectedItem.type}</Badge>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left">
                {/* Price info */}
                <div className="space-y-1 mb-4">
                  {formatPrice(selectedItem.price)}
                  {formatMaintenance(selectedItem.maintenanceCost)}
                  {formatDuration(selectedItem.durationInDays)}
                </div>
                
                {/* Description */}
                <p className="text-sm mb-4">{selectedItem.description}</p>
                
                {/* Stats Impact */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-1">
                      <PartyPopper className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Happiness</span>
                    </div>
                    <span className="text-sm font-medium">+{selectedItem.happiness}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Prestige</span>
                    </div>
                    <span className="text-sm font-medium">+{selectedItem.prestige}</span>
                  </div>
                </div>
                
                {/* Attribute Impacts */}
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Effects & Attributes</h4>
                  
                  {renderAttributeWithBar(
                    "Health Impact",
                    selectedItem.attributes.healthImpact,
                    getAttributeIcon('health')
                  )}
                  
                  {renderAttributeWithBar(
                    "Social Status",
                    selectedItem.attributes.socialStatus,
                    getAttributeIcon('social')
                  )}
                  
                  {renderAttributeWithBar(
                    "Time Commitment",
                    selectedItem.attributes.timeCommitment,
                    getAttributeIcon('time')
                  )}
                  
                  {renderAttributeWithBar(
                    "Environmental Impact",
                    selectedItem.attributes.environmentalImpact,
                    getAttributeIcon('environment')
                  )}
                  
                  {renderAttributeWithBar(
                    "Stress Reduction",
                    selectedItem.attributes.stressReduction,
                    getAttributeIcon('stress')
                  )}
                  
                  {renderAttributeWithBar(
                    "Skill Development",
                    selectedItem.attributes.skillDevelopment,
                    getAttributeIcon('skill')
                  )}
                </div>
                
                {/* Special Benefits */}
                {selectedItem.attributes.specialBenefits && (
                  <div className="pt-2 mt-2 border-t">
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <Gem className="h-4 w-4 mr-1.5 text-cyan-500" />
                      Special Benefits
                    </h4>
                    <p className="text-sm">{selectedItem.attributes.specialBenefits}</p>
                  </div>
                )}
                
                {/* Purchase Button */}
                {renderPurchaseButton()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  // Main component render
  return (
    <div className="w-full max-w-2xl mx-auto p-1 sm:p-4 bg-white dark:bg-gray-950 rounded-lg overflow-hidden">
      <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="bg-white dark:bg-gray-950">
          <Tabs defaultValue="wellness" value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryTab)}>
            <TabsList className="flex w-full border-b bg-transparent">
              <TabsTrigger value="owned" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
                <span className="mr-1 flex-shrink-0">
                  {React.cloneElement(getCategoryIcon('owned'), { className: 'h-3 w-3' })}
                </span>
                <span className="whitespace-nowrap text-xs">Owned</span>
              </TabsTrigger>
              <TabsTrigger value="wellness" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
                <span className="mr-1 flex-shrink-0">
                  {React.cloneElement(getCategoryIcon('wellness'), { className: 'h-3 w-3' })}
                </span>
                <span className="whitespace-nowrap text-xs">Wellness</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
                <span className="mr-1 flex-shrink-0">
                  {React.cloneElement(getCategoryIcon('social'), { className: 'h-3 w-3' })}
                </span>
                <span className="whitespace-nowrap text-xs">Social</span>
              </TabsTrigger>
              <TabsTrigger value="habits" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
                <span className="mr-1 flex-shrink-0">
                  {React.cloneElement(getCategoryIcon('habits'), { className: 'h-3 w-3' })}
                </span>
                <span className="whitespace-nowrap text-xs">Habits</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
                <span className="mr-1 flex-shrink-0">
                  {React.cloneElement(getCategoryIcon('education'), { className: 'h-3 w-3' })}
                </span>
                <span className="whitespace-nowrap text-xs">Education</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="owned">
              {renderOwnedItems()}
            </TabsContent>
            
            <TabsContent value="wellness">
              {renderLifestyleItems()}
            </TabsContent>
            
            <TabsContent value="social">
              {renderLifestyleItems()}
            </TabsContent>
            
            <TabsContent value="habits">
              {renderLifestyleItems()}
            </TabsContent>
            
            <TabsContent value="education">
              {renderLifestyleItems()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {renderItemDetailsModal()}
    </div>
  );
}