import { useCharacter } from '../stores/useCharacter';
import { useRandomEvents, EventSeverity } from '../stores/useRandomEvents';
import { useAudio } from '../stores/useAudio';
import { getEventBySeverity, calculateEventCost, HealthEvent, checkForCharacterDeath, getEventCount } from '../data/healthEvents';
import { useGame } from '../stores/useGame';
import { toast } from 'sonner';
import React from 'react';

// Constants
const CRITICAL_HEALTH_THRESHOLD = 8; // 8% health is considered critical (reduced from 10%)
const LOW_HEALTH_THRESHOLD = 20; // 20% health is considered low (reduced from 25%)
const HEALTH_CHECK_INTERVAL = 120000; // Check health every 2 minutes (increased from 1 minute)

// Store last health event time
let lastHealthEventTime = 0;
// Cooldown between health events (in milliseconds)
const HEALTH_EVENT_COOLDOWN = 14 * 24 * 60 * 60 * 1000; // 14 days (increased from 7 days)

// Maximum number of health events per game year to prevent excessive health issues
const MAX_HEALTH_EVENTS_PER_YEAR = 3;

// Track if character has died
let characterDied = false;

export function initializeHealthMonitor() {
  // Start monitoring health
  const intervalId = setInterval(checkHealthStatus, HEALTH_CHECK_INTERVAL);
  
  // Return a cleanup function
  return () => clearInterval(intervalId);
}

export function checkHealthStatus() {
  const character = useCharacter.getState();
  const { playSound } = useAudio.getState();
  const randomEvents = useRandomEvents.getState();
  const gameTime = useGame.getState();
  
  const { health, wealth } = character;
  const currentTime = Date.now();
  
  // Get current event count and ensure we don't exceed max events per year
  const currentEventCount = getEventCount();
  
  // Check if we've already had too many health events this year
  if (currentEventCount > MAX_HEALTH_EVENTS_PER_YEAR) {
    // Only allow critical events if we've exceeded the yearly limit
    if (health > CRITICAL_HEALTH_THRESHOLD) {
      return;
    }
  }
  
  // Check if we're on cooldown
  if (currentTime - lastHealthEventTime < HEALTH_EVENT_COOLDOWN) {
    return;
  }
  
  // Check for critical health - even this is less likely now
  if (health <= CRITICAL_HEALTH_THRESHOLD && Math.random() < 0.75) { // 75% chance instead of 100%
    // Critical health event
    triggerHealthEvent(character);
    lastHealthEventTime = currentTime;
    
    // Play alert sound
    playSound('hit');
    
    // Show a severe warning
    toast.error(
      "Your health is critically low! A serious health event has occurred.",
      { duration: 8000 }
    );
    
    return;
  }
  
  // Check for low health (with lower probability)
  if (health <= LOW_HEALTH_THRESHOLD && Math.random() < 0.15) { // 15% chance (reduced from 30%)
    // Lower severity health event
    triggerHealthEvent(character);
    lastHealthEventTime = currentTime;
    
    // Play alert sound
    playSound('hit');
    
    // Show a warning
    toast.warning(
      "Your health is dangerously low! A health issue has developed.",
      { duration: 6000 }
    );
    
    return;
  }
  
  // Very small chance of random health event even with normal health
  // Significantly reduced probability (0.25% chance, down from 1%)
  if (Math.random() < 0.0025) {
    // Additional check - only trigger if player has good finances (wealth > 1000)
    if (wealth > 1000) {
      triggerHealthEvent(character);
      lastHealthEventTime = currentTime;
      
      // Play alert sound
      playSound('hit');
      
      // Show an info toast
      toast.info(
        "A health issue has unexpectedly developed.",
        { duration: 5000 }
      );
    }
  }
}

