/**
 * Persistent State Manager
 * 
 * This utility provides a robust system for ensuring game state is always
 * saved locally, even when the application is closed or crashes.
 * 
 * It implements:
 * 1. Periodic automatic state saving
 * 2. Event-based state saving (on important game actions)
 * 3. Proper shutdown state persistence
 * 4. Metadata about the last saved state for validation
 */

// Store references - we need to get these at runtime to avoid circular dependencies
let useCharacter: any;
let useTime: any;
let useAssetTracker: any;
let useEconomy: any;

// This function must be called before any operations
function loadStores() {
  try {
    if (!useCharacter) {
      useCharacter = require('../stores/useCharacter').useCharacter;
    }
    
    if (!useTime) {
      useTime = require('../stores/useTime').useTime;
    }
    
    if (!useAssetTracker) {
      useAssetTracker = require('../stores/useAssetTracker').useAssetTracker;
    }
    
    if (!useEconomy) {
      useEconomy = require('../stores/useEconomy').useEconomy;
    }
    
    return !!useCharacter && !!useTime;
  } catch (error) {
    console.error('Failed to load stores:', error);
    return false;
  }
}

// Helper to validate stores are available
function validateStores() {
  try {
    // Basic validation of critical stores
    if (!useCharacter || !useCharacter.getState) {
      console.error('Character store is not properly initialized');
      return false;
    }
    
    if (!useTime || !useTime.getState) {
      console.error('Time store is not properly initialized');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating stores:', error);
    return false;
  }
}

// Key names for localStorage
const LAST_SAVE_TIMESTAMP_KEY = 'business-empire-last-save';
const STATE_VERSION_KEY = 'business-empire-state-version';
const SHUTDOWN_STATE_KEY = 'business-empire-shutdown-state';

// Current state version - increment when adding new critical state properties
const CURRENT_STATE_VERSION = 1;

// How often to auto-save in milliseconds (default: 1 minute)
const AUTO_SAVE_INTERVAL = 60 * 1000;

// Flag to track if background saving is active
let isBackgroundSavingActive = false;
let autoSaveInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize the persistent state manager
 * 
 * This starts the automatic saving process and sets up event listeners
 * for proper shutdown state handling.
 */
export function initPersistentStateManager() {
  // Don't initialize more than once
  if (isBackgroundSavingActive) return;
  
  console.log('Initializing persistent state manager...');
  
  // Set up automatic periodic saving
  autoSaveInterval = setInterval(() => {
    saveAllGameState();
  }, AUTO_SAVE_INTERVAL);
  
  // Set up window beforeunload handler for proper shutdown
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.log('Application closing - saving final state');
      saveShutdownState();
    });
    
    // Also handle visibility change (tab hidden/visible)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Tab is now hidden/inactive - save state
        console.log('Tab hidden - saving current state');
        saveAllGameState();
        
        // Also save shutdown state in case the user doesn't return
        saveShutdownState();
      } else if (document.visibilityState === 'visible') {
        // Tab is now visible/active again - process any offline time
        console.log('Tab visible again - processing any offline time');
        processOfflineTimeIfNeeded();
      }
    });
  }
  
  isBackgroundSavingActive = true;
  console.log('Persistent state manager initialized');
}

/**
 * Stop the background saving process
 * This is mainly used for cleanup during component unmounting
 */
export function stopPersistentStateManager() {
  if (!isBackgroundSavingActive) return;
  
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  
  // Save one final time
  saveAllGameState();
  
  isBackgroundSavingActive = false;
  console.log('Persistent state manager stopped');
}

/**
 * Save the current state of all game stores to localStorage
 * This is the main function that ensures all state is persisted
 */
