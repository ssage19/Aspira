import { useCharacter } from '../stores/useCharacter';

// Import the expense rates directly from the character store constants
// Use the same values to ensure consistency
const EXPENSE_RATES = {
  HOUSING: {
    RENTAL: 1800,    // $1,800/mo for rental
    SHARED: 900,     // $900/mo for shared housing
    OWNED: 0,        // No expense for owned (handled via property mortgage)
    HOMELESS: 0,     // No housing expense
    LUXURY: 3000     // $3,000/mo for luxury housing
  },
  TRANSPORTATION: {
    ECONOMY: 300,    // $300/mo for economy vehicle
    STANDARD: 450,   // $450/mo for standard vehicle
    LUXURY: 1000,    // $1,000/mo for luxury vehicle
    PREMIUM: 1500,   // $1,500/mo for premium vehicle 
    BICYCLE: 50,     // $50/mo for bicycle maintenance and public transport
    NONE: 0          // No transportation expense
  },
  FOOD: 600,         // $600/mo standard food expense
  HEALTHCARE: 200,   // $200/mo healthcare expense
  TAX_BRACKETS: [    // Progressive tax brackets
    { threshold: 3000, rate: 0.15 },
    { threshold: 6000, rate: 0.22 },
    { threshold: 10000, rate: 0.26 },
    { maxRate: 0.30 }
  ]
};

/**
 * Custom hook to calculate monthly finances consistently across the application
 * This ensures the same finance calculations are used in both the UI display
 * and the actual deduction of expenses
 */
