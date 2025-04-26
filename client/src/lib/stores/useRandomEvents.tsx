import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";
import { registerStore } from "../utils/storeRegistry";

// Define event categories
export type EventCategory = 
  | "market" 
  | "personal" 
  | "global" 
  | "business" 
  | "lifestyle"
  | "career" 
  | "special"
  | "health";

// Define event effect directions
export type EffectDirection = "positive" | "negative" | "neutral";

// Define event choice structure
export interface EventChoice {
  text: string;
  effect: string;
  outcomes: {
    wealth?: number;
    income?: number;
    happiness?: number;
    stress?: number;
    health?: number;
    prestige?: number;
    intelligence?: number;
    creativity?: number;
    charisma?: number;
    technical?: number;
    leadership?: number;
    achievement?: string;
  };
}

// Define event severity (mainly for health events)
export type EventSeverity = 'minor' | 'moderate' | 'severe' | 'critical';

// Define active event structure (for longer-term effects)
export interface ActiveEvent {
  id: string;
  title?: string; // Used for health events
  name?: string; // Keep for backward compatibility
  description: string;
  category: EventCategory;
  type?: string; // Type of event (e.g., 'health', 'market', etc.)
  startTime?: number; // When the event started
  duration?: number; // in milliseconds, duration of the event
  expiry?: number; // When the event expires
  expires?: number; // Keeping for backward compatibility
  effects: {
    incomeMultiplier?: number;
    happinessChange?: number;
    stressChange?: number;
    healthChange?: number;
    prestigeChange?: number;
    wealth?: number; // For health events that impact wealth
  };
  severity?: EventSeverity; // Severity of the event (mainly for health events)
  isActive?: boolean; // Whether the event is currently active
}

// Define random event structure
export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: EventCategory;
  direction: EffectDirection;
  choices: EventChoice[];
  conditions?: {
    minWealth?: number;
    maxWealth?: number;
    minIncome?: number;
    maxIncome?: number;
    minHappiness?: number;
    minStress?: number;
    minHealth?: number;
    minPrestige?: number;
    hasJob?: boolean;
    minCareerLevel?: number;
    hasProperty?: boolean;
    hasInvestments?: boolean;
    minGameDays?: number;
  };
  rarity: number; // 1-10 with 10 being extremely rare
  // For events with ongoing effects
  duration?: number; // in milliseconds
  ongoingEffects?: {
    incomeMultiplier?: number;
    happinessChange?: number;
    stressChange?: number;
    healthChange?: number;
    prestigeChange?: number;
  };
}

interface RandomEventsState {
  // Event state
  events: RandomEvent[];
  currentEvent: RandomEvent | null;
  activeEvents: ActiveEvent[];
  eventHistory: string[]; // IDs of previously triggered events
  
  // Debug mode
  debugMode: boolean;
  
  // Functions
  checkForNewEvents: () => void;
  triggerEvent: (eventId: string) => void;
  makeChoice: (choiceIndex: number) => void;
  dismissEvent: () => void;
  cleanupExpiredEvents: () => void;
  getActiveEventEffects: () => {
    incomeMultiplier: number;
    happinessChange: number;
    stressChange: number;
    healthChange: number;
    prestigeChange: number;
  };
  setDebugMode: (mode: boolean) => void;
  forceEvent: (eventId: string) => void;
  
  // Add a new active event directly (for health events, etc.)
  addActiveEvent: (event: ActiveEvent) => void;
  
  // Reset all events state
  resetEvents: () => void;
}

const STORAGE_KEY = 'business-empire-events';

// Load events data from local storage
const loadEventsData = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