function triggerHealthEvent(character: ReturnType<typeof useCharacter.getState>) {
  const { health, wealth, addWealth, addHealth, addStress } = character;
  const randomEvents = useRandomEvents.getState();
  const game = useGame.getState();
  const { playSound } = useAudio.getState();
  
  // Get event based on current health
  const healthEvent = getEventBySeverity(health);
  
  // Ensure wealth is valid, defaulting to 0 if it's NaN
  const validWealth = isNaN(wealth) ? 0 : wealth;
  
  // Calculate actual cost based on wealth - with additional safeguards
  let actualCost = calculateEventCost(healthEvent, validWealth);
  
  // Additional safety checks for cost
  if (actualCost <= 0 || isNaN(actualCost)) {
    // Ensure we always have a valid minimum cost
    actualCost = Math.max(25, healthEvent.baseCost * 0.1);
  }
  
  // For players already in debt, dramatically reduce costs
  if (validWealth < 0) {
    actualCost = Math.min(actualCost * 0.1, 50);
  }
  
  // Prevent excessive debt - ensure players always have at least a minimum amount after health events
  const minimumWealthFloor = -1000; // Players can't go below -$1000
  if (validWealth - actualCost < minimumWealthFloor) {
    actualCost = Math.max(0, validWealth - minimumWealthFloor);
  }
  
  // Apply the cost
  addWealth(-actualCost);
  
  // Apply health impact
  if (healthEvent.healthImpact) {
    addHealth(healthEvent.healthImpact);
  }
  
  // Apply stress impact
  if (healthEvent.stressImpact) {
    addStress(healthEvent.stressImpact);
  }
  
  // Create an event description
  const eventDescription = createEventDescription(healthEvent, actualCost);
  
  // Check for character death (only possible with critical events)
  if (!characterDied && checkForCharacterDeath(healthEvent)) {
    // Set the flag to prevent multiple death events
    characterDied = true;
    
    // Create a special death message
    const deathMessage = `${healthEvent.title} has resulted in a fatal outcome. Your character has died.`;
    
    // Show a special death notification immediately
    toast.error(deathMessage, { 
      duration: Infinity, // Keep visible until user interaction
      position: 'top-center', // Valid position value
      style: { 
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        border: '2px solid #ff0000',
        padding: '20px',
        fontSize: '1.2rem'
      }
    });
    
    // Play a death sound if available
    playSound('hit');
    
    // Add death event to store
    randomEvents.addActiveEvent({
      id: `death-event-${Date.now()}`,
      title: 'FATAL: ' + healthEvent.title,
      description: deathMessage,
      category: 'health',
      type: 'death',
      expiry: Date.now() + (100 * 365 * 24 * 60 * 60 * 1000), // Essentially never expires
      effects: {
        healthChange: -100, // Complete health loss
        wealth: -actualCost
      },
      severity: 'critical' as EventSeverity,
      isActive: true
    });
    
    // Show prompt for character reset after a delay
    setTimeout(() => {
      if (confirm('Your character has died. Would you like to start over with a new character?')) {
        // Reset character
        character.resetCharacter();
        characterDied = false;
        
        // Navigate to character creation
        window.location.href = '/create';
      }
    }, 3000);
    
    return;
  }
  
  // For non-death events, continue with regular event processing
  randomEvents.addActiveEvent({
    id: `health-event-${Date.now()}`,
    title: healthEvent.title,
    description: eventDescription,
    category: 'health',
    type: 'health',
    expiry: Date.now() + (healthEvent.recoveryTime || 3) * 24 * 60 * 60 * 1000, // Convert days to ms
    effects: {
      healthChange: healthEvent.healthImpact || 0,
      stressChange: healthEvent.stressImpact || 0,
      wealth: -actualCost
    },
    severity: healthEvent.severity as EventSeverity,
    isActive: true
  });
  
  // Show event details in UI
  showHealthEventNotification(healthEvent, actualCost);
  
  // Add health event stats to UI (for testing)
  const eventCountMessage = `Health event #${getEventCount()} | Severity: ${healthEvent.severity}`;
  toast.info(eventCountMessage, { duration: 3000 });
}

function createEventDescription(event: HealthEvent, cost: number): string {
  let description = event.description + " ";
  
  // Add cost information
  description += `Medical costs: $${cost.toLocaleString()}. `;
  
  // Add recovery information
  if (event.recoveryTime) {
    description += `Recovery time: ${event.recoveryTime} days. `;
  }
  
  // Add chronic information
  if (event.chronicEffect) {
    description += "This condition will have ongoing effects. ";
  }
  
  // Add prevention information
  if (event.preventable) {
    description += "This could have been prevented with better health maintenance. ";
  }
  
  // Add hospitalization information
  if (event.requiresHospitalization) {
    description += "This condition requires hospitalization. ";
  }
  
  return description;
}

// Helper function to create a formatted toast message without JSX
function showHealthEventNotification(event: HealthEvent, cost: number) {
  const severityColors = {
    minor: 'blue',
    moderate: 'yellow',
    severe: 'orange',
    critical: 'red'
  };
  
  const color = severityColors[event.severity];
  
  // Instead of using JSX directly, create formatted text messages
  if (event.severity === 'critical' || event.severity === 'severe') {
    // Format a critical/severe notification
    const message = 
      `${event.title}\n\n` +
      `${event.description}\n\n` +
      `Medical costs: $${cost.toLocaleString()}` +
      (event.requiresHospitalization ? '\n\nRequires hospitalization' : '');
    
    toast.error(message, { duration: 8000 });
  } else {
    // Format a minor/moderate notification
    const message = 
      `${event.title}\n\n` +
      `${event.description}\n\n` +
      `Medical costs: $${cost.toLocaleString()}`;
    
    toast.warning(message, { duration: 6000 });
  }
}