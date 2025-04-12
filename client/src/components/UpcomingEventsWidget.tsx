import React from 'react';
import { useSocialNetwork } from '../lib/stores/useSocialNetwork';
import { usePrestige } from '../lib/stores/usePrestige';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Star, Users, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';

export function UpcomingEventsWidget() {
  const { events } = useSocialNetwork();
  const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
  const navigate = useNavigate();
  
  // Get upcoming events (not attended, sorted by date)
  const upcomingEvents = events
    .filter(event => !event.attended)
    .sort((a, b) => a.date - b.date)
    .slice(0, 3); // Show at most 3 events
  
  // Get event type color
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'charity':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'business':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'gala':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'conference':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'club':
        return 'bg-green-500 hover:bg-green-600';
      case 'party':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'networking':
        return 'bg-cyan-500 hover:bg-cyan-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  if (upcomingEvents.length === 0) {
    return null; // Don't show the widget if there are no upcoming events
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Social Events
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-muted-foreground"
            onClick={() => navigate('/networking')}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Network with industry professionals</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.map(event => {
          // Calculate days until the event
          const daysUntil = Math.ceil((event.date - Date.now()) / (1000 * 60 * 60 * 24));
          
          // Check if player meets prestige requirement
          const meetsRequirement = prestigeLevel >= event.prestigeRequired;
          
          return (
            <div key={event.id} className="mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-sm">{event.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(new Date(event.date))} • {daysUntil} days away
                  </div>
                </div>
                
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {event.benefits.potentialConnections} potential connections
                </div>
                
                <div className="flex items-center">
                  <Star className={`h-3 w-3 mr-1 ${meetsRequirement ? 'text-yellow-500' : 'text-red-500'}`} />
                  Level {event.prestigeRequired} Required {!meetsRequirement && '(Need Higher Prestige)'}
                </div>
              </div>
            </div>
          );
        })}
        
        <Button 
          className="w-full mt-2" 
          size="sm"
          onClick={() => navigate('/networking')}
        >
          Manage Social Calendar
        </Button>
      </CardContent>
    </Card>
  );
}