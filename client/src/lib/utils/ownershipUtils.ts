/**
 * Ownership Assets Utilities
 * 
 * A centralized module for handling ownership asset valuation and management
 * including Formula 1 teams, horse racing, and sports teams.
 */

// Define types for ownership assets
interface Formula1Team {
  name: string;
  value: number;
  owned: boolean;
  performance: number;
  staff: {
    engineering: number;
    pitCrew: number;
    management: number;
  };
  drivers: any[]; // Simplified for now
}

interface Horse {
  id: string;
  name: string;
  value: number;
  performance: number;
  potential: number;
  age: number;
  wins: number;
  races: number;
}

interface SportsTeam {
  name: string;
  value: number;
  owned: boolean;
  sport: string;
  performance: number;
  fanBase: number;
  marketSize: string;
  players: any[]; // Simplified for now
}

// Storage keys for ownership assets
export const STORAGE_KEYS = {
  F1_TEAM: 'business-empire-formula1-team',
  HORSES: 'business-empire-horse-racing',
  SPORTS_TEAM: 'business-empire-sports-team'
};

// Export individual storage keys for compatibility with existing code
export const F1_TEAM_STORAGE_KEY = STORAGE_KEYS.F1_TEAM;
export const HORSE_RACING_STORAGE_KEY = STORAGE_KEYS.HORSES;
export const SPORTS_TEAM_STORAGE_KEY = STORAGE_KEYS.SPORTS_TEAM;

/**
 * Get Formula 1 team data from localStorage
 */
export function getFormula1Team(): Formula1Team | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.F1_TEAM);
    if (!storedData) return null;
    
    const data = JSON.parse(storedData);
    return data;
  } catch (error) {
    console.error("Error retrieving Formula 1 team data:", error);
    return null;
  }
}

/**
 * Get horse racing data from localStorage
 */
export function getHorseRacingData(): Horse[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.HORSES);
    if (!storedData) return [];
    
    const data = JSON.parse(storedData);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error retrieving horse racing data:", error);
    return [];
  }
}

/**
 * Get sports team data from localStorage
 */
export function getSportsTeam(): SportsTeam | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.SPORTS_TEAM);
    if (!storedData) return null;
    
    const data = JSON.parse(storedData);
    return data;
  } catch (error) {
    console.error("Error retrieving sports team data:", error);
    return null;
  }
}

/**
 * Calculate total value of all horses
 */
function calculateTotalHorseValue(horses: Horse[]): number {
  return horses.reduce((total, horse) => total + horse.value, 0);
}

/**
 * Get a breakdown of all ownership assets
 */
export function getOwnershipBreakdown() {
  // Get data for all ownership types
  const f1Team = getFormula1Team();
  const horses = getHorseRacingData();
  const sportsTeam = getSportsTeam();
  
  // Calculate values for each asset type
  const f1Value = f1Team?.value || 0;
  const horsesValue = calculateTotalHorseValue(horses);
  const sportsTeamValue = sportsTeam?.value || 0;
  
  // Calculate total ownership value
  const totalValue = f1Value + horsesValue + sportsTeamValue;
  
  return {
    f1Team: {
      name: f1Team?.name || '',
      value: f1Value,
      owned: !!f1Team
    },
    horses: {
      count: horses.length,
      value: horsesValue
    },
    sportsTeam: {
      name: sportsTeam?.name || '',
      value: sportsTeamValue,
      owned: !!sportsTeam
    },
    total: totalValue
  };
}

/**
 * Get total value of all ownership assets
 */
export function getTotalOwnershipValue(): number {
  const breakdown = getOwnershipBreakdown();
  return breakdown.total;
}

/**
 * Calculate Formula 1 team valuation
 * This can be expanded later to include more complex valuation logic
 */
export function calculateF1TeamValue(team: Formula1Team): number {
  if (!team) return 0;
  
  // Base value is stored in the team object
  return team.value;
}

/**
 * Calculate horse valuation
 */
export function calculateHorseValue(horse: Horse): number {
  if (!horse) return 0;
  
  // Base value is stored in the horse object
  return horse.value;
}

/**
 * Calculate sports team valuation
 */
export function calculateSportsTeamValue(team: SportsTeam): number {
  if (!team) return 0;
  
  // Base value is stored in the team object
  return team.value;
}