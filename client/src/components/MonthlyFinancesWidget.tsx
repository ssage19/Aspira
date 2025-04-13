import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../lib/utils';
import { useCharacter } from '../lib/stores/useCharacter';
import { Calendar, DollarSign, Home, Car, ShoppingBag, Coffee, Briefcase, Building } from 'lucide-react';
import { Progress } from './ui/progress';

/**
 * MonthlyFinancesWidget Component
 * 
 * A comprehensive widget that shows monthly income and expenses with improved dark mode support
 * and a detailed breakdown of the player's financial situation
 */
export function MonthlyFinancesWidget() {
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
  
  // Get color based on financial health
  const getHealthColor = () => {
    switch(financialHealthStatus) {
      case 'excellent': return 'text-emerald-600 dark:text-emerald-300';
      case 'good': return 'text-green-600 dark:text-green-300';
      case 'fair': return 'text-yellow-600 dark:text-yellow-300';
      case 'poor': return 'text-orange-600 dark:text-orange-300';
      case 'critical': return 'text-red-600 dark:text-red-300';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  };
  
  // Get progress bar colors based on financial health
  const getProgressColor = () => {
    switch(financialHealthStatus) {
      case 'excellent': return 'bg-emerald-500';
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-sm border border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center">
          <DollarSign className="h-5 w-5 text-primary mr-2" />
          Monthly Finances
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Financial Health Indicator */}
        <div className="mb-4 p-2 rounded-md bg-background/50 border border-border">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Financial Health:</span>
            <span className={`text-sm font-semibold capitalize ${getHealthColor()}`}>
              {financialHealthStatus}
            </span>
          </div>
          <div className="relative pt-1">
            <Progress 
              value={Math.max(0, Math.min(savingsRate * 2, 100))} 
              className="h-2"
              indicatorClassName={getProgressColor()} 
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Savings Rate: {savingsRate.toFixed(1)}% of income
          </div>
        </div>
        
        {/* Income Section - with improved dark mode colors */}
        <div className="bg-green-500/10 dark:bg-green-950/50 rounded-md p-2 mb-2">
          <div className="text-green-700 dark:text-green-300 font-medium mb-1 text-sm">Monthly Income</div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Salary:
            </span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(monthlySalary)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <Building className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Property Income:
            </span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(propertyIncome)}</span>
          </div>
          {businessIncome > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70 flex items-center">
                <Briefcase className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                Business Income:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(businessIncome)}</span>
            </div>
          )}
          {investmentIncome > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70 flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                Investment Income:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(investmentIncome)}</span>
            </div>
          )}
          <div className="border-t border-green-500/20 dark:border-green-300/20 mt-1 pt-1 flex justify-between">
            <span className="font-medium text-sm">Total Income:</span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        
        {/* Expenses Section - with improved dark mode colors */}
        <div className="bg-red-500/10 dark:bg-red-950/50 rounded-md p-2 mb-2">
          <div className="text-red-700 dark:text-red-300 font-medium mb-1 text-sm">Monthly Expenses</div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <Home className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Housing:
            </span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(housingExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <Car className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Transportation:
            </span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(transportationExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Food & Groceries:
            </span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(foodExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70 flex items-center">
              <Coffee className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              Lifestyle:
            </span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(lifestyleExpenses)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Healthcare:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(healthcareExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Taxes ({(taxRate * 100).toFixed(0)}%):</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(taxExpense)}</span>
          </div>
          {businessExpenses > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Business Expenses:</span>
              <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(businessExpenses)}</span>
            </div>
          )}
          <div className="border-t border-red-500/20 dark:border-red-300/20 mt-1 pt-1 flex justify-between">
            <span className="font-medium text-sm">Total Expenses:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
        
        {/* Net Income/Loss */}
        <div className={`flex justify-between font-semibold pt-1 ${monthlyNet >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
          <span>Monthly Net:</span>
          <span>{monthlyNet >= 0 ? '+' : ''}{formatCurrency(monthlyNet)}</span>
        </div>
        
        {/* Financial Guidance */}
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          {financialHealthStatus === 'excellent' && "Excellent financial management! You're saving significantly."}
          {financialHealthStatus === 'good' && "Good job balancing income and expenses while saving."}
          {financialHealthStatus === 'fair' && "You're saving some money, but consider reducing expenses."}
          {financialHealthStatus === 'poor' && "Your savings rate is low. Try to find ways to reduce expenses."}
          {financialHealthStatus === 'critical' && "Warning: You're spending more than you earn. Cut expenses immediately!"}
        </div>
      </CardContent>
    </Card>
  );
}