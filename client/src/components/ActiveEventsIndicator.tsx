import React from 'react';
import { useRandomEvents, ActiveEvent } from '../lib/stores/useRandomEvents';
import { Clock, AlertCircle, TrendingUp, TrendingDown, Heart, Award, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Get appropriate icon based on event category
const getCategoryIcon = (category: string, size = 16) => {
  switch (category) {
    case 'market':
      return <TrendingUp size={size} />;
    case 'global':
      return <AlertCircle size={size} />;
    case 'personal':
      return <Heart size={size} />;
    case 'lifestyle':
      return <Zap size={size} />;
    case 'business':
      return <TrendingUp size={size} />;
    case 'career':
      return <Award size={size} />;
    default:
      return <AlertCircle size={size} />;
  }
};

// Get appropriate color for event category
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'market':
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
    case 'global':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    case 'personal':
      return 'bg-violet-500/20 text-violet-500 border-violet-500/50';
    case 'lifestyle':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
    case 'business':
      return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/50';
    case 'career':
      return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50';
    default:
      return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
  }
};

// Format time remaining
const formatTimeRemaining = (expires: number) => {
  const now = Date.now();
  const remaining = expires - now;
  
  if (remaining <= 0) return "Expired";
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Render a single active event item
const ActiveEventItem: React.FC<{ event: ActiveEvent }> = ({ event }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded border ${getCategoryColor(event.category)}`}>
            <div>
              {getCategoryIcon(event.category)}
            </div>
            <div className="text-xs font-medium">{event.name}</div>
            <div className="text-xs opacity-70 flex items-center gap-1">
              <Clock size={12} />
              {formatTimeRemaining(event.expires)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <h3 className="font-medium">{event.name}</h3>
            <p className="text-sm opacity-80">{event.description}</p>
            <div className="mt-2 grid gap-1 text-xs">
              {event.effects.incomeMultiplier && event.effects.incomeMultiplier !== 1 && (
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>Income: {((event.effects.incomeMultiplier - 1) * 100).toFixed(0)}%</span>
                </div>
              )}
              {event.effects.happinessChange && event.effects.happinessChange !== 0 && (
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>Happiness: {event.effects.happinessChange > 0 ? '+' : ''}{event.effects.happinessChange}</span>
                </div>
              )}
              {event.effects.stressChange && event.effects.stressChange !== 0 && (
                <div className="flex items-center gap-1">
                  <Zap size={12} />
                  <span>Stress: {event.effects.stressChange > 0 ? '+' : ''}{event.effects.stressChange}</span>
                </div>
              )}
              {event.effects.healthChange && event.effects.healthChange !== 0 && (
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>Health: {event.effects.healthChange > 0 ? '+' : ''}{event.effects.healthChange}</span>
                </div>
              )}
              {event.effects.prestigeChange && event.effects.prestigeChange !== 0 && (
                <div className="flex items-center gap-1">
                  <Award size={12} />
                  <span>Prestige: {event.effects.prestigeChange > 0 ? '+' : ''}{event.effects.prestigeChange}</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function ActiveEventsIndicator() {
  const { activeEvents, cleanupExpiredEvents } = useRandomEvents();
  
  // Cleanup expired events whenever component renders
  React.useEffect(() => {
    cleanupExpiredEvents();
  }, [cleanupExpiredEvents]);
  
  // If no active events, don't render anything
  if (activeEvents.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {activeEvents.map(event => (
        <ActiveEventItem key={event.id} event={event} />
      ))}
    </div>
  );
}

export default ActiveEventsIndicator;