export function useMonthlyFinances() {
  const characterState = useCharacter();
  
  // Calculate income values with more detailed breakdown
  const job = characterState.job;
  // Using job.salary / 12 to maintain consistency with JobScreen display
  const monthlySalary = job ? job.salary / 12 : 0;
  
  // Calculate property income directly without multipliers to match Properties screen
  const propertyIncome = characterState.properties.reduce((total, property) => {
    // Use the direct income value without multipliers for consistency
    return total + (property.income || 0);
  }, 0);
  
  // Calculate business income if any
  const businessIncome = characterState.businesses?.reduce((total, business) => 
    total + (business.monthlyRevenue || 0), 0) || 0;
  
  // Calculate investment income (simplified)
  const investmentIncome = characterState.stocks?.reduce((total, stock) => 
    total + (stock.dividend || 0), 0) || 0;
  
  const totalIncome = monthlySalary + propertyIncome + businessIncome + investmentIncome;
  
  // Calculate expense values using the constants from useCharacter store
  // Use the character's getHousingExpense method for consistency
  console.log("DEBUG: useMonthlyFinances - housingType:", characterState.housingType);
  console.log("DEBUG: useMonthlyFinances - hasHousingFunction:", !!characterState.getHousingExpense);
  
  const housingExpense = characterState.getHousingExpense ? 
                        characterState.getHousingExpense() : 
                        // Fallback calculation using the same constants as useCharacter
                        characterState.housingType === 'rental' ? EXPENSE_RATES.HOUSING.RENTAL : 
                        characterState.housingType === 'shared' ? EXPENSE_RATES.HOUSING.SHARED :
                        characterState.housingType === 'owned' ? EXPENSE_RATES.HOUSING.OWNED : 
                        EXPENSE_RATES.HOUSING.HOMELESS;
  
  console.log("DEBUG: useMonthlyFinances - calculated housingExpense:", housingExpense);
  
  // Transportation expenses using the same values as character creation
  console.log("DEBUG: useMonthlyFinances - vehicleType:", characterState.vehicleType);
  console.log("DEBUG: useMonthlyFinances - hasTransportationFunction:", !!characterState.getTransportationExpense);
  
  const transportationExpense = characterState.getTransportationExpense ?
                              characterState.getTransportationExpense() :
                              // Fallback calculation using the same constants as useCharacter
                              characterState.vehicleType === 'economy' ? EXPENSE_RATES.TRANSPORTATION.ECONOMY :
                              characterState.vehicleType === 'standard' ? EXPENSE_RATES.TRANSPORTATION.STANDARD :
                              characterState.vehicleType === 'luxury' ? EXPENSE_RATES.TRANSPORTATION.LUXURY :
                              characterState.vehicleType === 'premium' ? EXPENSE_RATES.TRANSPORTATION.PREMIUM :
                              characterState.vehicleType === 'bicycle' ? EXPENSE_RATES.TRANSPORTATION.BICYCLE : 
                              EXPENSE_RATES.TRANSPORTATION.NONE;
                              
  console.log("DEBUG: useMonthlyFinances - calculated transportationExpense:", transportationExpense);
  
  // Food expenses based on lifestyle level and constant
  const lifestyleLevel = characterState.lifestyleLevel || 1;
  const foodExpense = characterState.getFoodExpense ? 
                      characterState.getFoodExpense() :
                      EXPENSE_RATES.FOOD; // Use constant value for consistency
  
  // Calculate healthcare expenses
  const healthcareExpense = 200; // Base healthcare cost
  
  // Calculate taxes using progressive brackets
  const calculateTax = (income: number): number => {
    let tax = 0;
    let remainingIncome = income;
    
    for (let i = 0; i < EXPENSE_RATES.TAX_BRACKETS.length; i++) {
      const bracket = EXPENSE_RATES.TAX_BRACKETS[i];
      const prevThreshold = i > 0 ? EXPENSE_RATES.TAX_BRACKETS[i-1].threshold : 0;
      
      if (bracket.maxRate) {
        // Handle income above the last threshold
        tax += remainingIncome * bracket.maxRate;
      } else if (remainingIncome > 0) {
        // Calculate tax for this bracket
        const taxableInThisBracket = Math.min(bracket.threshold - prevThreshold, remainingIncome);
        tax += taxableInThisBracket * bracket.rate;
        remainingIncome -= taxableInThisBracket;
      }
    }
    return tax;
  };

  const taxExpense = calculateTax(totalIncome);
  
  // Calculate lifestyle expenses from actual items with improved detail
  const lifestyleExpenses = characterState.lifestyleItems.reduce((total, item) => {
    // Consider item quality and age in maintenance costs
    const ageMultiplier = item.age ? (1 + item.age * 0.05) : 1; // Older items cost more to maintain
    const qualityMultiplier = item.quality === 'luxury' ? 1.5 : 
                            item.quality === 'high' ? 1.2 : 
                            item.quality === 'standard' ? 1.0 : 0.8;
    
    const monthlyCost = item.monthlyCost || 
                       (item.maintenanceCost ? item.maintenanceCost * 30 * ageMultiplier * qualityMultiplier : 0);
    
    return total + monthlyCost;
  }, 0);
  
  // Business expenses if applicable
  const businessExpenses = characterState.businesses?.reduce((total, business) => 
    total + (business.monthlyExpenses || 0), 0) || 0;
  
  const totalExpenses = housingExpense + transportationExpense + foodExpense + 
                      healthcareExpense + taxExpense + lifestyleExpenses + businessExpenses;
  
  const monthlyNet = totalIncome - totalExpenses;
  
  // Calculate financial health indicators
  const savingsRate = totalIncome > 0 ? (monthlyNet / totalIncome) * 100 : 0;
  const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;
  
  // Determine financial health status
  const financialHealthStatus = 
    savingsRate >= 30 ? 'excellent' :
    savingsRate >= 20 ? 'good' :
    savingsRate >= 10 ? 'fair' :
    savingsRate >= 0 ? 'poor' : 'critical';

  return {
    // Income
    monthlySalary,
    propertyIncome,
    businessIncome,
    investmentIncome,
    totalIncome,
    
    // Expenses
    housingExpense,
    transportationExpense,
    foodExpense,
    healthcareExpense,
    taxExpense,
    lifestyleExpenses,
    businessExpenses,
    totalExpenses,
    
    // Summary
    monthlyNet,
    savingsRate,
    expenseToIncomeRatio,
    financialHealthStatus
  };
}

/**
 * Helper function to allow non-React components to access the finance calculations
 * Useful for calculating expenses in the character store's monthlyUpdate method
 */
