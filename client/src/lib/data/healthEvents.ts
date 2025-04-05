export interface HealthEvent {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  baseCost: number; // Base cost in dollars
  healthImpact: number; // Negative for additional health loss, positive for recovery
  recoveryTime?: number; // In days
  stressImpact?: number; // How much stress this adds
  wealthMultiplier?: number; // Scales cost based on player wealth
  requiresHospitalization?: boolean;
  chronicEffect?: boolean; // Does this have ongoing effects
  preventable?: boolean; // Could this have been prevented with better health
  specialEffects?: string[]; // Any special gameplay effects
}

// 50 Health events of varying severity and cost
export const healthEvents: HealthEvent[] = [
  // MINOR EVENTS (Low cost, minimal impact)
  {
    id: "health-1",
    title: "Common Cold",
    description: "You've caught a common cold. You'll need some over-the-counter medication and rest.",
    severity: "minor",
    baseCost: 25,
    healthImpact: -5,
    recoveryTime: 3,
    preventable: true
  },
  {
    id: "health-2",
    title: "Mild Food Poisoning",
    description: "Something you ate didn't agree with you. You'll need some medication to settle your stomach.",
    severity: "minor",
    baseCost: 40,
    healthImpact: -8,
    recoveryTime: 2,
    preventable: true
  },
  {
    id: "health-3",
    title: "Seasonal Allergies",
    description: "Pollen season hit you hard. You need antihistamines to manage the symptoms.",
    severity: "minor",
    baseCost: 35,
    healthImpact: -3,
    recoveryTime: 7,
    stressImpact: 5
  },
  {
    id: "health-4",
    title: "Minor Headache Condition",
    description: "You've been experiencing recurring headaches. The doctor recommends medication and reducing screen time.",
    severity: "minor",
    baseCost: 75,
    healthImpact: -5,
    stressImpact: 10,
    preventable: true
  },
  {
    id: "health-5",
    title: "Mild Dehydration",
    description: "Your neglect of proper hydration has resulted in dehydration. You need electrolyte drinks and rest.",
    severity: "minor",
    baseCost: 30,
    healthImpact: -7,
    recoveryTime: 1,
    preventable: true
  },
  {
    id: "health-6",
    title: "Minor Sprain",
    description: "You've sprained your ankle. You'll need to rest it and may need a brace.",
    severity: "minor",
    baseCost: 120,
    healthImpact: -5,
    recoveryTime: 7
  },
  {
    id: "health-7",
    title: "Ear Infection",
    description: "You've developed an ear infection. Antibiotics should clear it up.",
    severity: "minor",
    baseCost: 85,
    healthImpact: -7,
    recoveryTime: 5
  },
  {
    id: "health-8",
    title: "Minor Skin Condition",
    description: "A rash has developed on your skin. You need medicated cream to treat it.",
    severity: "minor",
    baseCost: 50,
    healthImpact: -2,
    recoveryTime: 5
  },
  {
    id: "health-9",
    title: "Eye Strain",
    description: "Too much screen time has caused eye strain. You need eye drops and should reduce screen time.",
    severity: "minor",
    baseCost: 45,
    healthImpact: -3,
    preventable: true,
    stressImpact: 5
  },
  {
    id: "health-10",
    title: "Minor Vitamin Deficiency",
    description: "Blood tests show you have a vitamin deficiency. You need supplements.",
    severity: "minor",
    baseCost: 65,
    healthImpact: -5,
    preventable: true
  },
  {
    id: "health-11",
    title: "Insomnia Episode",
    description: "You're having trouble sleeping. You need sleep aids and better sleep hygiene.",
    severity: "minor",
    baseCost: 70,
    healthImpact: -8,
    stressImpact: 15,
    preventable: true
  },
  {
    id: "health-12",
    title: "Minor Back Pain",
    description: "You're experiencing back pain from poor posture. You need pain relievers and should improve your ergonomics.",
    severity: "minor",
    baseCost: 60,
    healthImpact: -5,
    preventable: true
  },
  
  // MODERATE EVENTS (Medium cost, noticeable impact)
  {
    id: "health-13",
    title: "Influenza",
    description: "You've caught the flu. You'll need prescription medication, rest, and may miss work.",
    severity: "moderate",
    baseCost: 250,
    healthImpact: -15,
    recoveryTime: 7,
    stressImpact: 10
  },
  {
    id: "health-14",
    title: "Moderate Infection",
    description: "You've developed an infection that requires antibiotics and medical attention.",
    severity: "moderate",
    baseCost: 320,
    healthImpact: -12,
    recoveryTime: 10
  },
  {
    id: "health-15",
    title: "Minor Fracture",
    description: "You've fractured a small bone. You'll need a cast and follow-up appointments.",
    severity: "moderate",
    baseCost: 850,
    healthImpact: -15,
    recoveryTime: 30,
    stressImpact: 15
  },
  {
    id: "health-16",
    title: "Moderate Digestive Disorder",
    description: "You've developed a digestive disorder requiring medication and dietary changes.",
    severity: "moderate",
    baseCost: 375,
    healthImpact: -10,
    chronicEffect: true,
    preventable: true
  },
  {
    id: "health-17",
    title: "Sleep Apnea",
    description: "You've been diagnosed with sleep apnea. You need a CPAP machine and follow-up care.",
    severity: "moderate",
    baseCost: 1200,
    healthImpact: -8,
    chronicEffect: true,
    preventable: true,
    specialEffects: ["Reduced energy recovery"]
  },
  {
    id: "health-18",
    title: "Repetitive Strain Injury",
    description: "You've developed RSI from repetitive movements. You need therapy and ergonomic equipment.",
    severity: "moderate",
    baseCost: 550,
    healthImpact: -10,
    recoveryTime: 30,
    preventable: true,
    chronicEffect: true
  },
  {
    id: "health-19",
    title: "Moderate Breathing Issues",
    description: "You're experiencing breathing difficulties. You need an inhaler and medical consultation.",
    severity: "moderate",
    baseCost: 420,
    healthImpact: -12,
    chronicEffect: true,
    specialEffects: ["Reduced physical activity options"]
  },
  {
    id: "health-20",
    title: "Kidney Stones",
    description: "You've developed kidney stones. You need medical intervention to pass them safely.",
    severity: "moderate",
    baseCost: 1100,
    healthImpact: -20,
    recoveryTime: 14,
    stressImpact: 25
  },
  {
    id: "health-21",
    title: "Migraine Condition",
    description: "You've been diagnosed with migraines. You need prescription medication and lifestyle changes.",
    severity: "moderate",
    baseCost: 450,
    healthImpact: -12,
    chronicEffect: true,
    stressImpact: 20,
    specialEffects: ["Occasional work disruption"]
  },
  {
    id: "health-22",
    title: "Mild Depression",
    description: "You've been diagnosed with mild depression. You need therapy and possibly medication.",
    severity: "moderate",
    baseCost: 600,
    healthImpact: -10,
    stressImpact: 25,
    chronicEffect: true,
    specialEffects: ["Reduced happiness recovery"]
  },
  {
    id: "health-23",
    title: "Moderate Anxiety Disorder",
    description: "You're experiencing anxiety that's affecting your daily life. You need therapy and treatment.",
    severity: "moderate",
    baseCost: 580,
    healthImpact: -8,
    stressImpact: 30,
    chronicEffect: true,
    specialEffects: ["Increased stress from events"]
  },
  {
    id: "health-24",
    title: "Gout",
    description: "You've developed gout. You need medication and dietary changes.",
    severity: "moderate",
    baseCost: 380,
    healthImpact: -12,
    chronicEffect: true,
    preventable: true
  },
  {
    id: "health-25",
    title: "Moderate Allergic Reaction",
    description: "You've had a significant allergic reaction. You need emergency medication and follow-up care.",
    severity: "moderate",
    baseCost: 500,
    healthImpact: -15,
    recoveryTime: 5
  },
  
  // SEVERE EVENTS (High cost, significant impact)
  {
    id: "health-26",
    title: "Pneumonia",
    description: "You've developed pneumonia. You need hospitalization and intensive treatment.",
    severity: "severe",
    baseCost: 4500,
    healthImpact: -25,
    recoveryTime: 21,
    requiresHospitalization: true,
    stressImpact: 20
  },
  {
    id: "health-27",
    title: "Major Fracture",
    description: "You've severely fractured a major bone. You need surgery and extensive rehabilitation.",
    severity: "severe",
    baseCost: 8500,
    healthImpact: -30,
    recoveryTime: 60,
    requiresHospitalization: true,
    stressImpact: 25
  },
  {
    id: "health-28",
    title: "Severe Infection",
    description: "You've developed a severe infection requiring IV antibiotics and hospitalization.",
    severity: "severe",
    baseCost: 7000,
    healthImpact: -35,
    recoveryTime: 14,
    requiresHospitalization: true
  },
  {
    id: "health-29",
    title: "Appendicitis",
    description: "Your appendix has become inflamed and requires emergency surgery.",
    severity: "severe",
    baseCost: 12000,
    healthImpact: -30,
    recoveryTime: 21,
    requiresHospitalization: true
  },
  {
    id: "health-30",
    title: "Severe Digestive Disorder",
    description: "You've developed a serious digestive condition requiring surgery and ongoing treatment.",
    severity: "severe",
    baseCost: 9500,
    healthImpact: -25,
    chronicEffect: true,
    requiresHospitalization: true
  },
  {
    id: "health-31",
    title: "Severe Skin Condition",
    description: "You've developed a serious skin condition requiring specialized treatment.",
    severity: "severe",
    baseCost: 5500,
    healthImpact: -20,
    chronicEffect: true,
    specialEffects: ["Reduced social interaction options"]
  },
  {
    id: "health-32",
    title: "Severe Depression",
    description: "You're experiencing severe depression. You need intensive therapy and medication.",
    severity: "severe",
    baseCost: 4800,
    healthImpact: -20,
    stressImpact: 40,
    chronicEffect: true,
    specialEffects: ["Severely reduced happiness recovery", "Limited social options"]
  },
  {
    id: "health-33",
    title: "Severe Back Injury",
    description: "You've severely injured your back. You need surgery and extensive physical therapy.",
    severity: "severe",
    baseCost: 14000,
    healthImpact: -35,
    recoveryTime: 90,
    requiresHospitalization: true,
    chronicEffect: true
  },
  {
    id: "health-34",
    title: "Severe Allergic Reaction",
    description: "You've had a severe allergic reaction requiring emergency care and hospitalization.",
    severity: "severe",
    baseCost: 7500,
    healthImpact: -30,
    recoveryTime: 7,
    requiresHospitalization: true
  },
  {
    id: "health-35",
    title: "Early Diabetes",
    description: "You've been diagnosed with diabetes. You need medication, monitoring equipment, and lifestyle changes.",
    severity: "severe",
    baseCost: 3500,
    healthImpact: -15,
    chronicEffect: true,
    preventable: true,
    specialEffects: ["Ongoing medication costs", "Dietary restrictions"]
  },
  {
    id: "health-36",
    title: "Severe Anxiety Disorder",
    description: "You're experiencing debilitating anxiety. You need intensive therapy and medication.",
    severity: "severe",
    baseCost: 4200,
    healthImpact: -15,
    stressImpact: 45,
    chronicEffect: true,
    specialEffects: ["Limited work and social options"]
  },
  {
    id: "health-37",
    title: "Chronic Pain Condition",
    description: "You've developed a chronic pain condition. You need ongoing pain management and therapy.",
    severity: "severe",
    baseCost: 6500,
    healthImpact: -25,
    chronicEffect: true,
    specialEffects: ["Ongoing medication costs", "Reduced quality of life"]
  },
  {
    id: "health-38",
    title: "Ulcers",
    description: "You've developed stomach ulcers. You need medication and significant dietary changes.",
    severity: "severe",
    baseCost: 4100,
    healthImpact: -20,
    chronicEffect: true,
    preventable: true
  },
  
  // CRITICAL EVENTS (Very high cost, potentially life-changing)
  {
    id: "health-39",
    title: "Heart Attack",
    description: "You've suffered a heart attack. You need emergency care, surgery, and ongoing treatment.",
    severity: "critical",
    baseCost: 75000,
    healthImpact: -50,
    recoveryTime: 180,
    requiresHospitalization: true,
    chronicEffect: true,
    preventable: true,
    specialEffects: ["Permanent cardiac monitoring", "Strict lifestyle restrictions"]
  },
  {
    id: "health-40",
    title: "Stroke",
    description: "You've suffered a stroke. You need emergency care, rehabilitation, and long-term support.",
    severity: "critical",
    baseCost: 85000,
    healthImpact: -60,
    recoveryTime: 365,
    requiresHospitalization: true,
    chronicEffect: true,
    preventable: true,
    specialEffects: ["Permanent physical limitations", "Cognitive therapy required"]
  },
  {
    id: "health-41",
    title: "Major Organ Failure",
    description: "One of your major organs is failing. You need emergency medical intervention and possibly a transplant.",
    severity: "critical",
    baseCost: 150000,
    healthImpact: -70,
    recoveryTime: 180,
    requiresHospitalization: true,
    chronicEffect: true,
    wealthMultiplier: 0.5, // Very expensive regardless of wealth
    specialEffects: ["Permanent medical monitoring", "Lifetime medication"]
  },
  {
    id: "health-42",
    title: "Cancer Diagnosis",
    description: "You've been diagnosed with cancer. You need surgery, chemotherapy, and long-term treatment.",
    severity: "critical",
    baseCost: 120000,
    healthImpact: -55,
    recoveryTime: 365,
    requiresHospitalization: true,
    chronicEffect: true,
    wealthMultiplier: 0.4,
    specialEffects: ["Ongoing treatment costs", "Physical limitations"]
  },
  {
    id: "health-43",
    title: "Major Vehicle Accident",
    description: "You've been in a serious accident causing multiple injuries. You need emergency surgery and rehabilitation.",
    severity: "critical",
    baseCost: 95000,
    healthImpact: -65,
    recoveryTime: 240,
    requiresHospitalization: true,
    chronicEffect: true
  },
  {
    id: "health-44",
    title: "Severe Mental Health Crisis",
    description: "You're experiencing a severe mental health crisis requiring immediate intervention.",
    severity: "critical",
    baseCost: 40000,
    healthImpact: -40,
    stressImpact: 70,
    recoveryTime: 180,
    requiresHospitalization: true,
    chronicEffect: true,
    specialEffects: ["Limited work and social functioning", "Ongoing therapy required"]
  },
  {
    id: "health-45",
    title: "Respiratory Failure",
    description: "Your lungs are failing. You need emergency intervention and possibly assisted breathing.",
    severity: "critical",
    baseCost: 70000,
    healthImpact: -60,
    recoveryTime: 120,
    requiresHospitalization: true,
    chronicEffect: true,
    specialEffects: ["Permanent respiratory support", "Limited physical activity"]
  },
  {
    id: "health-46",
    title: "Neurological Disorder",
    description: "You've developed a serious neurological disorder affecting your movement and coordination.",
    severity: "critical",
    baseCost: 65000,
    healthImpact: -45,
    chronicEffect: true,
    specialEffects: ["Mobility assistance required", "Ongoing therapy"]
  },
  {
    id: "health-47",
    title: "Acute Liver Damage",
    description: "Your liver has sustained significant damage. You need intensive medical care and lifestyle changes.",
    severity: "critical",
    baseCost: 55000,
    healthImpact: -50,
    recoveryTime: 90,
    requiresHospitalization: true,
    chronicEffect: true,
    preventable: true
  },
  {
    id: "health-48",
    title: "Severe Infection with Complications",
    description: "You have a life-threatening infection with multiple complications. You need ICU care.",
    severity: "critical",
    baseCost: 80000,
    healthImpact: -65,
    recoveryTime: 60,
    requiresHospitalization: true
  },
  {
    id: "health-49",
    title: "Autoimmune Disease",
    description: "You've been diagnosed with a serious autoimmune disease requiring lifelong treatment.",
    severity: "critical",
    baseCost: 45000,
    healthImpact: -40,
    chronicEffect: true,
    specialEffects: ["Immune system permanently compromised", "Ongoing medication required"]
  },
  {
    id: "health-50",
    title: "Emergency Surgery",
    description: "You need emergency surgery for a life-threatening condition.",
    severity: "critical",
    baseCost: 60000,
    healthImpact: -55,
    recoveryTime: 45,
    requiresHospitalization: true
  }
];

