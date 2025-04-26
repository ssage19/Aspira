import React from 'react';
import { WealthTier, getCurrentWealthTier, getNextTierProgress } from '../lib/data/wealthTiers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { formatCurrency } from '../lib/utils';

interface WealthTierBadgeProps {
  netWorth: number;
  showProgress?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function WealthTierBadge({ 
  netWorth, 
  showProgress = false, 
  showTooltip = true,
  size = 'md'
}: WealthTierBadgeProps) {
  const { currentTier, nextTier, progress } = getNextTierProgress(netWorth);
  
  // Size-based styles
  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      iconSize: 14,
      container: 'space-y-1'
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      iconSize: 16,
      container: 'space-y-2'
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      iconSize: 20,
      container: 'space-y-3'
    }
  };
  
  const badge = (
    <div className={`flex items-center gap-1.5 ${currentTier.badgeClass} rounded-full ${sizeClasses[size].badge}`}>
      <currentTier.icon size={sizeClasses[size].iconSize} className={currentTier.color} />
      <span>{currentTier.name}</span>
    </div>
  );
  
  if (!showTooltip) {
    return (
      <div className={sizeClasses[size].container}>
        {badge}
        {showProgress && nextTier && (
          <div className="w-full space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentTier.name}</span>
              <span>{nextTier.name}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <div className={sizeClasses[size].container}>
              {badge}
              {showProgress && nextTier && (
                <div className="w-full space-y-1">
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{currentTier.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-0" side="bottom">
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <currentTier.icon size={18} className={currentTier.color} />
                <span className="font-semibold text-sm">{currentTier.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">Net Worth: {formatCurrency(netWorth)}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">{currentTier.description}</p>
            
            {nextTier && (
              <div className="pt-2 mt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Progress to {nextTier.name}</span>
                  <span className="text-xs font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(currentTier.minNetWorth)}</span>
                  <span>{formatCurrency(nextTier.minNetWorth)}</span>
                </div>
              </div>
            )}
            
            {!nextTier && (
              <div className="pt-2 mt-2 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">You've reached the highest wealth tier!</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}