export function calculateMonthlyFinances(characterState: any) {
  // Income calculations
  const job = characterState.job;
  // Using job.salary / 12 to match JobScreen and hook calculation
  const monthlySalary = job ? job.salary / 12 : 0;
  
  // Calculate property income directly to match Properties screen and hook calculation
  const propertyIncome = characterState.properties.reduce((total: number, property: any) => {
    // Use direct income values without multipliers for consistency
    return total + (property.income || 0);
  }, 0);
  
  const businessIncome = characterState.businesses?.reduce((total: number, business: any) => 
    total + (business.monthlyRevenue || 0), 0) || 0;
  
  const investmentIncome = characterState.stocks?.reduce((total: number, stock: any) => 
    total + (stock.dividend || 0), 0) || 0;
  
  const totalIncome = monthlySalary + propertyIncome + businessIncome + investmentIncome;
  
  // Expense calculations - use the same consistent approach as the hook
  console.log("DEBUG: calculateMonthlyFinances - housingType:", characterState.housingType);
  console.log("DEBUG: calculateMonthlyFinances - hasHousingFunction:", !!characterState.getHousingExpense);
  
  const housingExpense = characterState.getHousingExpense ? 
                        characterState.getHousingExpense() : 
                        // Fallback calculation using the same constants as useCharacter
                        characterState.housingType === 'rental' ? EXPENSE_RATES.HOUSING.RENTAL : 
                        characterState.housingType === 'shared' ? EXPENSE_RATES.HOUSING.SHARED :
                        characterState.housingType === 'owned' ? EXPENSE_RATES.HOUSING.OWNED : 
                        EXPENSE_RATES.HOUSING.HOMELESS;
  
  console.log("DEBUG: calculateMonthlyFinances - calculated housingExpense:", housingExpense);
  
  console.log("DEBUG: calculateMonthlyFinances - vehicleType:", characterState.vehicleType);
  console.log("DEBUG: calculateMonthlyFinances - hasTransportationFunction:", !!characterState.getTransportationExpense);
  
  const transportationExpense = characterState.getTransportationExpense ?
                              characterState.getTransportationExpense() :
                              // Fallback calculation using the same constants as useCharacter
                              characterState.vehicleType === 'economy' ? EXPENSE_RATES.TRANSPORTATION.ECONOMY :
                              characterState.vehicleType === 'standard' ? EXPENSE_RATES.TRANSPORTATION.STANDARD :
                              characterState.vehicleType === 'luxury' ? EXPENSE_RATES.TRANSPORTATION.LUXURY :
                              characterState.vehicleType === 'premium' ? EXPENSE_RATES.TRANSPORTATION.PREMIUM :
                              characterState.vehicleType === 'bicycle' ? EXPENSE_RATES.TRANSPORTATION.BICYCLE : 
                              EXPENSE_RATES.TRANSPORTATION.NONE;
                              
  console.log("DEBUG: calculateMonthlyFinances - calculated transportationExpense:", transportationExpense);
  
  // Food expenses based on lifestyle level and constant
  const lifestyleLevel = characterState.lifestyleLevel || 1;
  const foodExpense = characterState.getFoodExpense ? 
                      characterState.getFoodExpense() :
                      EXPENSE_RATES.FOOD; // Use constant value for consistency
  
  const healthcareExpense = 200;
  
  const taxRate = totalIncome < 3000 ? 0.15 : 
                 totalIncome < 6000 ? 0.22 : 
                 totalIncome < 10000 ? 0.26 : 0.30;
  const taxExpense = totalIncome * taxRate;
  
  const lifestyleExpenses = characterState.lifestyleItems.reduce((total: number, item: any) => {
    const ageMultiplier = item.age ? (1 + item.age * 0.05) : 1;
    const qualityMultiplier = item.quality === 'luxury' ? 1.5 : 
                            item.quality === 'high' ? 1.2 : 
                            item.quality === 'standard' ? 1.0 : 0.8;
    
    const monthlyCost = item.monthlyCost || 
                       (item.maintenanceCost ? item.maintenanceCost * 30 * ageMultiplier * qualityMultiplier : 0);
    
    return total + monthlyCost;
  }, 0);
  
  const businessExpenses = characterState.businesses?.reduce((total: number, business: any) => 
    total + (business.monthlyExpenses || 0), 0) || 0;
  
  const totalExpenses = housingExpense + transportationExpense + foodExpense + 
                      healthcareExpense + taxExpense + lifestyleExpenses + businessExpenses;
  
  return {
    // Income
    monthlySalary,
    propertyIncome,
    businessIncome,
    investmentIncome,
    totalIncome,
    
    // Expenses
    housingExpense,
    transportationExpense,
    foodExpense,
    healthcareExpense, 
    taxExpense,
    lifestyleExpenses,
    businessExpenses,
    totalExpenses,
    
    // Summary
    monthlyNet: totalIncome - totalExpenses
  };
}