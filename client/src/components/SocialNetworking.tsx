import React, { useState } from 'react';
import { useSocialNetwork, ConnectionType, SocialConnection, SocialEvent, ConnectionBenefit } from '../lib/stores/useSocialNetwork';
import { useCharacter } from '../lib/stores/useCharacter';
import { usePrestige } from '../lib/stores/usePrestige';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  User, Users, UserPlus, UserMinus, Calendar, Award,
  TrendingUp, MessageCircle, Gift, Briefcase, 
  CreditCard, AlertTriangle, Star, Clock, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

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
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ 
  connection, 
  onScheduleMeeting, 
  onAttendMeeting,
  onUseBenefit
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

  // Get unused benefits
  const unusedBenefits = benefits.filter(b => !b.used);

  return (
    <Card className="mb-4 bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              {name} 
              <Badge 
                className={`ml-2 ${getConnectionTypeColor(type)} text-white text-xs px-2`}
              >
                {formatConnectionType(type)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {formatExpertiseArea(expertise)} Expert • {formatConnectionStatus(status)}
            </CardDescription>
          </div>
          
          {/* Action buttons */}
          <div>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onScheduleMeeting(id)}
                className="flex items-center"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Schedule Meeting
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
              <div key={benefit.id} className="flex justify-between items-center mb-2 text-sm border-l-2 border-primary pl-2">
                <span>{benefit.description}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUseBenefit(id, benefit.id)}
                  className="ml-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
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
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  canAfford, 
  canAttend,
  onAttend 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format event date
  const formattedDate = formatDate(new Date(event.date));
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((event.date - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="mb-4 bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <CardDescription className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formattedDate} • {event.location}
            </CardDescription>
          </div>
          
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
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {daysRemaining} days remaining
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="default"
                      disabled={!canAttend || !canAfford}
                      onClick={() => onAttend(event.id)}
                    >
                      Attend Event
                    </Button>
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
}

const ConfirmEventDialog: React.FC<ConfirmEventDialogProps> = ({
  open,
  onOpenChange,
  event,
  onConfirm
}) => {
  if (!event) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Attend {event.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cost {formatCurrency(event.entryFee)}. You'll have the opportunity to make new connections and gain social capital.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Attend</AlertDialogAction>
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
    addConnection,
    generateNewEvents
  } = useSocialNetwork();
  
  const { wealth } = useCharacter();
  const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
  
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
    if (socialCapital < 10) {
      toast.error("You need more social capital to schedule this meeting.");
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
  
  const handleOpenEventDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEventDialog(true);
  };
  
  const handleConfirmAttendEvent = () => {
    if (selectedEventId) {
      const result = attendEvent(selectedEventId);
      if (result.success) {
        toast.success(`You attended the event and met ${result.newConnections.length} new connections!`);
      }
      setShowEventDialog(false);
    }
  };
  
  const handleAddConnection = (type: ConnectionType) => {
    if (socialCapital < 25) {
      toast.error("You need at least 25 social capital to find a new connection.");
      return;
    }
    
    // Deduct social capital cost for actively searching
    useSocialNetwork.setState({ socialCapital: socialCapital - 25 });
    
    // Add the connection
    const newConnection = addConnection(type);
    toast.success(`You connected with ${newConnection.name}!`);
  };
  
  const handleGenerateEvents = () => {
    if (socialCapital < 15) {
      toast.error("You need at least 15 social capital to search for events.");
      return;
    }
    
    // Deduct social capital cost
    useSocialNetwork.setState({ socialCapital: socialCapital - 15 });
    
    // Generate new events
    const newEvents = generateNewEvents(2);
    toast.success(`You discovered ${newEvents.length} new events!`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Social Networking</h1>
        <p className="text-muted-foreground">Expand your professional network and unlock opportunities</p>
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
              <span className="text-2xl font-bold">{socialCapital}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used to schedule meetings and find new connections</p>
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
              <span className="text-sm text-muted-foreground ml-2">connections</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your professional network</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => setShowAddConnectionDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Find New Connection
        </Button>
        
        <Button variant="outline" onClick={handleGenerateEvents}>
          <Calendar className="h-4 w-4 mr-2" />
          Search for Events
        </Button>
      </div>
      
      {/* Main content tabs */}
      <Tabs 
        defaultValue="connections" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="connections">
            <User className="h-4 w-4 mr-2" />
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events ({availableEvents.length})
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
                <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
                {availableEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    canAfford={wealth >= event.entryFee}
                    canAttend={prestigeLevel >= event.prestigeRequired}
                    onAttend={handleOpenEventDialog}
                  />
                ))}
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
        onConfirm={handleConfirmAttendEvent}
      />
      
      <AddConnectionDialog
        open={showAddConnectionDialog}
        onOpenChange={setShowAddConnectionDialog}
        onAddConnection={handleAddConnection}
      />
    </div>
  );
}