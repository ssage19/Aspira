/**
 * Utility functions for handling ownership assets in the game
 * Provides consistent access to racing horses, F1 teams, and sports teams
 */

// Constants for localStorage keys
export const F1_TEAM_STORAGE_KEY = 'business-empire-formula1-team';
export const HORSE_RACING_STORAGE_KEY = 'business-empire-horses';
export const SPORTS_TEAM_STORAGE_KEY = 'business-empire-sports-team';

// Types for ownership assets
export interface F1Team {
  id: string;
  name: string;
  budget: number;
  funds: number;
  reputation: number;
  primaryDriver: string | null;
  secondaryDriver: string | null;
  engineers: number;
  mechanics: number;
  aerodynamicists: number;
  strategists: number;
  purchasedUpgrades: string[];
  // May have other properties as well
}

export interface Horse {
  id: string;
  name: string;
  breed: string;
  price: number;
  maintenance: number;
  earnings: number;
  // May have other properties as well
}

export interface SportsTeam {
  id: string;
  name: string;
  sport: string;
  location: string;
  value: number;
  playerSalaries: number;
  revenue: number;
  // May have other properties as well
}

/**
 * Loads F1 team data from localStorage if it exists
 */
export function getF1Team(): F1Team | null {
  try {
    const savedData = localStorage.getItem(F1_TEAM_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading Formula 1 team from localStorage:', error);
  }
  return null;
}

/**
 * Loads horse racing data from localStorage if it exists
 */
export function getHorses(): Horse[] {
  try {
    const savedData = localStorage.getItem(HORSE_RACING_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading horses from localStorage:', error);
  }
  return [];
}

/**
 * Loads sports team data from localStorage if it exists
 */
export function getSportsTeam(): SportsTeam | null {
  try {
    const savedData = localStorage.getItem(SPORTS_TEAM_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading sports team from localStorage:', error);
  }
  return null;
}

/**
 * Calculates the current value of an F1 team based on its properties
 */
export function calculateF1TeamValue(team: F1Team): number {
  if (!team) return 0;
  
  // Base value starts with budget and funds
  let value = team.budget + team.funds;
  
  // Add value for staff (each staff member adds value)
  const staffValue = (team.engineers + team.mechanics + team.aerodynamicists + team.strategists) * 50000;
  value += staffValue;
  
  // Add value for drivers
  value += team.primaryDriver ? 500000 : 0;
  value += team.secondaryDriver ? 250000 : 0;
  
  // Add value for reputation (0-100 scale)
  value += team.reputation * 10000;
  
  // Add value for purchased upgrades
  value += (team.purchasedUpgrades?.length || 0) * 100000;
  
  return value;
}

/**
 * Calculates the total value of all horses
 */
export function calculateHorsesValue(horses: Horse[]): number {
  if (!horses || horses.length === 0) return 0;
  
  return horses.reduce((total, horse) => {
    // Base value is the purchase price
    let horseValue = horse.price;
    
    // Add value for earnings (horses become more valuable as they win)
    horseValue += horse.earnings * 0.5; // 50% of earnings adds to value
    
    return total + horseValue;
  }, 0);
}

/**
 * Calculates the value of a sports team
 */
export function calculateSportsTeamValue(team: SportsTeam): number {
  if (!team) return 0;
  
  // Use the team's explicit value if available
  if (team.value) return team.value;
  
  // Otherwise calculate based on revenues and player salaries (simple multiple)
  const revenueValue = (team.revenue || 0) * 5; // 5x annual revenue
  const playerValue = (team.playerSalaries || 0) * 3; // 3x player salaries
  
  return revenueValue + playerValue;
}

/**
 * Gets the total number of ownership assets
 */
export function getTotalOwnershipAssets(): number {
  const f1Team = getF1Team();
  const horses = getHorses();
  const sportsTeam = getSportsTeam();
  
  let count = 0;
  if (f1Team) count += 1;
  if (horses) count += horses.length;
  if (sportsTeam) count += 1;
  
  return count;
}

/**
 * Gets the total value of all ownership assets
 */
export function getTotalOwnershipValue(): number {
  const f1Team = getF1Team();
  const horses = getHorses();
  const sportsTeam = getSportsTeam();
  
  let totalValue = 0;
  
  if (f1Team) {
    totalValue += calculateF1TeamValue(f1Team);
  }
  
  if (horses && horses.length > 0) {
    totalValue += calculateHorsesValue(horses);
  }
  
  if (sportsTeam) {
    totalValue += calculateSportsTeamValue(sportsTeam);
  }
  
  return totalValue;
}

/**
 * Gets a breakdown of ownership values by category
 */
export function getOwnershipBreakdown() {
  const f1Team = getF1Team();
  const horses = getHorses();
  const sportsTeam = getSportsTeam();
  
  const f1Value = f1Team ? calculateF1TeamValue(f1Team) : 0;
  const horsesValue = horses && horses.length > 0 ? calculateHorsesValue(horses) : 0;
  const sportsValue = sportsTeam ? calculateSportsTeamValue(sportsTeam) : 0;
  
  return {
    f1Team: {
      owned: !!f1Team,
      name: f1Team?.name || 'No F1 team',
      value: f1Value
    },
    horses: {
      count: horses?.length || 0,
      value: horsesValue
    },
    sportsTeam: {
      owned: !!sportsTeam,
      name: sportsTeam?.name || 'No sports team',
      value: sportsValue
    },
    total: f1Value + horsesValue + sportsValue
  };
}