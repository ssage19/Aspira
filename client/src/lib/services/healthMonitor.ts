import { useCharacter } from '../stores/useCharacter';
import { useRandomEvents, EventSeverity } from '../stores/useRandomEvents';
import { useAudio } from '../stores/useAudio';
import { getEventBySeverity, calculateEventCost, HealthEvent, checkForCharacterDeath, getEventCount } from '../data/healthEvents';
import { useGame } from '../stores/useGame';
import { toast } from 'sonner';
import React from 'react';

// Constants
const CRITICAL_HEALTH_THRESHOLD = 10; // 10% health is considered critical
const LOW_HEALTH_THRESHOLD = 25; // 25% health is considered low
const HEALTH_CHECK_INTERVAL = 60000; // Check health every minute

// Store last health event time
let lastHealthEventTime = 0;
// Cooldown between health events (in milliseconds)
const HEALTH_EVENT_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  
  const { health, wealth } = character;
  const currentTime = Date.now();
  
  // Check if we're on cooldown
  if (currentTime - lastHealthEventTime < HEALTH_EVENT_COOLDOWN) {
    return;
  }
  
  // Check for critical health
  if (health <= CRITICAL_HEALTH_THRESHOLD) {
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
  if (health <= LOW_HEALTH_THRESHOLD && Math.random() < 0.3) { // 30% chance when health is low
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
  if (Math.random() < 0.01) { // 1% chance
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

function triggerHealthEvent(character: ReturnType<typeof useCharacter.getState>) {
  const { health, wealth, addWealth, addHealth, addStress } = character;
  const randomEvents = useRandomEvents.getState();
  const game = useGame.getState();
  const { playSound } = useAudio.getState();
  
  // Get event based on current health
  const healthEvent = getEventBySeverity(health);
  
  // Calculate actual cost based on wealth
  const actualCost = calculateEventCost(healthEvent, wealth);
  
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