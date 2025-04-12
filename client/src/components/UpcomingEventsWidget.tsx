import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useSocialNetwork } from "../lib/stores/useSocialNetwork";
import { Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useGameTime } from "../lib/hooks/useGameTime";

/**
 * A dashboard widget that displays upcoming social events
 */
export function UpcomingEventsWidget() {
  const { events } = useSocialNetwork();
  const { gameTime } = useGameTime();

  // Only show unattended events that are upcoming
  const upcomingEvents = events
    .filter(event => !event.attended && new Date(event.date) >= gameTime)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Only show the 3 most recent

  if (upcomingEvents.length === 0) {
    return (
      <Card className="futuristic-card border-cyan-500/30 shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <div className="mr-3 p-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-primary font-medium">Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>No upcoming events scheduled</p>
            <p className="text-sm mt-2">Visit the Networking section to find events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="futuristic-card border-cyan-500/30 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <div className="mr-3 p-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
            <Calendar className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-primary font-medium">Upcoming Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div 
              key={event.id} 
              className="flex items-start p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
            >
              <div className="flex flex-col flex-grow">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary">{event.name}</span>
                  <Badge variant="outline" className="bg-cyan-500/10 text-xs border-cyan-500/30 text-cyan-500">
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          
          {upcomingEvents.length < 3 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              <p>Visit Networking to find more events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}