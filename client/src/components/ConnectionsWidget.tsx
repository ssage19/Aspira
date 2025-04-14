import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  ConnectionType, 
  SocialConnection, 
  useSocialNetwork 
} from "../lib/stores/useSocialNetwork";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getConnectionTypeIcon = (type: ConnectionType) => {
  const colorMap: Record<ConnectionType, string> = {
    mentor: "text-amber-500",
    rival: "text-red-500",
    businessContact: "text-blue-500",
    investor: "text-green-500",
    industry: "text-purple-500",
    celebrity: "text-pink-500",
    influencer: "text-orange-500"
  };

  return (
    <div className={`h-2 w-2 rounded-full bg-current ${colorMap[type]}`} />
  );
};

const getConnectionTypeLabel = (type: ConnectionType) => {
  const styleMap: Record<ConnectionType, string> = {
    mentor: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    rival: "bg-red-500/10 border-red-500/30 text-red-500",
    businessContact: "bg-blue-500/10 border-blue-500/30 text-blue-500", 
    investor: "bg-green-500/10 border-green-500/30 text-green-500",
    industry: "bg-purple-500/10 border-purple-500/30 text-purple-500",
    celebrity: "bg-pink-500/10 border-pink-500/30 text-pink-500",
    influencer: "bg-orange-500/10 border-orange-500/30 text-orange-500",
  };

  return styleMap[type];
};

/**
 * A dashboard widget that displays the player's top connections
 */
export function ConnectionsWidget() {
  const { connections } = useSocialNetwork();
  const navigate = useNavigate();

  // Sort connections by relationship level and take the top 3
  const topConnections = [...connections]
    .sort((a, b) => b.relationshipLevel - a.relationshipLevel)
    .slice(0, 3);

  if (topConnections.length === 0) {
    return (
      <Card className="futuristic-card border-cyan-500/30 shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <div className="mr-3 p-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-primary font-medium">Network Connections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>No connections established yet</p>
            <p className="text-sm mt-2">Visit the Networking section to build your network</p>
            <Button 
              variant="outline" 
              className="mt-4 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:hover:bg-cyan-950"
              onClick={(e) => {
                e.preventDefault();
                navigate('/networking');
              }}
            >
              Start Networking
            </Button>
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
            <Users className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-primary font-medium">Network Connections</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topConnections.map(connection => (
            <ConnectionItem key={connection.id} connection={connection} />
          ))}
          
          {connections.length > 3 && (
            <div className="text-right mt-4">
              <Button
                variant="ghost" 
                className="text-xs text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                onClick={(e) => {
                  e.preventDefault(); 
                  navigate('/networking');
                }}
              >
                View all ({connections.length})
              </Button>
            </div>
          )}
          
          {connections.length <= 3 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              <p>Build your network to unlock more opportunities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const ConnectionItem = ({ connection }: { connection: SocialConnection }) => {
  return (
    <div className="flex items-start p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between">
          <span className="font-medium text-primary">{connection.name}</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${getConnectionTypeLabel(connection.type)}`}
          >
            <span className="flex items-center">
              {getConnectionTypeIcon(connection.type)}
              <span className="ml-1">{connection.type}</span>
            </span>
          </Badge>
        </div>
        <div className="mt-1 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{connection.expertise}</div>
          <div className="text-xs bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/10">
            Level {connection.relationshipLevel}
          </div>
        </div>
      </div>
    </div>
  );
};