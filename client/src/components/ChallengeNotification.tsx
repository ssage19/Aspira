import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useChallenges, Challenge } from '../lib/stores/useChallenges';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X } from 'lucide-react';

interface ChallengeNotificationProps {
  challenge: Challenge;
  onClose: () => void;
}

export function ChallengeNotification({ challenge, onClose }: ChallengeNotificationProps) {
  const progressPercent = Math.min(100, (challenge.progress / challenge.targetValue) * 100);
  
  // Auto-close after a certain time
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // 8 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="relative flex flex-col w-full p-4 bg-card rounded-lg shadow-md border border-accent animate-in fade-in slide-in-from-top-5 duration-500">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6" 
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-2 mb-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <span className="text-sm font-medium text-blue-500">Challenge {challenge.isCompleted ? 'Completed' : 'Started'}</span>
      </div>
      
      <h3 className="text-lg font-semibold mt-1 mb-1">{challenge.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
      
      <div className="mt-1 mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>{Math.floor(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>
      
      {challenge.isCompleted && (
        <div className="mt-2 text-sm text-emerald-500 font-medium">
          Reward: {challenge.reward.description}
        </div>
      )}
    </div>
  );
}

export function ChallengeNotificationManager() {
  const { activeChallenges, completedChallenges } = useChallenges();
  const [shownCompletions, setShownCompletions] = useState<string[]>([]);
  const [shownStarts, setShownStarts] = useState<string[]>([]);
  
  // Track and notify of newly active challenges
  useEffect(() => {
    if (activeChallenges.length === 0) return;
    
    // Check for newly activated challenges
    activeChallenges.forEach(challenge => {
      if (!shownStarts.includes(challenge.id)) {
        // Show toast notification for new challenge
        toast.custom((t) => (
          <ChallengeNotification 
            challenge={challenge} 
            onClose={() => toast.dismiss(t)}
          />
        ));
        
        // Add to shown array
        setShownStarts(prev => [...prev, challenge.id]);
      }
    });
  }, [activeChallenges, shownStarts]);
  
  // Track and notify of newly completed challenges
  useEffect(() => {
    if (completedChallenges.length === 0) return;
    
    // Check for newly completed challenges
    completedChallenges.forEach(challenge => {
      if (!shownCompletions.includes(challenge.id)) {
        // Show toast notification for completed challenge
        toast.custom((t) => (
          <ChallengeNotification 
            challenge={challenge} 
            onClose={() => toast.dismiss(t)}
          />
        ));
        
        // Add to shown array
        setShownCompletions(prev => [...prev, challenge.id]);
      }
    });
  }, [completedChallenges, shownCompletions]);
  
  return null; // This component doesn't render anything
}