// Helper functions for health events
export function getRandomHealthEvent(severity?: 'minor' | 'moderate' | 'severe' | 'critical'): HealthEvent {
  let filteredEvents = healthEvents;
  
  if (severity) {
    filteredEvents = healthEvents.filter(event => event.severity === severity);
  }
  
  const randomIndex = Math.floor(Math.random() * filteredEvents.length);
  return filteredEvents[randomIndex];
}

// Keep track of health events globally
let healthEventCounter = 0;
const BASE_CRITICAL_CHANCE = 0.8; // 80% chance of critical event when health <= 10
const EVENT_COUNT_MULTIPLIER = 0.02; // Each event increases critical chance by 2%
const DEATH_CHANCE = 0.01; // 1% chance of death after a critical event

export function getEventCount(): number {
  return healthEventCounter;
}

export function resetEventCount(): void {
  healthEventCounter = 0;
}

export function incrementEventCount(): void {
  healthEventCounter++;
}

export function getEventBySeverity(health: number): HealthEvent {
  // Determine severity based on health level and event history
  let severity: 'minor' | 'moderate' | 'severe' | 'critical';
  
  // Increment the event counter
  incrementEventCount();
  
  if (health <= 10) {
    // Calculate critical event probability based on event count
    // Base chance starts at 80%, increases by 2% for every past health event
    const criticalChance = Math.min(1.0, BASE_CRITICAL_CHANCE + (healthEventCounter * EVENT_COUNT_MULTIPLIER));
    
    // Determine if this is a critical event based on calculated probability
    if (Math.random() <= criticalChance) {
      severity = 'critical';
    } else {
      severity = 'severe';
    }
  } else if (health <= 25) {
    severity = 'severe';
  } else if (health <= 40) {
    severity = 'moderate';
  } else {
    severity = 'minor';
  }
  
  return getRandomHealthEvent(severity);
}

