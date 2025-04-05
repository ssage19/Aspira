import React, { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { checkHealthStatus } from '../lib/services/healthMonitor';
import { AlertTriangle, SkullIcon, RefreshCw, Heart, AlertCircle, Info } from 'lucide-react';
import { getEventCount, resetEventCount } from '../lib/data/healthEvents';
import { toast } from 'sonner';

export function TestHealthEvents() {
  const { health, addHealth, wealth } = useCharacter();
  const [eventCount, setEventCount] = useState(getEventCount());
  
  // Update the event count display periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setEventCount(getEventCount());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const setHealthLevel = (level: number) => {
    // Calculate how much we need to add/subtract to reach the desired level
    const change = level - health;
    addHealth(change);
    
    // Trigger a health check immediately to see if an event happens
    setTimeout(() => {
      checkHealthStatus();
      setEventCount(getEventCount());
    }, 500);
  };
  
  const resetEvents = () => {
    resetEventCount();
    setEventCount(0);
    toast.success('Health event counter has been reset');
  };
  
  const forceCriticalEventTest = () => {
    // Save current health
    const currentHealth = health;
    
    // Set health to critical level
    setHealthLevel(5);
    
    // Force many health events to increase critical chance
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        checkHealthStatus();
      }, i * 100);
    }
    
    toast.info('Triggered multiple critical health checks to test death chance', { duration: 3000 });
    
    // After 3 seconds, restore health if the character didn't die
    setTimeout(() => {
      setHealthLevel(currentHealth);
    }, 5000);
  };
  
  // Probability calculation
  const criticalChance = Math.min(100, 80 + (eventCount * 2));
  const deathChance = (criticalChance / 100) * 1; // 1% chance of death if critical
  
  // Dynamic CSS classes based on event count
  const riskLevel = 
    eventCount < 5 ? 'text-green-500' :
    eventCount < 10 ? 'text-yellow-500' :
    eventCount < 15 ? 'text-orange-500' :
    'text-red-500';
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="bg-red-900/20">
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Health Events System
        </CardTitle>
        <CardDescription>
          Test the dynamic health events system with increasing mortality risk
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-700 rounded-md p-4 bg-gray-800/50">
          <div>
            <div className="text-sm mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Current Health: <span className="font-bold">{health.toFixed(1)}%</span></span>
            </div>
            
            <div className="text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span>Health Events: <span className={`font-bold ${riskLevel}`}>{eventCount}</span></span>
            </div>
          </div>
          
          <div>
            <div className="text-sm mb-2 flex items-center gap-2">
              <SkullIcon className="h-4 w-4 text-red-500" />
              <span>Critical Event Chance: <span className="font-bold">{criticalChance.toFixed(1)}%</span></span>
            </div>
            
            <div className="text-sm flex items-center gap-2">
              <SkullIcon className="h-4 w-4 text-black" />
              <span>Death Chance (if critical): <span className="font-bold">{deathChance.toFixed(2)}%</span></span>
            </div>
          </div>
        </div>
        
        {/* Health Level Controls */}
        <div>
          <h3 className="text-sm font-medium mb-2">Set Health Level</h3>
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
        </div>
        
        {/* Advanced Testing Controls */}
        <div>
          <h3 className="text-sm font-medium mb-2">Advanced Testing</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetEvents}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Event Counter
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={forceCriticalEventTest}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <SkullIcon className="h-3 w-3" />
              Test Death Chance
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info(
                <div>
                  <p className="font-bold">Health Events System Info</p>
                  <p>- Events create cumulative risk over time</p>
                  <p>- Critical chance: 80% + (2% × event count)</p>
                  <p>- Death chance: 1% (if event is critical)</p>
                  <p>- 50 different health events</p>
                </div>, 
                { duration: 5000 }
              )}
              className="flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              System Info
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}