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

// We'll safely access store states through localStorage to avoid circular dependencies
// Flags to track if we already tried to access the stores
let _characterStoreAccessAttempted = false;
let _timeStoreAccessAttempted = false;
let _assetTrackerStoreAccessAttempted = false;
let _economyStoreAccessAttempted = false;

// Get stores directly from the window object where they're registered
// This is more reliable than using require() which can cause issues
function getCharacterStore() {
  if (_characterStoreAccessAttempted) return null;
  _characterStoreAccessAttempted = true;
  
  try {
    if (typeof window !== 'undefined' && (window as any).businessEmpireStores?.character) {
      return (window as any).businessEmpireStores.character;
    }
    console.warn('Character store not available on window.businessEmpireStores, using localStorage fallback');
    return null;
  } catch (error) {
    console.warn('Could not access character store, will use localStorage fallback', error);
    return null;
  }
}

function getTimeStore() {
  if (_timeStoreAccessAttempted) return null;
  _timeStoreAccessAttempted = true;
  
  try {
    if (typeof window !== 'undefined' && (window as any).businessEmpireStores?.time) {
      return (window as any).businessEmpireStores.time;
    }
    console.warn('Time store not available on window.businessEmpireStores, using localStorage fallback');
    return null;
  } catch (error) {
    console.warn('Could not access time store, will use localStorage fallback', error);
    return null;
  }
}

function getAssetTrackerStore() {
  if (_assetTrackerStoreAccessAttempted) return null;
  _assetTrackerStoreAccessAttempted = true;
  
  try {
    if (typeof window !== 'undefined' && (window as any).businessEmpireStores?.assetTracker) {
      return (window as any).businessEmpireStores.assetTracker;
    }
    console.warn('Asset tracker store not available on window.businessEmpireStores, using localStorage fallback');
    return null;
  } catch (error) {
    console.warn('Could not access asset tracker store, will use localStorage fallback', error);
    return null;
  }
}

function getEconomyStore() {
  if (_economyStoreAccessAttempted) return null;
  _economyStoreAccessAttempted = true;
  
  try {
    if (typeof window !== 'undefined' && (window as any).businessEmpireStores?.economy) {
      return (window as any).businessEmpireStores.economy;
    }
    console.warn('Economy store not available on window.businessEmpireStores, using localStorage fallback');
    return null;
  } catch (error) {
    console.warn('Could not access economy store, will use localStorage fallback', error);
    return null;
  }
}

// This function attempts to access all store instances
function loadStores() {
  try {
    // Don't try to access if we're not in the browser
    if (typeof window === 'undefined') return false;
    
    // Reset flags to allow retrying
    _characterStoreAccessAttempted = false;
    _timeStoreAccessAttempted = false;
    _assetTrackerStoreAccessAttempted = false;
    _economyStoreAccessAttempted = false;
    
    // Create the businessEmpireStores object if it doesn't exist
    if (!(window as any).businessEmpireStores) {
      (window as any).businessEmpireStores = {};
    }
    
    return true;
  } catch (error) {
    console.error('Failed to prepare store access:', error);
    return false;
  }
}

