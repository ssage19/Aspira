import React, { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useAudio } from '../lib/stores/useAudio';
import { 
  allEnhancedLifestyleItems, 
  EnhancedLifestyleItem 
} from '../lib/data/enhancedLifestyleItems';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { AvatarPreview } from './AvatarPreview';
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
  
  const { playSuccess, playHit } = useAudio();
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
    
    // Play success sound
    playSuccess();
    
    // Show appropriate toast message
    if (item.durationInDays) {
      toast.success(
        <div>
          <p className="font-bold">Purchased {item.name}</p>
          <p className="text-sm mt-1">
            Duration: {item.durationInDays} {item.durationInDays === 1 ? 'day' : 'days'}
          </p>
        </div>,
        { duration: 4000 }
      );
    } else {
      toast.success(`Added ${item.name} to your lifestyle`);
    }
    
    // Show special effects toast if item has chronicHealthCondition
    if (item.attributes.chronicHealthCondition) {
      const healthEffect = item.attributes.chronicHealthCondition[0];
      if (healthEffect.healthImpactPerMonth > 0) {
        setTimeout(() => {
          toast.success(
            <div>
              <p className="font-bold">Health Benefit</p>
              <p className="text-sm mt-1">{healthEffect.description}</p>
            </div>,
            { duration: 4000 }
          );
        }, 1500);
      } else if (healthEffect.healthImpactPerMonth < 0) {
        setTimeout(() => {
          toast.warning(
            <div>
              <p className="font-bold">Health Note</p>
              <p className="text-sm mt-1">{healthEffect.description}</p>
            </div>,
            { duration: 4000 }
          );
        }, 1500);
      }
    }
  };
  
  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    const item = ownedItems.find(i => i.id === itemId);
    if (!item) return;
    
    removeLifestyleItem(itemId);
    
    toast.success(`Removed ${item.name} from your lifestyle`);
  };
  
  // Open item details modal
  const showItemDetails = (item: EnhancedLifestyleItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };
  
  // Convert tier to badge variant
  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'basic': return 'secondary';
      case 'premium': return 'default';
      case 'luxury': return 'outline';
      case 'elite': return 'secondary';
      default: return 'secondary';
    }
  };
  
  // Get icon for category
  const getCategoryIcon = (category: CategoryTab) => {
    switch (category) {
      case 'wellness': return <HeartPulse className="h-4 w-4 mr-2" />;
      case 'social': return <Users className="h-4 w-4 mr-2" />;
      case 'habits': return <Activity className="h-4 w-4 mr-2" />;
      case 'education': return <Brain className="h-4 w-4 mr-2" />;
      case 'owned': return <Check className="h-4 w-4 mr-2" />;
      default: return <Sparkles className="h-4 w-4 mr-2" />;
    }
  };
  
  // Render sustainability rating
  const renderSustainabilityRating = (rating: number) => {
    let color = 'bg-red-500';
    if (rating >= 30 && rating < 50) color = 'bg-orange-500';
    else if (rating >= 50 && rating < 70) color = 'bg-yellow-500';
    else if (rating >= 70 && rating < 90) color = 'bg-emerald-500';
    else if (rating >= 90) color = 'bg-green-500';
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-secondary mb-1">
          <span className="flex items-center">
            <Leaf className="h-3 w-3 mr-1" />
            <span>Sustainability:</span>
          </span>
          <span>{rating}%</span>
        </div>
        <Progress 
          value={rating} 
          max={100} 
          className="h-1.5" 
          indicatorClassName={color}
        />
      </div>
    );
  };
  
  // Render attribute impact
  const renderAttribute = (
    icon: React.ReactNode, 
    label: string, 
    value: number | undefined,
    positive: boolean = true
  ) => {
    if (value === undefined || value === 0) return null;
    
    const isPositive = positive ? value > 0 : value < 0;
    const textColor = isPositive ? 'text-green-600' : 'text-red-500';
    const sign = isPositive ? '+' : '';
    
    return (
      <div className={`flex items-center ${textColor} text-xs my-1`}>
        {icon}
        <span className="ml-1">{label}: {sign}{value}</span>
      </div>
    );
  };
  
  // Render owned items list
  const renderOwnedItems = () => {
    if (ownedItems.length === 0) {
      return (
        <div className="text-center p-10">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-primary mb-1">No lifestyle choices yet</h3>
          <p className="text-sm text-secondary">
            Enhance your character by adding lifestyle choices that match your goals
          </p>
        </div>
      );
    }
    
    // Filter to only enhanced lifestyle items
    const enhancedOwnedItems = ownedItems.filter(item => 
      allEnhancedLifestyleItems.some(enhancedItem => enhancedItem.id === item.id)
    );
    
    if (enhancedOwnedItems.length === 0) {
      return (
        <div className="text-center p-10">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-primary mb-1">No enhanced lifestyle choices yet</h3>
          <p className="text-sm text-secondary">
            Explore the new lifestyle categories to make more impactful choices
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enhancedOwnedItems.map(item => {
          // Find the enhanced item definition
          const enhancedItem = allEnhancedLifestyleItems.find(i => i.id === item.id);
          if (!enhancedItem) return null;
          
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant={getTierBadgeVariant(enhancedItem.tier)}>
                    {enhancedItem.tier}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center">
                    <CircleDollarSign className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    <span>
                      {item.maintenanceCost && item.maintenanceCost > 0 ? `${formatCurrency(item.maintenanceCost)}/month` : 'No monthly cost'}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-secondary mb-3">
                  {enhancedItem.description}
                </p>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {renderAttribute(
                    <HeartPulse className="h-3 w-3" />, 
                    "Health", 
                    enhancedItem.attributes.healthImpact
                  )}
                  {renderAttribute(
                    <Clock className="h-3 w-3" />, 
                    "Time", 
                    enhancedItem.attributes.timeCommitment,
                    false
                  )}
                  {renderAttribute(
                    <Users className="h-3 w-3" />, 
                    "Social", 
                    enhancedItem.attributes.socialStatus
                  )}
                  {renderAttribute(
                    <Wind className="h-3 w-3" />, 
                    "Stress", 
                    enhancedItem.attributes.stressReduction
                  )}
                </div>
                
                {enhancedItem.sustainabilityRating && 
                  renderSustainabilityRating(enhancedItem.sustainabilityRating)
                }
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => showItemDetails(enhancedItem)}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Details
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Render lifestyle choices by category
  const renderLifestyleItems = () => {
    if (filteredItems.length === 0) {
      return (
        <div className="text-center p-10">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-primary mb-1">No items in this category</h3>
          <p className="text-sm text-secondary">
            Try another category to find more lifestyle choices
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant={getTierBadgeVariant(item.tier)}>
                  {item.tier}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center">
                  <Wallet className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  <span>Cost: {formatCurrency(item.price)}</span>
                </div>
                {item.maintenanceCost && item.maintenanceCost > 0 && (
                  <div className="flex items-center mt-1">
                    <CircleDollarSign className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    <span>{formatCurrency(item.maintenanceCost)}/month</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm text-secondary mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {renderAttribute(
                  <HeartPulse className="h-3 w-3" />, 
                  "Health", 
                  item.attributes.healthImpact
                )}
                {renderAttribute(
                  <Clock className="h-3 w-3" />, 
                  "Time", 
                  item.attributes.timeCommitment,
                  false
                )}
                {renderAttribute(
                  <Users className="h-3 w-3" />, 
                  "Social", 
                  item.attributes.socialStatus
                )}
                {renderAttribute(
                  <Wind className="h-3 w-3" />, 
                  "Stress", 
                  item.attributes.stressReduction
                )}
                {renderAttribute(
                  <Trophy className="h-3 w-3" />, 
                  "Prestige", 
                  item.prestige
                )}
                {renderAttribute(
                  <PartyPopper className="h-3 w-3" />, 
                  "Happiness", 
                  item.happiness
                )}
              </div>
              
              {item.sustainabilityRating && 
                renderSustainabilityRating(item.sustainabilityRating)
              }
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => showItemDetails(item)}
              >
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>
              
              {isItemOwned(item.id) ? (
                <Button variant="secondary" size="sm" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  Owned
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handlePurchase(item)}
                  disabled={wealth < item.price}
                >
                  <Gem className="h-4 w-4 mr-1" />
                  Purchase
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render item details modal
  const renderItemDetailsModal = () => {
    if (!selectedItem) return null;
    
    return (
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              <span>{selectedItem.name}</span>
              <Badge variant={getTierBadgeVariant(selectedItem.tier)}>
                {selectedItem.tier}
              </Badge>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Wallet className="h-4 w-4 mr-1 text-gray-600" />
                  Financial Details
                </h4>
                <div className="space-y-1 text-sm">
                  <p>Initial Cost: {formatCurrency(selectedItem.price)}</p>
                  <p>Monthly Cost: {formatCurrency(selectedItem.maintenanceCost)}</p>
                  {selectedItem.requires?.netWorth && (
                    <p className="text-amber-600">
                      Requires Net Worth: {formatCurrency(selectedItem.requires.netWorth)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-gray-600" />
                  Core Benefits
                </h4>
                <div className="space-y-1 text-sm">
                  <p>Happiness: +{selectedItem.happiness}</p>
                  <p>Prestige: +{selectedItem.prestige}</p>
                  {selectedItem.durationInDays && (
                    <p>Duration: {selectedItem.durationInDays} days</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Direct Attributes Section */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-1 text-blue-600" />
                Immediate Attribute Effects
              </h4>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {selectedItem.attributes.healthImpact !== undefined && (
                  <div className="flex items-center">
                    <HeartPulse className={`h-4 w-4 mr-1 ${selectedItem.attributes.healthImpact >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span>Health: {selectedItem.attributes.healthImpact >= 0 ? '+' : ''}{selectedItem.attributes.healthImpact}</span>
                  </div>
                )}
                
                {selectedItem.attributes.socialStatus !== undefined && (
                  <div className="flex items-center">
                    <Users className={`h-4 w-4 mr-1 ${selectedItem.attributes.socialStatus >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
                    <span>Social Status: {selectedItem.attributes.socialStatus >= 0 ? '+' : ''}{selectedItem.attributes.socialStatus}</span>
                  </div>
                )}
                
                {selectedItem.attributes.timeCommitment !== undefined && (
                  <div className="flex items-center">
                    <Clock className={`h-4 w-4 mr-1 ${selectedItem.attributes.timeCommitment <= 0 ? 'text-green-500' : 'text-amber-500'}`} />
                    <span>Time Commitment: {selectedItem.attributes.timeCommitment > 0 ? '+' : ''}{selectedItem.attributes.timeCommitment} hrs/week</span>
                  </div>
                )}
                
                {selectedItem.attributes.stressReduction !== undefined && (
                  <div className="flex items-center">
                    <Wind className={`h-4 w-4 mr-1 ${selectedItem.attributes.stressReduction >= 0 ? 'text-teal-500' : 'text-red-500'}`} />
                    <span>Stress Reduction: {selectedItem.attributes.stressReduction >= 0 ? '+' : ''}{selectedItem.attributes.stressReduction}</span>
                  </div>
                )}
                
                {selectedItem.attributes.environmentalImpact !== undefined && (
                  <div className="flex items-center">
                    <Leaf className={`h-4 w-4 mr-1 ${selectedItem.attributes.environmentalImpact >= 0 ? 'text-green-500' : 'text-gray-500'}`} />
                    <span>Environmental Impact: {selectedItem.attributes.environmentalImpact >= 0 ? '+' : ''}{selectedItem.attributes.environmentalImpact}</span>
                  </div>
                )}
                
                {selectedItem.attributes.skillDevelopment !== undefined && (
                  <div className="flex items-center">
                    <Brain className={`h-4 w-4 mr-1 ${selectedItem.attributes.skillDevelopment >= 0 ? 'text-purple-500' : 'text-red-500'}`} />
                    <span>Skill Development: {selectedItem.attributes.skillDevelopment >= 0 ? '+' : ''}{selectedItem.attributes.skillDevelopment}</span>
                  </div>
                )}
              </div>
              
              {selectedItem.sustainabilityRating !== undefined && (
                <div className="mt-3">
                  {renderSustainabilityRating(selectedItem.sustainabilityRating)}
                </div>
              )}
            </div>
            
            {/* Long-term Effects Section */}
            {(selectedItem.attributes.chronicHealthCondition || 
              selectedItem.attributes.mentalHealthEffects || 
              selectedItem.attributes.personalGrowth || 
              selectedItem.attributes.careerEffects) && (
              <div className="bg-emerald-50 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Flame className="h-4 w-4 mr-1 text-emerald-600" />
                  Long-term Effects
                </h4>
                
                <div className="space-y-3 text-sm">
                  {selectedItem.attributes.chronicHealthCondition?.map((condition, index) => (
                    <div key={`health-${index}`} className="p-2 bg-white rounded-md">
                      <h5 className={`font-medium flex items-center ${condition.healthImpactPerMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <HeartPulse className="h-3.5 w-3.5 mr-1" />
                        {condition.name}
                      </h5>
                      <p className="text-gray-600 mt-1">{condition.description}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <span>Monthly Health Impact: {condition.healthImpactPerMonth >= 0 ? '+' : ''}{condition.healthImpactPerMonth}</span>
                        {condition.treatmentCostPerMonth && (
                          <span className="ml-3">Treatment: {formatCurrency(condition.treatmentCostPerMonth)}/month</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {selectedItem.attributes.mentalHealthEffects?.map((effect, index) => (
                    <div key={`mental-${index}`} className="p-2 bg-white rounded-md">
                      <h5 className={`font-medium flex items-center ${effect.type === 'positive' ? 'text-blue-600' : 'text-amber-600'}`}>
                        <Brain className="h-3.5 w-3.5 mr-1" />
                        Mental Health {effect.type === 'positive' ? 'Benefit' : 'Impact'}
                      </h5>
                      <p className="text-gray-600 mt-1">{effect.description}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <span>Monthly Happiness: {effect.happinessImpactPerMonth >= 0 ? '+' : ''}{effect.happinessImpactPerMonth}</span>
                        <span className="ml-3">Monthly Stress: {effect.stressImpactPerMonth >= 0 ? '+' : ''}{effect.stressImpactPerMonth}</span>
                      </div>
                    </div>
                  ))}
                  
                  {selectedItem.attributes.careerEffects?.map((effect, index) => (
                    <div key={`career-${index}`} className="p-2 bg-white rounded-md">
                      <h5 className="font-medium flex items-center text-purple-600">
                        <Briefcase className="h-3.5 w-3.5 mr-1" />
                        Career Impact: {effect.aspect}
                      </h5>
                      <p className="text-gray-600 mt-1">{effect.description}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <span>Prestige Impact: +{effect.prestigeImpact}</span>
                        {effect.incomeMultiplier && (
                          <span className="ml-3">Income Potential: ×{effect.incomeMultiplier.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {selectedItem.attributes.personalGrowth?.map((growth, index) => (
                    <div key={`growth-${index}`} className="p-2 bg-white rounded-md">
                      <h5 className="font-medium flex items-center text-indigo-600">
                        <Award className="h-3.5 w-3.5 mr-1" />
                        Personal Growth: {growth.area}
                      </h5>
                      <p className="text-gray-600 mt-1">{growth.description}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        {growth.skillImpact.map((impact, i) => (
                          <span key={`skill-${i}`} className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5">
                            {impact.skillName}: +{impact.value}/month
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Synergies & Conflicts Section */}
            {(selectedItem.attributes.synergies || selectedItem.attributes.conflicts) && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-amber-600" />
                  Synergies & Conflicts
                </h4>
                
                <div className="space-y-3 text-sm">
                  {selectedItem.attributes.synergies?.map((synergy, index) => {
                    const synergyItem = allEnhancedLifestyleItems.find(item => item.id === synergy.itemId);
                    return (
                      <div key={`synergy-${index}`} className="p-2 bg-green-50 border border-green-100 rounded-md">
                        <h5 className="font-medium flex items-center text-green-600">
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Synergy with {synergyItem?.name || 'another lifestyle choice'}
                        </h5>
                        <p className="text-gray-600 mt-1">{synergy.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                          {synergy.bonusEffects.map((effect, i) => (
                            <span key={`effect-${i}`} className="bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                              {effect.attribute}: {effect.value >= 0 ? '+' : ''}{effect.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedItem.attributes.conflicts?.map((conflict, index) => {
                    const conflictItem = allEnhancedLifestyleItems.find(item => item.id === conflict.itemId);
                    return (
                      <div key={`conflict-${index}`} className="p-2 bg-red-50 border border-red-100 rounded-md">
                        <h5 className="font-medium flex items-center text-red-600">
                          <X className="h-3.5 w-3.5 mr-1" />
                          Conflict with {conflictItem?.name || 'another lifestyle choice'}
                        </h5>
                        <p className="text-gray-600 mt-1">{conflict.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs">
                          {conflict.penaltyEffects.map((effect, i) => (
                            <span key={`effect-${i}`} className="bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                              {effect.attribute}: {effect.value >= 0 ? '+' : ''}{effect.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Special Triggers Section */}
            {selectedItem.attributes.specialTriggers && (
              <div className="bg-purple-50 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Gem className="h-4 w-4 mr-1 text-purple-600" />
                  Special Opportunities
                </h4>
                
                <div className="space-y-3 text-sm">
                  {selectedItem.attributes.specialTriggers.map((trigger, index) => (
                    <div key={`trigger-${index}`} className="p-2 bg-white rounded-md">
                      <p className="text-gray-800">{trigger.description}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>Trigger type: {trigger.triggerType}</span>
                        <span className="ml-2">Chance: {Math.round(trigger.probability * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Requirements & Restrictions */}
            {(selectedItem.requires || selectedItem.excludes) && (
              <div className="bg-amber-50 p-4 rounded-md">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-1 text-amber-600" />
                  Requirements & Restrictions
                </h4>
                
                <div className="space-y-3 text-sm">
                  {selectedItem.requires?.itemIds && selectedItem.requires.itemIds.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-700">Prerequisites:</p>
                      <ul className="list-disc list-inside ml-2 text-gray-700">
                        {selectedItem.requires.itemIds.map((id, index) => {
                          const requiredItem = allEnhancedLifestyleItems.find(item => item.id === id);
                          return (
                            <li key={`req-${index}`}>
                              {requiredItem?.name || `Item ID: ${id}`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {selectedItem.excludes && selectedItem.excludes.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-700">Conflicts with:</p>
                      <ul className="list-disc list-inside ml-2 text-gray-700">
                        {selectedItem.excludes.map((id, index) => {
                          const excludedItem = allEnhancedLifestyleItems.find(item => item.id === id);
                          return (
                            <li key={`exc-${index}`}>
                              {excludedItem?.name || `Item ID: ${id}`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>Close</AlertDialogCancel>
            {!isItemOwned(selectedItem.id) && (
              <AlertDialogAction
                onClick={() => handlePurchase(selectedItem)}
                disabled={wealth < selectedItem.price}
              >
                Purchase ({formatCurrency(selectedItem.price)})
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  return (
    <div>
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Enhanced Lifestyle Choices</h2>
        <p className="text-sm text-indigo-700">
          These lifestyle choices have deeper impacts on your character's attributes, career, relationships, and health.
          Choose wisely as they interact with each other in complex ways.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <AvatarPreview />
        </div>
        
        {/* Lifestyle Choices */}
        <div className="lg:col-span-3">
      
      <Tabs value={activeTab} defaultValue="wellness" onValueChange={(value) => setActiveTab(value as CategoryTab)}>
        <TabsList className="mb-6 flex flex-wrap gap-0.5">
          <TabsTrigger value="owned" className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[70px]">
            <span className="mr-1 flex-shrink-0">
              {React.cloneElement(getCategoryIcon('owned'), { className: 'h-3 w-3' })}
            </span>
            <span className="whitespace-nowrap text-xs">My Choices</span>
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
      
      {renderItemDetailsModal()}
        </div>
      </div>
    </div>
  );
}