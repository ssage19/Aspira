import React from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { checkHealthStatus } from '../lib/services/healthMonitor';
import { AlertTriangle } from 'lucide-react';

export function TestHealthEvents() {
  const { health, addHealth } = useCharacter();
  
  const setHealthLevel = (level: number) => {
    // Calculate how much we need to add/subtract to reach the desired level
    const change = level - health;
    addHealth(change);
    
    // Trigger a health check immediately to see if an event happens
    setTimeout(() => {
      checkHealthStatus();
    }, 500);
  };
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="bg-red-900/20">
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Test Health Events
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm mb-4">
          Current Health: <span className="font-bold">{health.toFixed(1)}%</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setHealthLevel(5)}
          >
            Critical Health (5%)
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setHealthLevel(15)}
          >
            Severe Health (15%)
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHealthLevel(30)}
          >
            Low Health (30%)
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHealthLevel(50)}
          >
            Medium Health (50%)
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setHealthLevel(100)}
          >
            Restore Health (100%)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}