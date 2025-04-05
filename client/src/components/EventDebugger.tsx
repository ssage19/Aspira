import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useRandomEvents } from '../lib/stores/useRandomEvents';
import { AlertCircle, Sparkles, X } from 'lucide-react';

export function EventDebugger() {
  const { debugMode, setDebugMode, forceEvent, activeEvents, cleanupExpiredEvents } = useRandomEvents();
  const [eventId, setEventId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't render anything if debug mode is off
  if (!debugMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-amber-950/70 border-amber-500/50 text-amber-400"
        >
          <Sparkles size={16} className="mr-2" />
          Debug
        </Button>
      ) : (
        <Card className="w-80 bg-amber-950/80 border-amber-500/50">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-sm">Event Debugger</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-amber-400" 
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </Button>
            </div>
            <CardDescription className="text-amber-300/70 text-xs">
              This panel is for testing events only
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-amber-300">Trigger Event</div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Event ID"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="h-8 text-sm bg-amber-900/50 border-amber-700"
                />
                <Button 
                  size="sm"
                  className="h-8 bg-amber-700 hover:bg-amber-600"
                  onClick={() => forceEvent(eventId)}
                  disabled={!eventId}
                >
                  Trigger
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-xs text-amber-300">Active Events ({activeEvents.length})</div>
              <div className="max-h-40 overflow-y-auto">
                {activeEvents.length > 0 ? (
                  <div className="grid gap-1">
                    {activeEvents.map(event => (
                      <div key={event.id} className="text-xs bg-amber-900/30 p-1.5 rounded flex items-center justify-between">
                        <div>{event.name}</div>
                        <div className="text-amber-300/70 text-[10px]">
                          {new Date(event.expires).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs italic text-amber-300/50 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    No active events
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <Button 
              size="sm"
              className="h-7 bg-amber-800 hover:bg-amber-700 text-xs"
              onClick={() => cleanupExpiredEvents()}
            >
              Cleanup Events
            </Button>
            <Button 
              size="sm"
              className="h-7 bg-amber-800 hover:bg-amber-700 text-xs"
              onClick={() => setDebugMode(false)}
            >
              Exit Debug Mode
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}