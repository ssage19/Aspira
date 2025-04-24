/**
 * Ownership Assets Utility Functions
 * 
 * This file contains utility functions for retrieving and processing all types of ownership assets:
 * - Formula 1 Teams
 * - Horse Racing 
 * - Sports Teams
 * - Businesses
 */

import { useBusiness } from "../stores/useBusiness";

// Storage keys for different ownership asset types
export const FORMULA1_STORAGE_KEY = "business-empire-formula1-team";
export const HORSE_RACING_STORAGE_KEY = "horse-racing-ownership";
export const SPORTS_TEAM_STORAGE_KEY = "sports-team-ownership";

// Interface for Formula 1 Team data
interface Formula1Team {
  name: string;
  value: number;
  purchasePrice: number;
  purchaseDate: string;
  performanceLevel: number;
  marketingLevel: number;
  teamMoraleLevel: number;
  owned: boolean;
}

// Interface for Horse Racing data
interface RacingHorse {
  id: string;
  name: string;
  age: number;
  breed: string;
  value: number;
  purchasePrice: number;
  purchaseDate: string;
  trainingLevel: number;
  energyLevel: number;
  potential: number;
  raceHistory: {
    date: string;
    position: number;
    eventName: string;
    earnings: number;
  }[];
}

// Interface for Sports Team data
interface SportsTeam {
  name: string;
  sport: string;
  value: number;
  purchasePrice: number;
  purchaseDate: string;
  playerQualityLevel: number;
  facilityLevel: number;
  marketingLevel: number;
  owned: boolean;
}

// Interface for Business data
interface Business {
  id: string;
  name: string;
  type: string;
  initialValue: number;
  currentValue: number;
  purchaseDate: string;
  level: number;
  revenue: number;
  expenses: number;
  profitMargin: number;
  employees: number;
  customerSatisfaction: number;
}

/**
 * Get Formula 1 team ownership data
 */
export function getFormula1Team(): Formula1Team | null {
  try {
    const teamData = localStorage.getItem(FORMULA1_STORAGE_KEY);
    if (!teamData) return null;
    return JSON.parse(teamData) as Formula1Team;
  } catch (error) {
    console.error("Error retrieving Formula 1 team data:", error);
    return null;
  }
}

/**
 * Get horse racing ownership data
 */
export function getHorseRacingData(): RacingHorse[] {
  try {
    const horsesData = localStorage.getItem(HORSE_RACING_STORAGE_KEY);
    if (!horsesData) return [];
    return JSON.parse(horsesData) as RacingHorse[];
  } catch (error) {
    console.error("Error retrieving horse racing data:", error);
    return [];
  }
}

/**
 * Get sports team ownership data
 */
export function getSportsTeam(): SportsTeam | null {
  try {
    const teamData = localStorage.getItem(SPORTS_TEAM_STORAGE_KEY);
    if (!teamData) return null;
    return JSON.parse(teamData) as SportsTeam;
  } catch (error) {
    console.error("Error retrieving sports team data:", error);
    return null;
  }
}

/**
 * Get business ownership data
 */
export function getBusinesses(): Business[] {
  try {
    // Get businesses from the business store
    const businessStore = useBusiness.getState();
    if (!businessStore.businesses) return [];
    
    // Convert to the common Business interface
    return businessStore.businesses.map(business => ({
      id: business.id,
      name: business.name,
      type: business.type,
      initialValue: business.initialInvestment,
      currentValue: business.currentValue,
      purchaseDate: business.acquisitionDate,
      level: business.level,
      revenue: business.revenue,
      expenses: business.expenses,
      profitMargin: business.profitMargin,
      employees: business.employees,
      customerSatisfaction: business.customerSatisfaction
    }));
  } catch (error) {
    console.error("Error retrieving business data:", error);
    return [];
  }
}

/**
 * Get the total value of all ownership assets
 */
export function getTotalOwnershipValue(): number {
  let total = 0;
  
  // Add Formula 1 team value
  const f1Team = getFormula1Team();
  if (f1Team && f1Team.owned) {
    total += f1Team.value;
  }
  
  // Add horse racing values
  const horses = getHorseRacingData();
  if (horses && horses.length > 0) {
    total += horses.reduce((sum, horse) => sum + horse.value, 0);
  }
  
  // Add sports team value
  const sportsTeam = getSportsTeam();
  if (sportsTeam && sportsTeam.owned) {
    total += sportsTeam.value;
  }
  
  // Add business values
  const businesses = getBusinesses();
  if (businesses && businesses.length > 0) {
    total += businesses.reduce((sum, business) => sum + business.currentValue, 0);
  }
  
  return total;
}

/**
 * Get a detailed breakdown of all ownership assets
 */
export function getOwnershipBreakdown() {
  // Initialize categories
  const f1Value = getFormula1TeamValue();
  const horsesValue = getHorseRacingValue();
  const sportsTeamValue = getSportsTeamValue();
  const businessValue = getBusinessValue();
  
  // Total value
  const total = f1Value + horsesValue + sportsTeamValue + businessValue;
  
  return {
    formula1: f1Value,
    horseRacing: horsesValue,
    sportsTeam: sportsTeamValue,
    businesses: businessValue,
    total
  };
}

// Helper functions for getting individual category values

function getFormula1TeamValue(): number {
  const team = getFormula1Team();
  return team && team.owned ? team.value : 0;
}

function getHorseRacingValue(): number {
  const horses = getHorseRacingData();
  return horses.reduce((total, horse) => total + horse.value, 0);
}

function getSportsTeamValue(): number {
  const team = getSportsTeam();
  return team && team.owned ? team.value : 0;
}

function getBusinessValue(): number {
  const businesses = getBusinesses();
  return businesses.reduce((total, business) => total + business.currentValue, 0);
}