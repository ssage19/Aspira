import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useSocialNetwork } from "../lib/stores/useSocialNetwork";
import { 
  Calendar, 
  Clock, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  formatDistanceToNow
} from 'date-fns';
import { useGameTime } from "../lib/hooks/useGameTime";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { SocialEvent } from "../lib/stores/useSocialNetwork";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "../lib/utils";
import { useTime } from "../lib/stores/useTime";

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
 * Individual event item shown in calendar
 */
const EventItem: React.FC<{ event: SocialEvent, isSmall?: boolean }> = ({ event, isSmall }) => {
  const eventDate = new Date(event.date);
  
  if (isSmall) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`h-2 w-2 rounded-full ${getEventTypeColor(event.type)} cursor-pointer`}
              key={event.id}
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-bold">{event.name}</p>
              <p>{format(eventDate, 'h:mm a')}</p>
              <p className="italic">{event.type}</p>
              <p className="text-xs opacity-80">{event.reserved ? "Reserved" : "Not reserved"}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div 
      className={`
        px-1 py-0.5 text-xs truncate rounded flex flex-row gap-1 items-center
        ${getEventTypeColor(event.type)}/90 text-white border border-white/10 cursor-pointer
      `}
      key={event.id}
    >
      <div className="flex items-center">
        <span className="text-xs">{format(eventDate, 'h:mm a')}</span>
      </div>
      <span className="truncate">{event.name}</span>
    </div>
  );
};

/**
 * Calendar day cell component
 */
interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  events: SocialEvent[];
  isGameCurrent: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date, 
  currentMonth, 
  events,
  isGameCurrent
}) => {
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.date), date)
  );

  const isOutsideMonth = !isSameMonth(date, currentMonth);
  const isToday = isGameCurrent && isSameDay(date, new Date());
  
  return (
    <div 
      className={cn(
        "p-1 border min-h-[60px] text-sm overflow-hidden flex flex-col",
        isOutsideMonth ? "bg-muted/30 text-muted-foreground" : "bg-card",
        isToday ? "ring-2 ring-cyan-500 ring-inset" : ""
      )}
    >
      <div className="font-medium text-right mb-1">
        {format(date, 'd')}
      </div>
      
      {dayEvents.length > 0 && (
        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
          {dayEvents.length <= 2 ? (
            // Show full event details if 2 or fewer events
            dayEvents.map(event => (
              <EventItem key={event.id} event={event} />
            ))
          ) : (
            // Show dots for each event if more than 2
            <div className="flex flex-wrap gap-1 mt-1">
              {dayEvents.map(event => (
                <EventItem key={event.id} event={event} isSmall />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * A dashboard widget that displays upcoming social events in a calendar view
 */
export function UpcomingEventsWidget() {
  const { events } = useSocialNetwork();
  const { gameTime } = useGameTime();
  const { currentGameDate } = useTime();
  
  // Navigate between months
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(currentGameDate));
  
  // Only show unattended events that are upcoming
  const upcomingEvents = useMemo(() => events
    .filter(event => !event.attended && new Date(event.date) >= gameTime)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events, gameTime]
  );

  // Get the events for the current month view
  const visibleEvents = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });
  }, [upcomingEvents, currentMonth]);

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

  // Simple list view for small widget - shows next 3 events
  const nextFewEvents = upcomingEvents.slice(0, 3);

  return (
    <Card className="futuristic-card border-cyan-500/30 shadow-lg h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <div className="mr-3 p-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-primary font-medium">Upcoming Events</span>
          </CardTitle>
          
          {/* Month navigation controls */}
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={resetToCurrentMonth}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pb-2">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No upcoming events scheduled</p>
            <p className="text-sm mt-2">Visit the Networking section to find events</p>
          </div>
        ) : (
          <>
            {/* Calendar view */}
            <div className="w-full">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 text-center text-xs font-medium border-b py-1">
                {WEEKDAYS.map(day => (
                  <div key={day} className="px-1">{day}</div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map(day => (
                  <CalendarDay 
                    key={day.toString()} 
                    date={day} 
                    currentMonth={currentMonth}
                    events={upcomingEvents}
                    isGameCurrent={format(currentGameDate, 'MM/yyyy') === format(currentMonth, 'MM/yyyy')}
                  />
                ))}
              </div>
            </div>
            
            {/* Upcoming events list - for easy reference */}
            {nextFewEvents.length > 0 && (
              <div className="mt-2 space-y-2 px-1">
                <div className="text-sm font-medium border-b pb-1">Next Events</div>
                {nextFewEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-start p-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                  >
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">{event.name}</span>
                        <Badge variant="outline" className="bg-cyan-500/10 text-xs border-cyan-500/30 text-cyan-500">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(event.date), 'MMM d, h:mm a')}
                        <span className="ml-2">
                          ({formatDistanceToNow(new Date(event.date), { addSuffix: true })})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}