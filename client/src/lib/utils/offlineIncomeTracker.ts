import { formatCurrency } from '../utils';
import { toast } from 'sonner';
import { getStore } from './storeRegistry';

// Use the store registry approach instead of direct localStorage access
function getCharacterState() {
  try {
    // First try to get the character store from the registry
    const characterStore = getStore('character');
    if (characterStore) {
      console.log('✅ OfflineIncomeTracker: Got character state from store registry');
      return characterStore.getState();
    }
    
    // Fallback to localStorage if the store is not available
    console.warn('⚠️ OfflineIncomeTracker: Character store not found in registry, falling back to localStorage');
    const savedState = localStorage.getItem('business-empire-character');
    if (!savedState) {
      console.error('❌ OfflineIncomeTracker: No character state found in localStorage');
      return null;
    }
    
    return JSON.parse(savedState);
  } catch (error) {
    console.error('❌ OfflineIncomeTracker: Error getting character state:', error);
    return null;
  }
}

function getMonthlyFinances() {
  // Calculate finances directly without importing the hook
  // This is a simplified version that provides the core functionality we need
  try {
    const characterState = getCharacterState();
    if (!characterState) return { propertyIncome: 0, businessIncome: 0, investmentIncome: 0 };
    
    // Extract income from owned properties
    const propertyIncome = (characterState.properties || [])
      .reduce((total: number, property: any) => total + (property.income || 0), 0);
    
    // Extract income from owned businesses
    const businessIncome = (characterState.businesses || [])
      .reduce((total: number, business: any) => total + (business.income || 0), 0);
    
    // Extract income from investments
    const investmentIncome = (characterState.investments || [])
      .reduce((total: number, investment: any) => {
        // For stocks, calculate dividend income
        if (investment.type === 'stock' && investment.dividendYield) {
          return total + (investment.purchasePrice * investment.quantity * investment.dividendYield / 100);
        }
        // For bonds, calculate interest income
        else if (investment.type === 'bond' && investment.interestRate) {
          return total + (investment.purchasePrice * investment.interestRate / 100);
        }
        return total;
      }, 0);
    
    return { propertyIncome, businessIncome, investmentIncome };
  } catch (error) {
    console.error('Error calculating monthly finances:', error);
    return { propertyIncome: 0, businessIncome: 0, investmentIncome: 0 };
  }
}

/**
 * OfflineIncomeTracker - A utility to comprehensively track income during offline periods
 * 
 * This ensures that all passive income sources are accurately calculated when the player
 * is away from the game, maintaining simulation integrity regardless of playtime.
 */

interface OfflineIncomeSource {
  type: string;
  name: string;
  dailyAmount: number;
  monthlyAmount: number;
  accumulatedAmount: number;
}