export function saveAllGameState() {
  try {
    // Load stores first
    if (!loadStores()) {
      console.error('Failed to load stores - cannot save game state');
      return;
    }
    
    // 1. Get current states from all stores
    const characterState = useCharacter.getState();
    const timeState = useTime.getState();
    const assetState = useAssetTracker.getState();
    const economyState = useEconomy.getState();
    
    // 2. Save individual states (each store handles its own serialization)
    characterState.saveState();
    
    // 3. Update metadata about this save
    const now = Date.now();
    localStorage.setItem(LAST_SAVE_TIMESTAMP_KEY, now.toString());
    localStorage.setItem(STATE_VERSION_KEY, CURRENT_STATE_VERSION.toString());
    
    // 4. Log save for debugging
    console.log(`Game state saved at ${new Date(now).toLocaleTimeString()}`);
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

/**
 * Save special shutdown state when the application is closing
 * This includes additional metadata to help with resuming
 */
export function saveShutdownState() {
  try {
    // Validate stores before proceeding
    if (!validateStores()) {
      console.error('Failed to validate stores - cannot save shutdown state');
      return;
    }
    
    // 1. Get the time state
    const timeState = useTime.getState();
    
    // 2. Create a shutdown state object with metadata
    const shutdownState = {
      timestamp: Date.now(),
      wasPaused: timeState.timeSpeed === 'paused',
      gameDate: {
        day: timeState.currentDay,
        month: timeState.currentMonth,
        year: timeState.currentYear
      },
      timeSpeed: timeState.timeSpeed,
      timeMultiplier: timeState.timeMultiplier
    };
    
    // 3. Save to localStorage
    localStorage.setItem(SHUTDOWN_STATE_KEY, JSON.stringify(shutdownState));
    
    // 4. Make sure individual stores are saved too
    saveAllGameState();
    
    console.log('Shutdown state saved successfully');
  } catch (error) {
    console.error('Error saving shutdown state:', error);
  }
}

/**
 * Process any offline time that may have passed since the last save
 * This is separate from the useTime.processOfflineTime function but works with it
 */
export function processOfflineTimeIfNeeded() {
  try {
    // 1. Get the last save timestamp
    const lastSaveStr = localStorage.getItem(LAST_SAVE_TIMESTAMP_KEY);
    if (!lastSaveStr) {
      console.log('No previous saved state found - skipping offline processing');
      return;
    }
    
    const lastSave = parseInt(lastSaveStr, 10);
    const now = Date.now();
    const timeSinceLastSave = now - lastSave;
    
    // Skip if less than 5 seconds have passed
    if (timeSinceLastSave < 5000) {
      console.log('Less than 5 seconds since last save - skipping offline processing');
      return;
    }
    
    // Validate stores before proceeding
    if (!validateStores()) {
      console.error('Failed to validate stores - cannot process offline time');
      return;
    }
    
    // 2. Check shutdown state for additional context
    const shutdownStateStr = localStorage.getItem(SHUTDOWN_STATE_KEY);
    if (shutdownStateStr) {
      try {
        const shutdownState = JSON.parse(shutdownStateStr);
        
        // Update the time state with the shutdown metadata before processing offline time
        const timeState = useTime.getState();
        
        // Set wasPaused directly - this affects whether offline time is processed
        useTime.setState({ wasPaused: shutdownState.wasPaused || false });
        
        // Clear the shutdown state since we've used it
        localStorage.removeItem(SHUTDOWN_STATE_KEY);
      } catch (parseError) {
        console.error('Error parsing shutdown state:', parseError);
      }
    }
    
    // 3. Process offline time using the regular mechanism
    // This will trigger timeStore.processOfflineTime() which will in turn
    // process daily/weekly/monthly updates and calculate offline income
    console.log(`Processing ${(timeSinceLastSave / 1000).toFixed(1)} seconds of offline time`);
    useTime.getState().processOfflineTime();
    
    // 4. Save the updated state after processing
    saveAllGameState();
  } catch (error) {
    console.error('Error processing offline time:', error);
  }
}

/**
 * Check if there's existing game state saved in localStorage
 * @returns True if there's existing state, false otherwise
 */
export function hasSavedGameState(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for character state as the main indicator
  const savedCharacter = localStorage.getItem('business-empire-character');
  return !!savedCharacter;
}

/**
 * Reset all saved game state
 * This completely wipes all saved data
 */
export function resetAllSavedGameState() {
  if (typeof window === 'undefined') return;
  
  // Remove all game-related localStorage items
  localStorage.removeItem('business-empire-character');
  localStorage.removeItem('business-empire-time');
  localStorage.removeItem('business-empire-assets');
  localStorage.removeItem('business-empire-economy');
  localStorage.removeItem(LAST_SAVE_TIMESTAMP_KEY);
  localStorage.removeItem(STATE_VERSION_KEY);
  localStorage.removeItem(SHUTDOWN_STATE_KEY);
  
  console.log('All saved game state has been reset');
}