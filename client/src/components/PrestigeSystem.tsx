import React, { useState } from 'react';
import { usePrestige, prestigeBonuses, PrestigeBonus } from '../lib/stores/usePrestige';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  ArrowUpCircle, 
  Sparkles, 
  Clock, 
  Award, 
  DollarSign, 
  BarChart, 
  AlertTriangle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useCharacter } from '../lib/stores/useCharacter';

// Component for displaying individual prestige bonuses
const PrestigeBonusCard: React.FC<{ bonus: PrestigeBonus }> = ({ bonus }) => {
  const { prestigePoints, purchaseBonus, hasPurchasedBonus } = usePrestige();
  const isPurchased = hasPurchasedBonus(bonus.id);
  const canAfford = prestigePoints >= bonus.cost;
  
  return (
    <Card className={`border-primary/30 shadow-md transition-all ${
      isPurchased 
        ? 'bg-primary/10 border-primary' 
        : canAfford 
          ? 'hover:border-primary cursor-pointer' 
          : 'opacity-70'
    }`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{bonus.name}</CardTitle>
          <Badge className={isPurchased ? 'bg-primary' : 'bg-muted'}>
            {isPurchased ? 'Unlocked' : `${bonus.cost} points`}
          </Badge>
        </div>
        <CardDescription>{bonus.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="text-sm bg-muted/30 p-2 rounded-md border border-primary/20">
          <span className="font-medium">{bonus.effect}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button 
          variant={isPurchased ? "outline" : "default"}
          className="w-full"
          disabled={isPurchased || !canAfford}
          onClick={() => {
            if (!isPurchased && canAfford) {
              purchaseBonus(bonus.id);
            }
          }}
        >
          {isPurchased ? 'Unlocked' : canAfford ? 'Purchase' : 'Insufficient Points'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component for confirmation dialog
interface ConfirmResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pointsToEarn: number;
  currentWealth: number;
}

const ConfirmResetDialog: React.FC<ConfirmResetDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  pointsToEarn,
  currentWealth
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Confirm Prestige Reset
          </DialogTitle>
          <DialogDescription>
            You're about to reset your progress and start over with prestige bonuses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-lg font-semibold">You will gain <span className="text-yellow-500">{pointsToEarn} Prestige Points</span></p>
            <p className="text-sm text-muted-foreground">Based on your current wealth of {formatCurrency(currentWealth)}</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex gap-2 items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Warning</span>
            </div>
            <p className="text-sm">You will lose all progress including:</p>
            <ul className="text-sm mt-2 list-disc pl-5">
              <li>Current wealth and assets</li>
              <li>Properties and investments</li>
              <li>Career progress and skills</li>
              <li>Lifestyle items</li>
            </ul>
          </div>
          
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex gap-2 items-center mb-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold">You will keep</span>
            </div>
            <ul className="text-sm mt-2 list-disc pl-5">
              <li>Prestige points and levels</li>
              <li>Unlocked prestige bonuses</li>
              <li>Achievement progress</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Reset and Gain Prestige
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main prestige system component
export function PrestigeSystem() {
  const { level, prestigePoints, totalEarnedPoints, lifetimeResets, lastResetTime, lastResetWealth, confirmReset } = usePrestige();
  const character = useCharacter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Calculate next level progress
  const pointsForNextLevel = (Math.floor(totalEarnedPoints / 5) + 1) * 5;
  const progress = ((totalEarnedPoints % 5) / 5) * 100;
  
  // Calculate potential prestige points from current wealth
  const potentialPoints = Math.max(1, Math.floor(Math.log10(character.wealth) * 2));
  const canPrestige = character.wealth >= 100000;
  
  // Handle the reset confirmation
  const handleResetConfirm = async () => {
    const success = await confirmReset();
    if (success) {
      toast.success("Game has been reset! You'll now start fresh with prestige bonuses.");
    }
  };
  
  return (
    <Card className="backdrop-blur-md border-primary/20 bg-background/30 shadow-lg rounded-xl overflow-hidden">
      {/* Soft glow elements */}
      <div className="absolute -bottom-2 -right-2 h-32 w-32 bg-yellow-500/20 blur-3xl rounded-full"></div>
      <div className="absolute -top-2 -left-2 h-24 w-24 bg-primary/20 blur-3xl rounded-full"></div>
      
      <CardHeader className="pb-2 border-b border-primary/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <span className="gradient-text">Prestige System</span>
          </CardTitle>
          <Badge 
            className="px-3 py-1 text-md bg-yellow-500 hover:bg-yellow-600"
            variant="default"
          >
            Level {level}
          </Badge>
        </div>
        <CardDescription>Reset your progress to earn prestige points and permanent bonuses</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-background/50 backdrop-blur-md border border-primary/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            <TabsTrigger value="bonuses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Prestige Bonuses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Current Prestige Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Current Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Prestige Level:</span>
                      <span className="font-semibold text-lg">{level}</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Progress to Level {level + 1}</span>
                        <span>{totalEarnedPoints % 5}/5 points</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Available Points:</span>
                      <span className="font-semibold text-lg text-yellow-500">{prestigePoints}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Earned:</span>
                      <span className="font-semibold">{totalEarnedPoints} points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Lifetime Resets:</span>
                      <span className="font-semibold">{lifetimeResets}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    Prestige Reset
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="bg-muted/30 p-3 rounded-md border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Current Wealth:</span>
                      <span className="font-semibold">{formatCurrency(character.wealth)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Potential Points:</span>
                      <span className="font-semibold text-yellow-500">{potentialPoints}</span>
                    </div>
                    {!canPrestige && (
                      <div className="mt-2 text-sm text-orange-500">
                        You need at least $100,000 to gain prestige points.
                      </div>
                    )}
                  </div>
                  
                  {lastResetTime > 0 && (
                    <div className="text-sm flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Last reset: {formatDate(new Date(lastResetTime))} with {formatCurrency(lastResetWealth)}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600"
                    disabled={!canPrestige}
                    onClick={() => setIsResetDialogOpen(true)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Reset and Gain Prestige
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Active Bonuses Summary */}
            <Card className="border-primary/30">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Active Prestige Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {
                    prestigeBonuses
                      .filter(bonus => usePrestige.getState().hasPurchasedBonus(bonus.id))
                      .map(bonus => (
                        <div 
                          key={bonus.id}
                          className="p-3 rounded-md border border-primary/30 bg-primary/5"
                        >
                          <div className="font-medium mb-1">{bonus.name}</div>
                          <div className="text-sm text-muted-foreground">{bonus.effect}</div>
                        </div>
                      ))
                  }
                  {
                    prestigeBonuses.filter(bonus => usePrestige.getState().hasPurchasedBonus(bonus.id)).length === 0 && (
                      <div className="col-span-2 text-center text-muted-foreground py-4">
                        No prestige bonuses unlocked yet. Visit the Bonuses tab to spend your points.
                      </div>
                    )
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bonuses" className="mt-0">
            <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Available Prestige Points:
                </h3>
                <span className="text-xl font-bold text-yellow-500">{prestigePoints}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Spend your prestige points to unlock permanent bonuses that persist across game resets.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {
                prestigeBonuses.map(bonus => (
                  <PrestigeBonusCard key={bonus.id} bonus={bonus} />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Prestige Reset Confirmation Dialog */}
      <ConfirmResetDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={handleResetConfirm}
        pointsToEarn={potentialPoints}
        currentWealth={character.wealth}
      />
    </Card>
  );
}

export default PrestigeSystem;