interface OfflineIncomeReport {
  totalIncome: number;
  sources: OfflineIncomeSource[];
  daysPassed: number;
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Calculates all passive income for a given offline period
 * 
 * @param daysPassed Number of days passed while offline
 * @param startDate The game date when player went offline
 * @param endDate The game date when player returned
 * @returns Detailed report of all income earned while offline
 */
export function calculateOfflineIncome(
  daysPassed: number, 
  startDate: Date, 
  endDate: Date
): OfflineIncomeReport {
  // Get character state directly (no circular dependencies)
  const characterState = getCharacterState();
  
  if (!characterState) {
    console.error('Cannot calculate offline income - character state not available');
    return {
      totalIncome: 0,
      sources: [],
      daysPassed,
      startTimestamp: startDate.getTime(),
      endTimestamp: endDate.getTime()
    };
  }
  
  // Get finance calculations directly from our helper
  const { 
    propertyIncome, 
    businessIncome, 
    investmentIncome 
  } = getMonthlyFinances();
  
  // The sources array will track all income sources
  const sources: OfflineIncomeSource[] = [];
  let totalIncome = 0;
  
  // 1. Property income
  if (propertyIncome > 0) {
    // Calculate actual days in the month(s) for proper proration
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    // Handle multi-month calculations if needed
    let propertyAccumulated = 0;
    
    if (startYear === endYear && startMonth === endMonth) {
      // Same month - simple proration
      const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
      propertyAccumulated = (propertyIncome / daysInMonth) * daysPassed;
    } else {
      // Different months - need to calculate each month separately
      let currentDate = new Date(startDate);
      let remainingDays = daysPassed;
      
      while (remainingDays > 0) {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = currentDate.getDate();
        const daysLeftInMonth = daysInCurrentMonth - currentDay + 1;
        
        // Days to process in this iteration (either days left in month or remaining days)
        const daysToProcess = Math.min(daysLeftInMonth, remainingDays);
        
        // Add prorated income for this period
        propertyAccumulated += (propertyIncome / daysInCurrentMonth) * daysToProcess;
        
        // Move to next month
        remainingDays -= daysToProcess;
        currentDate = new Date(currentYear, currentMonth + 1, 1); // First day of next month
      }
    }
    
    sources.push({
      type: 'property',
      name: 'All Properties',
      dailyAmount: propertyIncome / 30, // Approximate daily
      monthlyAmount: propertyIncome,
      accumulatedAmount: propertyAccumulated
    });
    
    totalIncome += propertyAccumulated;
  }
  
  // 2. Business income
  if (businessIncome > 0) {
    // Business income follows the same calculation pattern as property income
    // for proper monthly proration
    let businessAccumulated = 0;
    
    // Use the same date-based calculation we used for property income
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    if (startYear === endYear && startMonth === endMonth) {
      const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
      businessAccumulated = (businessIncome / daysInMonth) * daysPassed;
    } else {
      let currentDate = new Date(startDate);
      let remainingDays = daysPassed;
      
      while (remainingDays > 0) {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = currentDate.getDate();
        const daysLeftInMonth = daysInCurrentMonth - currentDay + 1;
        const daysToProcess = Math.min(daysLeftInMonth, remainingDays);
        
        businessAccumulated += (businessIncome / daysInCurrentMonth) * daysToProcess;
        
        remainingDays -= daysToProcess;
        currentDate = new Date(currentYear, currentMonth + 1, 1);
      }
    }
    
    sources.push({
      type: 'business',
      name: 'All Businesses',
      dailyAmount: businessIncome / 30, // Approximate daily
      monthlyAmount: businessIncome,
      accumulatedAmount: businessAccumulated
    });
    
    totalIncome += businessAccumulated;
  }
  
  // 3. Investment income (stocks, bonds, etc.)
  if (investmentIncome > 0) {
    // Investment income (dividends, etc.) typically follows monthly or quarterly schedules
    // We'll prorate it to daily amounts
    const investmentAccumulated = (investmentIncome / 30) * daysPassed;
    
    sources.push({
      type: 'investment',
      name: 'Dividends & Interest',
      dailyAmount: investmentIncome / 30,
      monthlyAmount: investmentIncome,
      accumulatedAmount: investmentAccumulated
    });
    
    totalIncome += investmentAccumulated;
  }
  
  // 4. Salary/job income (bi-weekly or monthly depending on job type)
  if (characterState.job) {
    const annualSalary = characterState.job.salary;
    
    // Calculate bi-weekly pay periods during the offline time
    const daysPerPayPeriod = 14; // Bi-weekly pay
    const payPeriodsElapsed = Math.floor(daysPassed / daysPerPayPeriod);
    const biWeeklyAmount = annualSalary / 26; // 26 pay periods per year
    
    if (payPeriodsElapsed > 0) {
      const salaryAccumulated = biWeeklyAmount * payPeriodsElapsed;
      
      sources.push({
        type: 'job',
        name: characterState.job.title,
        dailyAmount: annualSalary / 365, // Daily equivalent
        monthlyAmount: annualSalary / 12, // Monthly equivalent
        accumulatedAmount: salaryAccumulated
      });
      
      totalIncome += salaryAccumulated;
    }
  }
  
  // 5. Matured investments (startups, bonds that reached maturity, etc.)
  // This requires checking each investment's maturity date
  characterState.assets.forEach((asset: any) => {
    // Only consider assets with maturity dates that fall within the offline period
    if (asset.maturityDate && !asset.outcomeProcessed) {
      const maturityDate = new Date(asset.maturityDate);
      
      // Check if maturity date falls within offline period
      if (maturityDate >= startDate && maturityDate <= endDate) {
        if (asset.type === 'bond' && asset.maturityValue) {
          // For bonds, add the full maturity value
          sources.push({
            type: 'bond_maturity',
            name: asset.name,
            dailyAmount: 0, // One-time payment
            monthlyAmount: 0, // One-time payment
            accumulatedAmount: asset.maturityValue
          });
          
          totalIncome += asset.maturityValue;
          
          // Mark as processed so it doesn't get counted again
          asset.outcomeProcessed = true;
        } else if (asset.type === 'other' && asset.otherType === 'startup' && asset.successChance) {
          // For startup investments, calculate based on success probability
          // and potential return multiple
          const wasSuccessful = Math.random() < asset.successChance;
          
          if (wasSuccessful && asset.potentialReturnMultiple && asset.purchasePrice) {
            const returnAmount = asset.purchasePrice * asset.potentialReturnMultiple;
            
            sources.push({
              type: 'startup_investment',
              name: asset.name,
              dailyAmount: 0, // One-time payment
              monthlyAmount: 0, // One-time payment
              accumulatedAmount: returnAmount
            });
            
            totalIncome += returnAmount;
          }
          
          // Mark as processed
          asset.outcomeProcessed = true;
          asset.wasSuccessful = wasSuccessful;
        }
      }
    }
  });
  
  return {
    totalIncome,
    sources,
    daysPassed,
    startTimestamp: startDate.getTime(),
    endTimestamp: endDate.getTime()
  };
}

/**
 * Applies the calculated offline income to the player's account
 * and displays a summary notification
 * 
 * @param report The offline income report to apply
 */
export function applyOfflineIncome(report: OfflineIncomeReport): void {
  if (report.totalIncome <= 0) {
    console.log('No offline income to apply - amount is zero or negative');
    return; // No income to apply
  }
  
  try {
    // First try to get the character store from the registry
    const characterStore = getStore('character');
    
    if (characterStore) {
      // Use the store to update cash value
      const currentState = characterStore.getState();
      const newCash = (currentState.cash || 0) + report.totalIncome;
      
      // Update cash through the store action
      characterStore.getState().updateCash(newCash);
      
      console.log(`✅ OfflineIncomeTracker: Applied ${report.totalIncome} income via store registry. New cash: ${newCash}`);
    } else {
      // Fallback to direct localStorage approach
      console.warn('⚠️ OfflineIncomeTracker: Character store not available, using localStorage fallback');
      
      // Direct approach - modify localStorage to add the wealth
      const characterStateStr = localStorage.getItem('business-empire-character');
      if (!characterStateStr) {
        console.error('❌ OfflineIncomeTracker: Cannot apply offline income - character state not found in localStorage');
        return;
      }
      
      const characterState = JSON.parse(characterStateStr);
      
      // Add income to the player's cash/wealth
      characterState.cash = (characterState.cash || 0) + report.totalIncome;
      
      // Save back to localStorage
      localStorage.setItem('business-empire-character', JSON.stringify(characterState));
      console.log(`Applied ${report.totalIncome} income to character cash: ${characterState.cash}`);
    }
    
    // Create a detailed message for the toast notification
    let message = `While you were away (${report.daysPassed} days), you earned ${formatCurrency(report.totalIncome)}:`;
    
    // Add details for significant income sources
    const significantSources = report.sources
      .filter(source => source.accumulatedAmount >= 1000) // Only show sources with significant amounts
      .sort((a, b) => b.accumulatedAmount - a.accumulatedAmount); // Sort by amount (largest first)
    
    if (significantSources.length > 0) {
      message += significantSources
        .slice(0, 3) // Limit to top 3 sources to avoid overwhelming
        .map(source => `\n- ${source.name}: ${formatCurrency(source.accumulatedAmount)}`)
        .join('');
        
      // If there are more sources, add a summary line
      if (report.sources.length > 3) {
        message += `\n- Other sources: ${formatCurrency(
          report.totalIncome - significantSources.slice(0, 3).reduce((sum: number, s: any) => sum + s.accumulatedAmount, 0)
        )}`;
      }
    }
    
    // Show a toast with the income summary
    toast.success(message, {
      duration: 8000, // Longer duration for important offline report
      position: 'top-center'
    });
    
    // Log detailed breakdown to console for debugging
    console.log('=== OFFLINE INCOME REPORT ===');
    console.log(`Days passed: ${report.daysPassed}`);
    console.log(`Total income: ${formatCurrency(report.totalIncome)}`);
    console.log('Income sources:');
    report.sources.forEach(source => {
      console.log(`- ${source.name} (${source.type}): ${formatCurrency(source.accumulatedAmount)}`);
    });
    console.log('============================');
  } catch (error) {
    console.error('Error applying offline income:', error);
  }
}

/**
 * Save the offline income report to localStorage for reference
 * and to prevent duplicate payments if the game is loaded multiple times
 * 
 * @param report The offline income report to save
 */
export function saveOfflineIncomeReport(report: OfflineIncomeReport): void {
  if (typeof window === 'undefined') return;
  
  // Add timestamp to the report
  const reportWithTimestamp = {
    ...report,
    savedAt: Date.now()
  };
  
  // Save to localStorage
  localStorage.setItem('business-empire-last-offline-income', JSON.stringify(reportWithTimestamp));
}

/**
 * Check if we've already processed offline income for this session
 * to prevent duplicate payments
 * 
 * @returns Whether offline income has already been processed
 */
export function hasProcessedOfflineIncome(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lastReport = localStorage.getItem('business-empire-last-offline-income');
  
  if (!lastReport) return false;
  
  try {
    const report = JSON.parse(lastReport);
    
    // If the report was saved within the last 5 minutes, consider it already processed
    // This prevents double-processing if the game is reloaded quickly
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return report.savedAt > fiveMinutesAgo;
  } catch (e) {
    return false;
  }
}

/**
 * Process offline income as part of the game startup sequence
 * 
 * @param startDate The game date when player went offline
 * @param endDate The game date when player returned
 * @param daysPassed Number of days passed while offline
 */
export function processOfflineIncome(
  startDate: Date, 
  endDate: Date, 
  daysPassed: number
): void {
  // Skip if already processed recently or if less than 1 day passed
  if (hasProcessedOfflineIncome() || daysPassed < 1) {
    return;
  }
  
  // Calculate income
  const report = calculateOfflineIncome(daysPassed, startDate, endDate);
  
  // Apply income to player's account
  applyOfflineIncome(report);
  
  // Save report to prevent duplicate processing
  saveOfflineIncomeReport(report);
}