import React, { useEffect, useState } from 'react';
import { useSocialNetwork, SocialEvent } from '../lib/stores/useSocialNetwork';
import { X, Calendar, Star, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../lib/utils';
import { useGame } from '../lib/stores/useGame';

interface EventNotificationProps {
  event: SocialEvent;
  onClose: () => void;
  onView: () => void;
}

export function EventNotification({ event, onClose, onView }: EventNotificationProps) {
  // Get event type color
  const getColorByType = () => {
    switch (event.type) {
      case 'charity':
        return 'bg-pink-500';
      case 'business':
        return 'bg-blue-500';
      case 'gala':
        return 'bg-purple-500';
      case 'conference':
        return 'bg-amber-500';
      case 'club':
        return 'bg-green-500';
      case 'party':
        return 'bg-indigo-500';
      case 'networking':
        return 'bg-cyan-500';
      default:
        return 'bg-slate-500';
    }
  };

  // Calculate days until the event
  const daysUntil = Math.ceil((event.date - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-4 right-4 max-w-sm w-full bg-card rounded-lg shadow-lg border border-border p-4 z-50"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white ${getColorByType()}`}>
          <Calendar className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">New Event: {event.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)} • {daysUntil} days away
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            {formatCurrency(event.entryFee)}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            Level {event.prestigeRequired} Required
          </div>
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
          <Calendar className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>
    </motion.div>
  );
}

export function EventNotificationManager() {
  // No longer showing event notifications per user request
  // Users will need to visit the events tab to discover new events
  
  // Still need to return something for rendering even though it's empty
  const [notification, setNotification] = useState<SocialEvent | null>(null);
  
  // Keep track of events in localStorage but don't show notifications
  const [shownEvents, setShownEvents] = useState<Map<string, number>>(
    () => {
      // Try to load from localStorage
      try {
        const saved = localStorage.getItem('shown-events');
        if (saved) {
          return new Map(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load shown events from localStorage', e);
      }
      return new Map();
    }
  );

  // Persist shown events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shown-events', 
        JSON.stringify(Array.from(shownEvents.entries()))
      );
    } catch (e) {
      console.error('Failed to save shown events to localStorage', e);
    }
  }, [shownEvents]);

  // Dummy function kept for API compatibility
  const handleViewEvent = () => {
    window.location.href = '/networking';
  };

  return (
    <AnimatePresence>
      {notification && (
        <EventNotification
          event={notification}
          onClose={() => setNotification(null)}
          onView={handleViewEvent}
        />
      )}
    </AnimatePresence>
  );
}