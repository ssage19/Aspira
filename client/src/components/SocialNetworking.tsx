import React, { useState, useEffect, useMemo } from 'react';
import { useSocialNetwork, ConnectionType, SocialConnection, SocialEvent, ConnectionBenefit } from '../lib/stores/useSocialNetwork';
import { useCharacter } from '../lib/stores/useCharacter';
import { usePrestige } from '../lib/stores/usePrestige';
import { useTime } from '../lib/stores/useTime';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  User, Users, UserPlus, UserMinus, Calendar, Award,
  TrendingUp, MessageCircle, Gift, Briefcase, 
  CreditCard, AlertTriangle, Star, Clock, ArrowUpRight,
  ChevronLeft, ChevronRight, HelpCircle, X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  formatDistanceToNow
} from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get event type color for visual identification
 */
const getEventTypeColor = (type: string): string => {
  switch(type) {
    case 'charity': return 'bg-pink-500';
    case 'business': return 'bg-blue-500';
    case 'gala': return 'bg-purple-500';
    case 'conference': return 'bg-amber-500';
    case 'club': return 'bg-emerald-500';
    case 'party': return 'bg-indigo-500';
    case 'networking': return 'bg-cyan-500';
    case 'workshop': return 'bg-orange-500';
    case 'seminar': return 'bg-teal-500';
    case 'award': return 'bg-violet-500';
    case 'product_launch': return 'bg-green-500';
    case 'trade_show': return 'bg-red-500';
    case 'retreat': return 'bg-yellow-500';
    case 'vip_dinner': return 'bg-rose-500';
    case 'sporting_event': return 'bg-lime-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Calendar day cell component for events view
 */
interface CalendarEventDayProps {
  date: Date;
  currentMonth: Date;
  events: SocialEvent[];
  canAttendFn: (event: SocialEvent) => boolean;
  onAttend: (id: string) => void;
  onRemove: (id: string) => void;
  onReserve: (id: string) => void;
  isGameCurrent: boolean;
}

const CalendarEventDay: React.FC<CalendarEventDayProps> = ({ 
  date, 
  currentMonth, 
  events,
  canAttendFn,
  onAttend,
  onRemove,
  onReserve,
  isGameCurrent
}) => {
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.date), date)
  );

  const isOutsideMonth = !isSameMonth(date, currentMonth);
  const isToday = isGameCurrent && isSameDay(date, new Date());
  
  // Get current game time
  const { currentGameDate } = useTime.getState();
  const gameTime = currentGameDate.getTime();
  
  return (
    <div 
      className={cn(
        "p-1 border min-h-[80px] text-sm overflow-hidden flex flex-col",
        isOutsideMonth ? "bg-muted/30 text-muted-foreground" : "bg-card",
        isToday ? "ring-2 ring-cyan-500 ring-inset" : ""
      )}
    >
      <div className="font-medium text-right mb-1">
        {format(date, 'd')}
      </div>
      
      {dayEvents.length > 0 && (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          {dayEvents.map(event => {
            const eventDate = new Date(event.date);
            const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
            const isFutureEvent = daysRemaining > 0;
            const canAttend = canAttendFn(event);
            
            return (
              <TooltipProvider key={event.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`
                        px-1 py-0.5 text-xs truncate rounded 
                        ${getEventTypeColor(event.type)}/90 text-white 
                        border ${event.reserved ? 'border-yellow-300' : 'border-white/10'}
                        cursor-pointer
                      `}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{format(eventDate, 'h:mm a')}</span>
                        <span className="truncate">{event.name}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="w-72 p-0">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{event.name}</h4>
                        <Badge className={`${getEventTypeColor(event.type)}`}>
                          {event.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{event.description}</p>
                      <div className="text-xs grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <div className="font-semibold">Entry Fee</div>
                          <div>{formatCurrency(event.entryFee)}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Prestige Required</div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {event.prestigeRequired}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {isFutureEvent ? (
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => onReserve(event.id)}
                            disabled={!canAttend || event.reserved}
                          >
                            {event.reserved ? 'Reserved' : 'Reserve Spot'}
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => onAttend(event.id)}
                            disabled={!canAttend}
                          >
                            Attend Now
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => onRemove(event.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Calendar view component for social events
 */
interface EventsCalendarViewProps {
  events: SocialEvent[];
  canAttendFn: (event: SocialEvent) => boolean;
  onAttend: (id: string) => void;
  onRemove: (id: string) => void;
  onReserve: (id: string) => void;
}

const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  canAttendFn,
  onAttend,
  onRemove,
  onReserve
}) => {
  const { currentGameDate } = useTime();
  
  // Navigate between months
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(currentGameDate));
  
  // Get the events for the current month view
  const visibleEvents = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });
  }, [events, currentMonth]);

  // Generate calendar days including overflow from prev/next months
  const calendarDays = useMemo(() => {
    // Get start of first day of the month
    const monthStart = startOfMonth(currentMonth);
    // Get end of last day of the month
    const monthEnd = endOfMonth(currentMonth);
    // Get start of the week of the first day
    const startDate = startOfWeek(monthStart);
    // Get end of the week of the last day
    const endDate = endOfWeek(monthEnd);

    // Create array of dates from start to end
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => 
      direction === 'prev' 
        ? subMonths(prevMonth, 1) 
        : addMonths(prevMonth, 1)
    );
  };

  const resetToCurrentMonth = () => {
    setCurrentMonth(startOfMonth(currentGameDate));
  };
  
  // We'll implement keyboard navigation directly with the calendar buttons instead
  
  // Get upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Show next 5 events
  }, [events]);

  return (
    <div>
      {/* Month navigation and title */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Event Calendar</h3>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={resetToCurrentMonth}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div 
        className="mb-6 focus:outline-2 focus:outline-primary focus:outline-offset-2 focus:ring-2 focus:ring-primary cursor-pointer" 
        tabIndex={0}
        autoFocus
        aria-label="Event Calendar" 
        role="grid"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            navigateMonth('prev');
            console.log('Left arrow pressed - navigating to previous month');
            e.preventDefault();
          } else if (e.key === 'ArrowRight') {
            navigateMonth('next');
            console.log('Right arrow pressed - navigating to next month');
            e.preventDefault();
          } else if (e.key === 'Home') {
            resetToCurrentMonth();
            console.log('Home key pressed - resetting to current month');
            e.preventDefault();
          }
        }}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-xs font-medium border-b py-1" role="row">
          {WEEKDAYS.map(day => (
            <div key={day} className="px-1" role="columnheader">{day}</div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7" role="rowgroup">
          {calendarDays.map(day => (
            <CalendarEventDay 
              key={day.toString()} 
              date={day} 
              currentMonth={currentMonth}
              events={events}
              canAttendFn={canAttendFn}
              onAttend={onAttend}
              onRemove={onRemove}
              onReserve={onReserve}
              isGameCurrent={format(currentGameDate, 'MM/yyyy') === format(currentMonth, 'MM/yyyy')}
            />
          ))}
        </div>
      </div>
      
      {/* Upcoming events list for quick reference */}
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              canAfford={canAttendFn(event)}
              canAttend={canAttendFn(event)}
              onAttend={onAttend}
              onRemove={onRemove}
              onReserve={onReserve}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine the color for connection type
const getConnectionTypeColor = (type: ConnectionType): string => {
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

// Helper function to format connection type label
const formatConnectionType = (type: ConnectionType): string => {
  switch (type) {
    case 'businessContact':
      return 'Business Contact';
    case 'industry':
      return 'Industry Expert';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Helper function to display connection status
const formatConnectionStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Helper function to format expertise area
const formatExpertiseArea = (expertise: string): string => {
  switch (expertise) {
    case 'realestate':
      return 'Real Estate';
    default:
      return expertise.charAt(0).toUpperCase() + expertise.slice(1);
  }
};

// Component to display connection details and actions
interface ConnectionCardProps {
  connection: SocialConnection;
  onScheduleMeeting: (id: string) => void;
  onAttendMeeting: (id: string) => void;
  onUseBenefit: (connectionId: string, benefitId: string) => void;
  onRemove?: (id: string) => void; // Optional remove action
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ 
  connection, 
  onScheduleMeeting, 
  onAttendMeeting,
  onUseBenefit,
  onRemove
}) => {
  const [expanded, setExpanded] = useState(false);

  // Extract connection details
  const {
    id,
    name,
    type,
    status,
    expertise,
    relationshipLevel,
    pendingMeeting,
    benefits,
    biography,
    rivalryScore,
    mentorshipLevel,
    influenceLevel,
    businessSuccessLevel
  } = connection;
  
  // Calculate meeting cost based on connection type and status
  const baseInteractionCost = 10;
  const typeMultiplier = 
    type === 'celebrity' ? 3.0 :
    type === 'investor' ? 2.5 :
    type === 'mentor' ? 2.0 :
    1.0;
  
  const statusMultiplier =
    status === 'close' ? 0.7 : // Closer connections are easier to meet
    status === 'friend' ? 0.8 :
    status === 'associate' ? 1.0 :
    status === 'contact' ? 1.2 :
    1.5; // Acquaintances are hardest to meet
  
  const meetingCost = Math.round(baseInteractionCost * typeMultiplier * statusMultiplier);

  // Get unused benefits
  const unusedBenefits = benefits.filter(b => !b.used);

  return (
    <Card className="mb-4 bg-card">
      <CardHeader className="pb-2">
        {/* Redesigned card header for better mobile layout */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
          <div>
            <CardTitle className="text-lg sm:text-xl flex flex-wrap items-center">
              {name} 
              <Badge 
                className={`ml-2 ${getConnectionTypeColor(type)} text-white text-xs px-2`}
              >
                {formatConnectionType(type)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {formatExpertiseArea(expertise)} Expert • {formatConnectionStatus(status)}
            </CardDescription>
          </div>
          
          {/* Action buttons - responsive layout */}
          <div className="flex flex-wrap gap-2 self-end sm:self-auto mt-2 sm:mt-0">
            {pendingMeeting ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => onAttendMeeting(id)}
                className="flex items-center"
              >
                <Users className="mr-1 h-4 w-4" />
                Meet Now
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onScheduleMeeting(id)}
                      className="flex items-center whitespace-nowrap"
                    >
                      <Calendar className="mr-1 h-4 w-4" />
                      <span className="inline-block">Schedule</span>
                      <MessageCircle className="ml-1 h-3 w-3" />
                      <span className="ml-1 text-xs">{meetingCost}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Cost: {meetingCost} social capital</p>
                    <p className="text-xs text-muted-foreground">Better relationships → Lower costs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Remove connection button */}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="flex items-center text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Relationship level */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-sm mb-1">
            <span>Relationship</span>
            <span>{relationshipLevel}%</span>
          </div>
          <Progress value={relationshipLevel} max={100} className="h-2" />
        </div>
        
        {/* Special metrics based on connection type */}
        {rivalryScore && (
          <div className="mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Rivalry Intensity</span>
              <span>{rivalryScore}%</span>
            </div>
            <Progress value={rivalryScore} max={100} className="h-2 bg-red-200" />
          </div>
        )}
        
        {mentorshipLevel && (
          <div className="mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Mentorship Quality</span>
              <span>{mentorshipLevel}%</span>
            </div>
            <Progress value={mentorshipLevel} max={100} className="h-2 bg-blue-200" />
          </div>
        )}
        
        {influenceLevel && (
          <div className="mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Influence Level</span>
              <span>{influenceLevel}%</span>
            </div>
            <Progress value={influenceLevel} max={100} className="h-2 bg-purple-200" />
          </div>
        )}
        
        {businessSuccessLevel && (
          <div className="mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Business Success</span>
              <span>{businessSuccessLevel}%</span>
            </div>
            <Progress value={businessSuccessLevel} max={100} className="h-2 bg-green-200" />
          </div>
        )}
        
        {/* Biography - collapsed by default */}
        <div className="mt-3">
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
          
          {expanded && (
            <div className="mt-2 text-sm text-muted-foreground">
              {biography}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Available benefits */}
      {unusedBenefits.length > 0 && (
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="w-full">
            <Separator className="my-2" />
            <h4 className="text-sm font-medium mb-2">Available Opportunities:</h4>
            {unusedBenefits.map(benefit => (
              <div key={benefit.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 text-sm border-l-2 border-primary pl-2">
                <span className="mb-1 sm:mb-0 pr-4">{benefit.description}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUseBenefit(id, benefit.id)}
                  className="self-end sm:self-auto"
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs">Use</span>
                </Button>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// Component to display event details and actions
interface EventCardProps {
  event: SocialEvent;
  canAfford: boolean;
  canAttend: boolean;
  onAttend: (id: string) => void;
  onRemove: (id: string) => void;
  onReserve?: (id: string) => void; // New prop for reserving events
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  canAfford, 
  canAttend,
  onAttend,
  onRemove,
  onReserve
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format event date and time
  const eventDate = new Date(event.date);
  const formattedDate = formatDate(eventDate);
  const formattedTime = format(eventDate, 'h:mm a');
  
  // Get current game time
  const { currentGameDate } = useTime.getState();
  const gameTime = currentGameDate.getTime();
  
  // Calculate days remaining based on game time, not real-world time
  const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
  
  // Check if this is a future event (>0 days) or today's event (0 days)
  const isFutureEvent = daysRemaining > 0;
  
  // Status indicators
  const isReserved = event.reserved;
  
  return (
    <Card className="mb-4 bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1">
          <div>
            <div className="flex flex-wrap items-center justify-between">
              <CardTitle className="text-lg sm:text-xl pr-2">{event.name}</CardTitle>
              <Badge className={
                event.type === 'charity' ? 'bg-pink-500' :
                event.type === 'business' ? 'bg-blue-500' :
                event.type === 'gala' ? 'bg-purple-500' :
                event.type === 'conference' ? 'bg-amber-500' :
                event.type === 'club' ? 'bg-green-500' :
                event.type === 'party' ? 'bg-indigo-500' :
                'bg-cyan-500' // networking
              }>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            </div>
            <CardDescription className="flex items-center flex-wrap text-sm">
              <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal">{formattedDate}, {formattedTime} • {event.location}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-3">
          {event.description}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-sm font-medium">Entry Fee</div>
            <div className="text-lg">{formatCurrency(event.entryFee)}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Prestige Required</div>
            <div className="text-lg flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {event.prestigeRequired}
            </div>
          </div>
        </div>
        
        <Button 
          variant="link" 
          className="p-0 h-auto text-sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        
        {showDetails && (
          <div className="mt-2 text-sm">
            <h4 className="font-medium mb-1">Potential Benefits:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Networking Potential: {event.benefits.networkingPotential}%</li>
              <li>Reputation Gain: {event.benefits.reputationGain}%</li>
              <li>Potential New Connections: {event.benefits.potentialConnections}</li>
              {event.benefits.skillBoost && (
                <li>{event.benefits.skillBoost.charAt(0).toUpperCase() + event.benefits.skillBoost.slice(1)} Skill +{event.benefits.skillBoostAmount}</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              {daysRemaining > 0 ? 
                `${daysRemaining} days remaining` : 
                daysRemaining === 0 ? 
                  "Today" : 
                  "Expired"
              }
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => onRemove(event.id)}
              >
                <X className="h-4 w-4 mr-1" />
                <span>Cancel</span>
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full sm:w-auto">
                      {/* Show different buttons based on event timing and reservation status */}
                      {isReserved ? (
                        <Button variant="secondary" disabled className="w-full sm:w-auto">
                          Reserved
                        </Button>
                      ) : isFutureEvent && onReserve ? (
                        <Button
                          variant="default"
                          disabled={!canAttend || !canAfford}
                          onClick={() => onReserve(event.id)}
                          className="w-full sm:w-auto whitespace-nowrap"
                        >
                          Reserve Spot
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          disabled={!canAttend || !canAfford}
                          onClick={() => onAttend(event.id)}
                          className="w-full sm:w-auto whitespace-nowrap"
                        >
                          Attend Event
                        </Button>
                      )}
                    </div>
                  </TooltipTrigger>
                  {(!canAttend || !canAfford) && (
                    <TooltipContent>
                      {!canAttend ? `You need prestige level ${event.prestigeRequired} to attend` : `You need ${formatCurrency(event.entryFee)} to attend`}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Dialog to confirm using a benefit
interface ConfirmBenefitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: ConnectionBenefit | null;
  connection: SocialConnection | null;
  onConfirm: () => void;
}

const ConfirmBenefitDialog: React.FC<ConfirmBenefitDialogProps> = ({
  open,
  onOpenChange,
  benefit,
  connection,
  onConfirm
}) => {
  if (!benefit || !connection) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Use this opportunity?</AlertDialogTitle>
          <AlertDialogDescription>
            {benefit.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Dialog to confirm attending an event
interface ConfirmEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SocialEvent | null;
  onConfirm: () => void;
  isReservation?: boolean;
}

const ConfirmEventDialog: React.FC<ConfirmEventDialogProps> = ({
  open,
  onOpenChange,
  event,
  onConfirm,
  isReservation = false
}) => {
  if (!event) return null;
  
  // Calculate if this is a future event using game time
  const { currentGameDate } = useTime.getState();
  const gameTime = currentGameDate.getTime();
  
  // Calculate days remaining based on game time, not real-world time
  const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
  const isFutureEvent = daysRemaining > 0;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isReservation
              ? `Reserve spot at ${event.name}?`
              : isFutureEvent
                ? `Attend ${event.name}?`
                : `Attend ${event.name} now?`
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will cost {formatCurrency(event.entryFee)}. You'll have the opportunity to make new connections and gain social capital.
            {isFutureEvent && (
              <p className="mt-2">
                This event is scheduled for {formatDate(new Date(event.date))} at {format(new Date(event.date), 'h:mm a')}
                {daysRemaining > 0 
                  ? ` (${daysRemaining} days from now)`
                  : daysRemaining === 0
                    ? ` (today)`
                    : ` (event date has passed)`
                }.
                {isReservation && daysRemaining > 0 && (
                  <span className="block text-sm mt-1 font-medium text-primary">
                    You'll automatically attend on the scheduled date.
                  </span>
                )}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isReservation ? 'Reserve Spot' : 'Attend'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Dialog to add a new connection
interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddConnection: (type: ConnectionType) => void;
}

const AddConnectionDialog: React.FC<AddConnectionDialogProps> = ({
  open,
  onOpenChange,
  onAddConnection
}) => {
  const connectionTypes: {type: ConnectionType, description: string}[] = [
    {type: 'mentor', description: 'A seasoned professional who can teach you valuable skills and provide guidance.'},
    {type: 'businessContact', description: 'A professional connection who can provide business opportunities and partnerships.'},
    {type: 'investor', description: 'Someone with capital who is looking for investment opportunities.'},
    {type: 'industry', description: 'An industry expert with deep knowledge of trends and regulations.'},
    {type: 'celebrity', description: 'A public figure whose endorsement can boost your reputation.'},
    {type: 'influencer', description: 'Someone with a large social media following who can promote your business.'}
  ];
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Find New Connection</AlertDialogTitle>
          <AlertDialogDescription>
            Choose what type of connection you're looking to make.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-2 gap-2 py-4">
          {connectionTypes.map(({type, description}) => (
            <Card key={type} className="cursor-pointer hover:bg-accent" onClick={() => {
              onAddConnection(type);
              onOpenChange(false);
            }}>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">
                  {formatConnectionType(type)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Main component
export function SocialNetworking() {
  const { 
    connections, 
    events, 
    networkingLevel, 
    socialCapital,
    scheduleInteraction,
    attendMeeting,
    useBenefit,
    attendEvent,
    reserveEvent,
    addConnection,
    removeConnection,
    removeEvent,
    generateNewEvents,
    checkForExpiredContent
  } = useSocialNetwork();
  
  const { wealth } = useCharacter();
  const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
  const { currentDay, currentMonth, currentYear } = useTime.getState();
  
  // Check for reserved events that are due when this component mounts or is revisited
  useEffect(() => {
    // Run the check for expired/due content without notifications for daily updates
    checkForExpiredContent?.(false);
  }, [checkForExpiredContent, currentDay, currentMonth, currentYear]);
  
  // Additional effect to show monthly summaries only when the month changes
  const [lastCheckedMonth, setLastCheckedMonth] = useState<number>(currentMonth);
  
  useEffect(() => {
    // Only run this when the month changes
    if (currentMonth !== lastCheckedMonth) {
      // Show the monthly summary with notifications
      checkForExpiredContent?.(true);
      setLastCheckedMonth(currentMonth);
    }
  }, [checkForExpiredContent, currentMonth, lastCheckedMonth]);
  
  // Local state for dialog controls
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showBenefitDialog, setShowBenefitDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAddConnectionDialog, setShowAddConnectionDialog] = useState(false);
  
  // Current tab
  const [activeTab, setActiveTab] = useState('connections');
  
  // Filter for events that haven't been attended
  const availableEvents = events.filter(event => !event.attended);
  
  // Get selected connection and benefit for dialog
  const selectedConnection = connections.find(c => c.id === selectedConnectionId) || null;
  const selectedBenefit = selectedConnection?.benefits.find(b => b.id === selectedBenefitId) || null;
  
  // Get selected event for dialog
  const selectedEvent = events.find(e => e.id === selectedEventId) || null;
  
  // Handler functions
  const handleScheduleMeeting = (connectionId: string) => {
    // Find the connection to get its meeting cost
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;
    
    // Calculate the meeting cost (same formula as in the ConnectionCard and useSocialNetwork store)
    const baseInteractionCost = 10;
    const typeMultiplier = 
      connection.type === 'celebrity' ? 3.0 :
      connection.type === 'investor' ? 2.5 :
      connection.type === 'mentor' ? 2.0 :
      1.0;
    
    const statusMultiplier =
      connection.status === 'close' ? 0.7 : // Closer connections are easier to meet
      connection.status === 'friend' ? 0.8 :
      connection.status === 'associate' ? 1.0 :
      connection.status === 'contact' ? 1.2 :
      1.5; // Acquaintances are hardest to meet
    
    const meetingCost = Math.round(baseInteractionCost * typeMultiplier * statusMultiplier);
    
    if (socialCapital < meetingCost) {
      toast.error(`You need ${meetingCost} social capital to schedule this meeting.`);
      return;
    }
    
    scheduleInteraction(connectionId);
  };
  
  const handleAttendMeeting = (connectionId: string) => {
    const result = attendMeeting(connectionId);
    
    if (result.success && result.benefit) {
      toast.success(`Meeting successful! You gained a new opportunity.`);
    }
  };
  
  const handleOpenBenefitDialog = (connectionId: string, benefitId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedBenefitId(benefitId);
    setShowBenefitDialog(true);
  };
  
  const handleConfirmUseBenefit = () => {
    if (selectedConnectionId && selectedBenefitId) {
      useBenefit(selectedConnectionId, selectedBenefitId);
      setShowBenefitDialog(false);
    }
  };
  
  // State to track if we're reserving (true) or attending (false) in the dialog
  const [isEventReservation, setIsEventReservation] = useState(false);
  
  // Handler for opening the dialog to attend an event
  const handleOpenEventDialog = (eventId: string) => {
    // Get the event
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Get current game time
    const { currentGameDate } = useTime.getState();
    const gameTime = currentGameDate.getTime();
    
    // Check if event has already passed based on game time (more than 1 day ago)
    const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
    if (daysRemaining < -1) {
      // If the event has passed by more than a day, it can't be attended anymore
      toast.error("This event has already passed and cannot be attended.");
      return;
    }
    
    setSelectedEventId(eventId);
    setIsEventReservation(false);
    setShowEventDialog(true);
  };
  
  // Handler for opening the dialog to reserve an event
  const handleOpenReserveDialog = (eventId: string) => {
    // Get the event
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Get current game time
    const { currentGameDate } = useTime.getState();
    const gameTime = currentGameDate.getTime();
    
    // Check if event has already passed based on game time
    const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      // If the event has passed, show an error message
      toast.error("This event has already passed and cannot be reserved.");
      return;
    }
    
    setSelectedEventId(eventId);
    setIsEventReservation(true);
    setShowEventDialog(true);
  };
  
  const handleConfirmAttendEvent = () => {
    if (selectedEventId) {
      const result = attendEvent(selectedEventId);
      if (result.success) {
        toast.success(`You attended the event and met ${result.newConnections.length} new connections!`);
      } else {
        toast.error("Unable to attend this event.");
      }
      setShowEventDialog(false);
    }
  };
  
  // Handler for dialog confirmation to reserve an event
  const handleConfirmReserveEvent = () => {
    if (selectedEventId) {
      const result = reserveEvent(selectedEventId);
      if (result.success) {
        toast.success("Event successfully reserved! You'll automatically attend on the scheduled date.");
      } else {
        toast.error("Unable to reserve this event.");
      }
      setShowEventDialog(false);
    }
  };
  
  // Handler for direct reservation (without dialog)
  const handleReserveEvent = (eventId: string) => {
    // Get the event
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Get current game time
    const { currentGameDate } = useTime.getState();
    const gameTime = currentGameDate.getTime();
    
    // Check if event has already passed based on game time
    const daysRemaining = Math.ceil((event.date - gameTime) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      // If the event has passed, show an error message
      toast.error("This event has already passed and cannot be reserved.");
      return;
    }
    
    // We're now using the dialog approach for better UX
    setSelectedEventId(eventId);
    setIsEventReservation(true);
    setShowEventDialog(true);
  };
  
  const handleAddConnection = (type: ConnectionType) => {
    if (socialCapital < 25) {
      toast.error("You need at least 25 social capital to find a new connection.");
      return;
    }
    
    // Deduct social capital cost for actively searching
    useSocialNetwork.setState({ socialCapital: socialCapital - 25 });
    
    // Add the connection - the ConnectionNotificationManager will handle displaying the notification
    const newConnection = addConnection(type);
    // No toast here - let the notification manager handle it
  };
  
  const handleGenerateEvents = () => {
    if (socialCapital < 15) {
      toast.error("You need at least 15 social capital to search for events.");
      return;
    }
    
    // Deduct social capital cost
    useSocialNetwork.setState({ socialCapital: socialCapital - 15 });
    
    // Generate new events - the EventNotificationManager will handle displaying the notification
    const newEvents = generateNewEvents(2);
    // No toast here - let the notification manager handle it
  };
  
  // Handler for cancelling/removing events
  const handleRemoveEvent = (eventId: string) => {
    const success = removeEvent(eventId);
    if (success) {
      toast.success("Event cancelled successfully.");
    }
  };
  
  // Get navigate function from react-router-dom
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Networking</h1>
            <p className="text-muted-foreground">Expand your professional network and unlock opportunities</p>
          </div>
        </div>
      </header>
      
      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Networking Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{networkingLevel}</span>
              <span className="text-sm text-muted-foreground ml-2">/100</span>
            </div>
            <Progress value={networkingLevel} max={100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Social Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{socialCapital}<span className="text-sm text-muted-foreground ml-1">/ 200</span></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used to schedule meetings and find new connections
              <br /><span className="text-primary">Monthly boost: +25 base points</span>
              <br /><span className="text-primary">Also regenerates over time and from attending events</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Network Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              <span className="text-2xl font-bold">{connections.length}</span>
              <span className="text-sm text-muted-foreground ml-2">/ 10 connections</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your professional network</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action buttons - improved for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setShowAddConnectionDialog(true)}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Find New Connection</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleGenerateEvents}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Search for Events</span>
        </Button>
      </div>
      
      {/* Main content tabs */}
      <Tabs 
        defaultValue="connections" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections" className="flex items-center justify-center py-2">
            <User className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap text-sm sm:text-base">Connections ({connections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center justify-center py-2">
            <Calendar className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap text-sm sm:text-base">Events ({availableEvents.length})</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Connections Tab */}
        <TabsContent value="connections" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {connections.length === 0 ? (
              <div className="text-center p-8">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No Connections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your professional network to unlock opportunities
                </p>
                <Button onClick={() => setShowAddConnectionDialog(true)}>
                  Find Your First Connection
                </Button>
              </div>
            ) : (
              <div>
                {/* Pending meetings section */}
                {connections.some(c => c.pendingMeeting) && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4">Pending Meetings</h3>
                    {connections
                      .filter(c => c.pendingMeeting)
                      .map(connection => (
                        <ConnectionCard
                          key={connection.id}
                          connection={connection}
                          onScheduleMeeting={handleScheduleMeeting}
                          onAttendMeeting={handleAttendMeeting}
                          onUseBenefit={handleOpenBenefitDialog}
                          onRemove={removeConnection}
                        />
                      ))
                    }
                  </div>
                )}
                
                {/* All connections */}
                <h3 className="text-xl font-bold mb-4">Your Network</h3>
                {connections
                  .filter(c => !c.pendingMeeting)
                  .map(connection => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      onScheduleMeeting={handleScheduleMeeting}
                      onAttendMeeting={handleAttendMeeting}
                      onUseBenefit={handleOpenBenefitDialog}
                      onRemove={removeConnection}
                    />
                  ))
                }
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {availableEvents.length === 0 ? (
              <div className="text-center p-8">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No Events Available</h3>
                <p className="text-muted-foreground mb-4">
                  Search for events to find networking opportunities
                </p>
                <Button onClick={handleGenerateEvents}>
                  Search for Events
                </Button>
              </div>
            ) : (
              <div>
                {/* Calendar view for events */}
                <EventsCalendarView 
                  events={availableEvents}
                  canAttendFn={(event) => wealth >= event.entryFee && prestigeLevel >= event.prestigeRequired}
                  onAttend={handleOpenEventDialog}
                  onRemove={handleRemoveEvent}
                  onReserve={handleReserveEvent}
                />
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <ConfirmBenefitDialog
        open={showBenefitDialog}
        onOpenChange={setShowBenefitDialog}
        benefit={selectedBenefit}
        connection={selectedConnection}
        onConfirm={handleConfirmUseBenefit}
      />
      
      <ConfirmEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        onConfirm={isEventReservation ? handleConfirmReserveEvent : handleConfirmAttendEvent}
        isReservation={isEventReservation}
      />
      
      <AddConnectionDialog
        open={showAddConnectionDialog}
        onOpenChange={setShowAddConnectionDialog}
        onAddConnection={handleAddConnection}
      />
    </div>
  );
}