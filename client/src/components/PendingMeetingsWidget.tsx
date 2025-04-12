import React from 'react';
import { useSocialNetwork } from '../lib/stores/useSocialNetwork';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Users, UserCheck, ArrowRight, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

export function PendingMeetingsWidget() {
  const { connections } = useSocialNetwork();
  const navigate = useNavigate();
  
  // Get connections with pending meetings
  const pendingMeetings = connections
    .filter(connection => connection.pendingMeeting)
    .slice(0, 3); // Show at most 3 pending meetings
  
  // If no pending meetings, don't show the widget
  if (pendingMeetings.length === 0) {
    return null;
  }
  
  // Get connection type color
  const getConnectionTypeColor = (type: string): string => {
    switch (type) {
      case 'mentor':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'rival':
        return 'bg-red-500 hover:bg-red-600';
      case 'businessContact':
        return 'bg-green-500 hover:bg-green-600';
      case 'investor':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'industry':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'celebrity':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'influencer':
        return 'bg-indigo-500 hover:bg-indigo-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Format connection type for display
  const formatConnectionType = (type: string): string => {
    switch (type) {
      case 'businessContact':
        return 'Business Contact';
      case 'industry':
        return 'Industry Expert';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Pending Meetings
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
        <CardDescription>Connections waiting to meet with you</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingMeetings.map(connection => (
          <div key={connection.id} className="mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm">{connection.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {formatConnectionType(connection.type)} • {connection.expertise.charAt(0).toUpperCase() + connection.expertise.slice(1)}
                </div>
              </div>
              
              <Badge className={getConnectionTypeColor(connection.type)}>
                {formatConnectionType(connection.type)}
              </Badge>
            </div>
          </div>
        ))}
        
        <Button 
          className="w-full mt-2" 
          size="sm"
          onClick={() => navigate('/networking')}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Attend Meetings
        </Button>
      </CardContent>
    </Card>
  );
}