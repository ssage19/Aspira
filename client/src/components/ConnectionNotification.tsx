import React, { useEffect, useState } from 'react';
import { useSocialNetwork, SocialConnection } from '../lib/stores/useSocialNetwork';
import { X, User, Calendar, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionNotificationProps {
  connection: SocialConnection;
  onClose: () => void;
  onRespond: () => void;
}

export function ConnectionNotification({ connection, onClose, onRespond }: ConnectionNotificationProps) {
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
  const formatType = (type: string) => {
    if (type === 'businessContact') return 'Business Contact';
    if (type === 'industry') return 'Industry Expert';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-4 right-4 max-w-sm w-full bg-card rounded-lg shadow-lg border border-border p-4 z-50"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white ${getColorByType()}`}>
          <User className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">{connection.name} wants to meet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatType(connection.type)} • {connection.expertise.charAt(0).toUpperCase() + connection.expertise.slice(1)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Ignore
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onRespond();
            onClose();
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Respond
        </Button>
      </div>
    </motion.div>
  );
}

export function ConnectionNotificationManager() {
  const { connections } = useSocialNetwork();
  const [notification, setNotification] = useState<SocialConnection | null>(null);

  // Check for new pending meetings
  useEffect(() => {
    // Find connections with pending meetings
    const pendingConnections = connections.filter(c => c.pendingMeeting);
    
    // If there's a pending connection that we're not already showing, show it
    if (pendingConnections.length > 0 && !notification) {
      setNotification(pendingConnections[0]);
    }
  }, [connections, notification]);

  // Handle responding to the connection
  const handleRespond = () => {
    if (notification) {
      // Navigate to the networking screen (this would need to be implemented)
      console.log(`Responding to ${notification.name}`);
      
      // You might want to navigate to the social networking screen here
      // history.push('/networking');
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <ConnectionNotification
          connection={notification}
          onClose={() => setNotification(null)}
          onRespond={handleRespond}
        />
      )}
    </AnimatePresence>
  );
}