// Calculate if this event results in character death (only for critical events)
export function checkForCharacterDeath(event: HealthEvent): boolean {
  if (event.severity === 'critical' && Math.random() <= DEATH_CHANCE) {
    return true;
  }
  return false;
}

export function calculateEventCost(event: HealthEvent, wealth: number): number {
  // Base cost
  let cost = event.baseCost;
  
  // Ensure wealth is a valid number and at least 0
  const validWealth = Math.max(0, isNaN(wealth) ? 0 : wealth);
  
  // Apply wealth multiplier if exists and wealth is positive
  if (event.wealthMultiplier && validWealth > 0) {
    // Add a percentage of wealth to the base cost, but cap at reasonable level
    // Limit wealth-based increase to no more than 3x the base cost for better balance
    const wealthBasedAddition = validWealth * event.wealthMultiplier;
    cost += Math.min(wealthBasedAddition, event.baseCost * 3);
  }
  
  // For very low wealth, reduce costs to prevent excessive debt
  if (validWealth < cost * 2) {
    // Scale down costs for players with very little money
    cost = Math.max(cost * 0.25, Math.min(cost, validWealth * 0.5));
  }
  
  // Ensure cost doesn't exceed wealth
  // People can still go into debt, but not beyond 50% of their wealth (reduced from 90%)
  // Also add a floor to ensure the cost is always positive and reasonable
  return Math.max(Math.min(cost, validWealth * 0.5), event.baseCost * 0.1);
}