export const useRandomEvents = create<RandomEventsState>()(
  subscribeWithSelector((set, get) => {
    // Try to load saved data
    const savedData = loadEventsData();
    
    return {
      // Event state
      events: [], // This will be populated from an events database
      currentEvent: savedData?.currentEvent || null,
      activeEvents: savedData?.activeEvents || [],
      eventHistory: savedData?.eventHistory || [],
      
      // Debug mode
      debugMode: false,
      
      // Check for new events based on current game state and conditions
      checkForNewEvents: () => {
        // This is a stub implementation - in the real version, we'd:
        // 1. Check if enough time has passed since last event
        // 2. Check character's state against all event conditions
        // 3. Filter eligible events
        // 4. Apply rarity to determine if event triggers
        // 5. Randomly select one if multiple are eligible
        
        console.log("Checking for new random events...");
        
        // For now, do nothing - full implementation will come later
      },
      
      // Trigger a specific event by ID
      triggerEvent: (eventId: string) => {
        const event = get().events.find(e => e.id === eventId);
        
        if (event) {
          set({ currentEvent: event });
          saveState();
        } else {
          console.error(`Event with ID ${eventId} not found`);
        }
      },
      
      // Process the player's choice for the current event
      makeChoice: (choiceIndex: number) => {
        const { currentEvent, activeEvents, eventHistory } = get();
        
        if (!currentEvent || choiceIndex >= currentEvent.choices.length) {
          console.error("Invalid choice or no current event");
          return;
        }
        
        // Add event to history
        if (!eventHistory.includes(currentEvent.id)) {
          set({ eventHistory: [...eventHistory, currentEvent.id] });
        }
        
        // Check if this event has ongoing effects
        if (currentEvent.duration && currentEvent.ongoingEffects) {
          const now = Date.now();
          
          // Create active event
          const activeEvent: ActiveEvent = {
            id: currentEvent.id,
            name: currentEvent.name,
            description: currentEvent.description,
            category: currentEvent.category,
            startTime: now,
            duration: currentEvent.duration,
            expires: now + currentEvent.duration,
            effects: currentEvent.ongoingEffects
          };
          
          // Add to active events
          set({ activeEvents: [...activeEvents, activeEvent] });
        }
        
        // Clear current event
        set({ currentEvent: null });
        saveState();
      },
      
      // Dismiss the current event without making a choice
      dismissEvent: () => {
        set({ currentEvent: null });
        saveState();
      },
      
      // Clean up expired active events
      cleanupExpiredEvents: () => {
        const now = Date.now();
        const { activeEvents } = get();
        
        // Filter out expired events
        const updatedEvents = activeEvents.filter(event => {
          // Check for both expires and expiry fields for backward compatibility
          const expiryTime = event.expires || event.expiry || 0;
          return expiryTime > now;
        });
        
        // Only update if there's a change
        if (updatedEvents.length !== activeEvents.length) {
          set({ activeEvents: updatedEvents });
          saveState();
        }
      },
      
      // Get combined effects from all active events
      getActiveEventEffects: () => {
        const { activeEvents } = get();
        const now = Date.now();
        
        // Default values (no effect)
        const defaultEffects = {
          incomeMultiplier: 1,
          happinessChange: 0,
          stressChange: 0,
          healthChange: 0,
          prestigeChange: 0
        };
        
        // Return default if no active events
        if (activeEvents.length === 0) {
          return defaultEffects;
        }
        
        // Filter to only current active events
        const currentActiveEvents = activeEvents.filter(event => {
          // Check for both expires and expiry fields for backward compatibility
          const expiryTime = event.expires || event.expiry || 0;
          return expiryTime > now;
        });
        
        // Combine all effects
        return currentActiveEvents.reduce((acc, event) => {
          return {
            incomeMultiplier: acc.incomeMultiplier * (event.effects.incomeMultiplier || 1),
            happinessChange: acc.happinessChange + (event.effects.happinessChange || 0),
            stressChange: acc.stressChange + (event.effects.stressChange || 0),
            healthChange: acc.healthChange + (event.effects.healthChange || 0),
            prestigeChange: acc.prestigeChange + (event.effects.prestigeChange || 0)
          };
        }, defaultEffects);
      },
      
      // Set debug mode
      setDebugMode: (mode: boolean) => {
        set({ debugMode: mode });
      },
      
      // Force an event to trigger (for debugging)
      forceEvent: (eventId: string) => {
        const event = get().events.find(e => e.id === eventId);
        
        if (event) {
          set({ currentEvent: event });
          saveState();
        } else {
          console.error(`Event with ID ${eventId} not found`);
        }
      },
      
      // Add a new active event directly
      addActiveEvent: (event: ActiveEvent) => {
        const { activeEvents } = get();
        
        // Ensure the event has an expiry time if not already set
        if (!event.expiry && !event.expires) {
          // Default to 7 days if not specified
          const duration = event.duration || 7 * 24 * 60 * 60 * 1000;
          event.expiry = Date.now() + duration;
        }
        
        // Add the new event to active events
        set({ activeEvents: [...activeEvents, event] });
        saveState();
      },
      
      // Reset all events state
      resetEvents: () => {
        set({
          events: [], // Will be repopulated on initialization
          currentEvent: null,
          activeEvents: [],
          eventHistory: [],
          debugMode: false
        });
        
        // Remove from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
  })
);

// Helper function to save event state to localStorage
function saveState() {
  const state = useRandomEvents.getState();
  const dataToSave = {
    currentEvent: state.currentEvent,
    activeEvents: state.activeEvents,
    eventHistory: state.eventHistory
  };
  
  setLocalStorage(STORAGE_KEY, dataToSave);
}

// Register with the global store registry
registerStore('randomEvents', useRandomEvents);

export default useRandomEvents;