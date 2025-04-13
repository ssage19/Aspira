import React, { useEffect, useState } from 'react';
import { useSocialNetwork, SocialConnection } from '../lib/stores/useSocialNetwork';
import { X, User, Star } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../lib/stores/useGame';

interface ConnectionNotificationProps {
  connection: SocialConnection;
  onClose: () => void;
  onView: () => void;
}

export function ConnectionNotification({ connection, onClose, onView }: ConnectionNotificationProps) {
  // Get connection type color
  const getColorByType = () => {
    switch (connection.type) {
      case 'mentor':
        return 'bg-blue-500';
      case 'rival':
        return 'bg-red-500';
      case 'businessContact':
        return 'bg-green-500';
      case 'investor':
        return 'bg-purple-500';
      case 'industry':
        return 'bg-amber-500';
      case 'celebrity':
        return 'bg-pink-500';
      case 'influencer':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-500';
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-20 md:bottom-4 right-4 max-w-sm w-full bg-card rounded-lg shadow-lg border border-border p-4 z-50"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white ${getColorByType()}`}>
          <User className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">New Connection: {connection.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatConnectionType(connection.type)} • {connection.expertise.charAt(0).toUpperCase() + connection.expertise.slice(1)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-3 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          {connection.benefits.length} potential benefits
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Dismiss
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onView();
            onClose();
          }}
        >
          <User className="h-4 w-4 mr-2" />
          View Connection
        </Button>
      </div>
    </motion.div>
  );
}

export function ConnectionNotificationManager() {
  const { connections } = useSocialNetwork();
  const { phase } = useGame();
  const [notification, setNotification] = useState<SocialConnection | null>(null);
  
  // Track when the user first sees connections by storing timestamp
  // This ensures only newly added connections are shown after game restarts
  const [shownConnections, setShownConnections] = useState<Map<string, number>>(
    () => {
      // Try to load from localStorage
      try {
        const saved = localStorage.getItem('shown-connections');
        if (saved) {
          return new Map(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load shown connections from localStorage', e);
      }
      return new Map();
    }
  );

  // Persist shown connections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shown-connections', 
        JSON.stringify(Array.from(shownConnections.entries()))
      );
    } catch (e) {
      console.error('Failed to save shown connections to localStorage', e);
    }
  }, [shownConnections]);

  // Check for new connections
  useEffect(() => {
    // Don't show notifications if:
    // 1. There's already an active notification
    // 2. The game is not in playing phase (e.g., during character creation)
    if (notification || phase !== "playing") return;
    
    // Find new connections the user hasn't been notified about yet
    const currentTime = Date.now();
    const newConnections = connections.filter(c => {
      // Get when this connection was created (or use current time if we don't know)
      const connectionTime = c.lastInteractionDate;
      
      // Get when this connection was first shown to the user (or 0 if never shown)
      const firstShownTime = shownConnections.get(c.id) || 0;
      
      // This is a new connection if it was created after it was last shown
      // Or if it has never been shown at all
      return firstShownTime === 0 || connectionTime > firstShownTime;
    });
    
    // If there's a new connection, show notification for it
    if (newConnections.length > 0) {
      const connectionToShow = newConnections[0];
      setNotification(connectionToShow);
      
      // Mark this connection as shown with current timestamp
      setShownConnections(prev => {
        const updated = new Map(prev);
        updated.set(connectionToShow.id, currentTime);
        return updated;
      });
    }
  }, [connections, notification, shownConnections, phase]);

  // Handle viewing connection details
  const handleViewConnection = () => {
    if (notification) {
      // Navigate to the networking screen
      console.log(`Viewing connection: ${notification.name}`);
      
      // Use the window.location to ensure navigation happens
      window.location.href = '/networking';
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <ConnectionNotification
          connection={notification}
          onClose={() => setNotification(null)}
          onView={handleViewConnection}
        />
      )}
    </AnimatePresence>
  );
}