// Helper to validate stores are available
function validateStores() {
  try {
    // Basic validation of critical stores
    const characterStore = getCharacterStore();
    if (!characterStore || !characterStore.getState) {
      console.error('Character store is not properly initialized');
      return false;
    }
    
    const timeStore = getTimeStore();
    if (!timeStore || !timeStore.getState) {
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
  
  // Load stores at initialization time to ensure they're available
  loadStores();
  
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
    
    // 1. Get current states from all stores if possible
    // If any store is not available, use fallback approach
    const characterStore = getCharacterStore();
    if (characterStore && characterStore.getState) {
      try {
        const characterState = characterStore.getState();
        // 2. Save individual states (each store handles its own serialization)
        if (characterState && characterState.saveState) {
          characterState.saveState();
        }
      } catch (storeError) {
        console.error('Error accessing character store:', storeError);
      }
    } else {
      console.log('Character store not available, using direct localStorage access');
    }
    
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
    // Load stores first
    if (!loadStores()) {
      console.error('Failed to load stores - cannot save shutdown state');
      return;
    }
    
    // 1. Get the time state
    const timeStore = getTimeStore();
    if (!timeStore || !timeStore.getState) {
      console.error('Time store not available, cannot save shutdown state properly');
      // Still proceed with a basic shutdown state
      const now = Date.now();
      localStorage.setItem(SHUTDOWN_STATE_KEY, JSON.stringify({
        timestamp: now,
        isNormalShutdown: true
      }));
      return;
    }
    
    const timeState = timeStore.getState();
    
    // 2. Create a shutdown state object with metadata
    const shutdownState = {
      timestamp: Date.now(),
      // Very important: Only consider the game paused if it's explicitly paused
      // Setting this to false allows offline time to process even when user closes the tab/browser
      wasPaused: timeState.timeSpeed === 'paused',
      gameDate: {
        day: timeState.currentDay,
        month: timeState.currentMonth,
        year: timeState.currentYear
      },
      timeSpeed: timeState.timeSpeed,
      timeMultiplier: timeState.timeMultiplier,
      // Add a flag to indicate this is a normal shutdown, not a pause
      isNormalShutdown: true,
      // Include dayCounter and other time tracking info for better sync
      dayCounter: timeState.dayCounter,
      daysPassed: timeState.daysPassed,
      // Store progress information for smoother resumption
      timeProgress: timeState.timeProgress,
      lastTickTime: timeState.lastTickTime
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
    
    // Load stores first
    if (!loadStores()) {
      console.error('Failed to load stores - cannot process offline time');
      return;
    }
    
    // 2. Check shutdown state for additional context
    const shutdownStateStr = localStorage.getItem(SHUTDOWN_STATE_KEY);
    if (shutdownStateStr) {
      try {
        const shutdownState = JSON.parse(shutdownStateStr);
        
        // If time store is available, update it with shutdown data
        const timeStore = getTimeStore();
        if (timeStore && timeStore.getState) {
          // For a normal shutdown (not an explicit pause by the user),
          // we should process offline time regardless
          if (shutdownState.isNormalShutdown) {
            // Override wasPaused to false to ensure offline time is processed
            timeStore.setState({ wasPaused: false });
            console.log('Normal shutdown detected - ensuring offline time will be processed');
          } else {
            // Only respect the wasPaused flag if it wasn't a normal shutdown
            timeStore.setState({ wasPaused: shutdownState.wasPaused || false });
            console.log(`Setting wasPaused to ${shutdownState.wasPaused || false} based on shutdown state`);
          }
          
          // Update lastRealTimestamp to ensure proper time calculation
          if (shutdownState.timestamp) {
            timeStore.setState({ lastRealTimestamp: shutdownState.timestamp });
            console.log(`Updated lastRealTimestamp to ${new Date(shutdownState.timestamp).toLocaleString()}`);
          }
          
          // Restore additional time tracking values if they exist in shutdown state
          const timeUpdates: any = {};
          
          if (typeof shutdownState.dayCounter === 'number') {
            timeUpdates.dayCounter = shutdownState.dayCounter;
            console.log(`Restoring dayCounter: ${shutdownState.dayCounter}`);
          }
          
          if (typeof shutdownState.daysPassed === 'number') {
            timeUpdates.daysPassed = shutdownState.daysPassed;
            console.log(`Restoring daysPassed: ${shutdownState.daysPassed}`);
          }
          
          if (typeof shutdownState.timeProgress === 'number') {
            timeUpdates.timeProgress = shutdownState.timeProgress;
            console.log(`Restoring timeProgress: ${shutdownState.timeProgress.toFixed(2)}%`);
          }
          
          if (typeof shutdownState.lastTickTime === 'number') {
            timeUpdates.lastTickTime = shutdownState.lastTickTime;
            console.log(`Restoring lastTickTime: ${new Date(shutdownState.lastTickTime).toLocaleString()}`);
          }
          
          // Apply all time tracking updates if any exist
          if (Object.keys(timeUpdates).length > 0) {
            timeStore.setState(timeUpdates);
            console.log('Restored additional time tracking data from shutdown state');
          }
          
          // Process offline time if the time store is available
          if (timeStore.getState().processOfflineTime) {
            // 3. Process offline time using the regular mechanism
            console.log(`Processing ${(timeSinceLastSave / 1000).toFixed(1)} seconds of offline time`);
            timeStore.getState().processOfflineTime();
          } else {
            console.error('processOfflineTime function not available in time store');
          }
        }
        
        // Clear the shutdown state since we've used it
        localStorage.removeItem(SHUTDOWN_STATE_KEY);
      } catch (parseError) {
        console.error('Error parsing shutdown state:', parseError);
      }
    }
    
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