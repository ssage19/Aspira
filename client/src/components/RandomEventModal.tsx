import React, { useState } from 'react';
import { useRandomEvents, EventChoice } from '../lib/stores/useRandomEvents';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Clock, AlertCircle, TrendingUp, TrendingDown, Heart, Award, Zap, DollarSign, BookOpen, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

export function RandomEventModal() {
  const { currentEvent, makeChoice, dismissEvent } = useRandomEvents();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // If no current event, don't render anything
  if (!currentEvent) return null;

  // Handle choosing an option
  const handleChoice = (index: number) => {
    setSelectedChoice(index);
    
    // Delay to allow animation to play
    setTimeout(() => {
      makeChoice(index);
      setSelectedChoice(null);
    }, 500);
  };

  // Get appropriate icon based on outcome type
  const getOutcomeIcon = (key: string, isPositive: boolean) => {
    switch (key) {
      case 'wealth':
        return isPositive ? <DollarSign className="text-emerald-500" size={16} /> : <DollarSign className="text-red-500" size={16} />;
      case 'income':
        return isPositive ? <TrendingUp className="text-emerald-500" size={16} /> : <TrendingDown className="text-red-500" size={16} />;
      case 'happiness':
        return isPositive ? <Heart className="text-pink-500" size={16} /> : <Heart className="text-red-500" size={16} />;
      case 'stress':
        return isPositive ? <Zap className="text-amber-500" size={16} /> : <Zap className="text-red-500" size={16} />;
      case 'health':
        return isPositive ? <Heart className="text-green-500" size={16} /> : <Heart className="text-red-500" size={16} />;
      case 'prestige':
        return isPositive ? <Award className="text-purple-500" size={16} /> : <Award className="text-red-500" size={16} />;
      case 'intelligence':
        return isPositive ? <BookOpen className="text-blue-500" size={16} /> : <BookOpen className="text-red-500" size={16} />;
      case 'creativity':
        return isPositive ? <BookOpen className="text-indigo-500" size={16} /> : <BookOpen className="text-red-500" size={16} />;
      case 'charisma':
        return isPositive ? <BookOpen className="text-pink-500" size={16} /> : <BookOpen className="text-red-500" size={16} />;
      case 'technical':
        return isPositive ? <BookOpen className="text-cyan-500" size={16} /> : <BookOpen className="text-red-500" size={16} />;
      case 'leadership':
        return isPositive ? <Briefcase className="text-amber-500" size={16} /> : <Briefcase className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  // Format outcome value for display
  const formatOutcomeValue = (key: string, value: number) => {
    if (key === 'wealth' || key === 'income') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    }
    
    return value > 0 ? `+${value}` : value.toString();
  };

  // Get category color for the event
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market':
        return 'border-emerald-500 bg-emerald-950/30';
      case 'global':
        return 'border-blue-500 bg-blue-950/30';
      case 'personal':
        return 'border-violet-500 bg-violet-950/30';
      case 'lifestyle':
        return 'border-amber-500 bg-amber-950/30';
      case 'business':
        return 'border-cyan-500 bg-cyan-950/30';
      case 'career':
        return 'border-indigo-500 bg-indigo-950/30';
      case 'special':
        return 'border-purple-500 bg-purple-950/30';
      default:
        return 'border-gray-500 bg-gray-900/30';
    }
  };

  return (
    <Dialog open={!!currentEvent} onOpenChange={(open) => !open && dismissEvent()}>
      <DialogContent className={cn(
        "sm:max-w-[500px] border-2", 
        getCategoryColor(currentEvent.category)
      )}>
        <DialogHeader>
          <DialogTitle className="text-xl">{currentEvent.name}</DialogTitle>
          <DialogDescription className="py-2">
            {currentEvent.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 grid gap-4">
          {currentEvent.choices.map((choice: EventChoice, index: number) => (
            <Button
              key={index}
              variant={selectedChoice === index ? "default" : "outline"}
              className={cn(
                "justify-start text-left h-auto py-3 flex flex-col items-start gap-2 transition-all",
                selectedChoice !== null && selectedChoice !== index ? "opacity-50" : ""
              )}
              onClick={() => handleChoice(index)}
              disabled={selectedChoice !== null}
            >
              <div className="font-medium">{choice.text}</div>
              <div className="text-sm opacity-80">{choice.effect}</div>
              
              {/* Show outcomes */}
              {choice.outcomes && Object.keys(choice.outcomes).length > 0 && (
                <div className="mt-1 w-full grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {Object.entries(choice.outcomes)
                    .filter(([key]) => key !== 'achievement') // Don't show achievements in the list
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1">
                        {getOutcomeIcon(key, (typeof value === 'number' && ((key === 'stress' && value < 0) || (key !== 'stress' && value > 0))) || false)}
                        <span className="capitalize">{key}:</span>
                        <span className={cn(
                          (typeof value === 'number' && ((key === 'stress' && value < 0) || (key !== 'stress' && value > 0))) ? 'text-emerald-500' : 'text-red-500',
                          "font-medium"
                        )}>
                          {typeof value === 'number' ? formatOutcomeValue(key, value) : value}
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}