import { useCharacter } from '../stores/useCharacter';

/**
 * Custom hook to calculate monthly finances consistently across the application
 * This ensures the same finance calculations are used in both the UI display
 * and the actual deduction of expenses
 */
export function useMonthlyFinances() {
  const characterState = useCharacter();
  
  // Calculate income values with more detailed breakdown
  const job = characterState.job;
  const monthlySalary = job ? (job.salary / 26) * 2.17 : 0;
  
  // Calculate property income with better property value assessment
  const propertyIncome = characterState.properties.reduce((total, property) => {
    // Consider property condition and location in income calculation
    const locationMultiplier = property.location === 'downtown' ? 1.2 : 
                              property.location === 'suburban' ? 1.0 : 0.8;
    
    const conditionMultiplier = property.condition === 'excellent' ? 1.1 : 
                               property.condition === 'good' ? 1.0 : 
                               property.condition === 'fair' ? 0.9 : 0.7;
    
    return total + (property.income * locationMultiplier * conditionMultiplier);
  }, 0);
  
  // Calculate business income if any
  const businessIncome = characterState.businesses?.reduce((total, business) => 
    total + (business.monthlyRevenue || 0), 0) || 0;
  
  // Calculate investment income (simplified)
  const investmentIncome = characterState.stocks?.reduce((total, stock) => 
    total + (stock.dividend || 0), 0) || 0;
  
  const totalIncome = monthlySalary + propertyIncome + businessIncome + investmentIncome;
  
  // Calculate expense values with comprehensive breakdown
  // Housing expenses based on housing type with more detail
  const housingExpense = characterState.housingType === 'rental' ? 1800 : 
                        characterState.housingType === 'shared' ? 900 :
                        characterState.housingType === 'owned' ? 
                          (characterState.properties.find(p => p.isPlayerResidence)?.monthlyCost || 1200) : 0;
  
  // Transportation expenses with more detail
  const transportationExpense = characterState.vehicleType === 'economy' ? 300 :
                              characterState.vehicleType === 'standard' ? 450 :
                              characterState.vehicleType === 'luxury' ? 1000 :
                              characterState.vehicleType === 'premium' ? 1500 :
                              characterState.vehicleType === 'bicycle' ? 50 : 200; // Public transit fallback
  
  // Food expenses based on lifestyle level
  const lifestyleLevel = characterState.lifestyleLevel || 1;
  const foodExpense = 400 + (lifestyleLevel * 100); // Scales with lifestyle level
  
  // Calculate healthcare expenses
  const healthcareExpense = 200; // Base healthcare cost
  
  // Calculate taxes (simplified progressive tax)
  const monthlyIncome = totalIncome;
  const taxRate = monthlyIncome < 3000 ? 0.15 : 
                 monthlyIncome < 6000 ? 0.22 : 
                 monthlyIncome < 10000 ? 0.26 : 0.30;
  const taxExpense = monthlyIncome * taxRate;
  
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
  const monthlySalary = job ? (job.salary / 26) * 2.17 : 0;
  
  const propertyIncome = characterState.properties.reduce((total: number, property: any) => {
    const locationMultiplier = property.location === 'downtown' ? 1.2 : 
                              property.location === 'suburban' ? 1.0 : 0.8;
    
    const conditionMultiplier = property.condition === 'excellent' ? 1.1 : 
                               property.condition === 'good' ? 1.0 : 
                               property.condition === 'fair' ? 0.9 : 0.7;
    
    return total + (property.income * locationMultiplier * conditionMultiplier);
  }, 0);
  
  const businessIncome = characterState.businesses?.reduce((total: number, business: any) => 
    total + (business.monthlyRevenue || 0), 0) || 0;
  
  const investmentIncome = characterState.stocks?.reduce((total: number, stock: any) => 
    total + (stock.dividend || 0), 0) || 0;
  
  const totalIncome = monthlySalary + propertyIncome + businessIncome + investmentIncome;
  
  // Expense calculations
  const housingExpense = characterState.housingType === 'rental' ? 1800 : 
                        characterState.housingType === 'shared' ? 900 :
                        characterState.housingType === 'owned' ? 
                          (characterState.properties.find((p: any) => p.isPlayerResidence)?.monthlyCost || 1200) : 0;
  
  const transportationExpense = characterState.vehicleType === 'economy' ? 300 :
                              characterState.vehicleType === 'standard' ? 450 :
                              characterState.vehicleType === 'luxury' ? 1000 :
                              characterState.vehicleType === 'premium' ? 1500 :
                              characterState.vehicleType === 'bicycle' ? 50 : 200;
  
  const lifestyleLevel = characterState.lifestyleLevel || 1;
  const foodExpense = 400 + (lifestyleLevel * 100);
  
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