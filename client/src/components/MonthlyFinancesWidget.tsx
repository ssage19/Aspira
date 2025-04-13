import React from 'react';
import { Card, CardContent } from './ui/card';
import { formatCurrency } from '../lib/utils';
import { useCharacter } from '../lib/stores/useCharacter';
import { Calendar } from 'lucide-react';

/**
 * MonthlyFinancesWidget Component
 * 
 * A compact widget that shows monthly income and expenses with improved dark mode support
 * and a detailed breakdown of the player's financial situation
 */
export function MonthlyFinancesWidget() {
  const characterState = useCharacter();
  
  // Calculate income values
  const propertyIncome = characterState.properties.reduce((total, property) => 
    total + property.income, 0);
  const job = characterState.job;
  const monthlySalary = job ? (job.salary / 26) * 2.17 : 0;
  const totalIncome = propertyIncome + monthlySalary;
  
  // Calculate expense values - this will be improved in the comprehensive version
  const housingExpense = characterState.housingType === 'rental' ? 1800 : 
                        characterState.housingType === 'shared' ? 900 : 0;
  
  const transportationExpense = characterState.vehicleType === 'economy' ? 300 :
                              characterState.vehicleType === 'standard' ? 450 :
                              characterState.vehicleType === 'luxury' ? 1000 :
                              characterState.vehicleType === 'premium' ? 1500 :
                              characterState.vehicleType === 'bicycle' ? 50 : 0;
  
  const foodExpense = 600; // Standard food expense
  
  // Calculate lifestyle expenses from actual items
  const lifestyleExpenses = characterState.lifestyleItems.reduce((total, item) => {
    const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
    return total + monthlyCost;
  }, 0);
  
  const totalExpenses = lifestyleExpenses + housingExpense + transportationExpense + foodExpense;
  const monthlyNet = totalIncome - totalExpenses;

  return (
    <Card className="shadow-sm border border-border h-full">
      <CardContent className="p-4">
        {/* Widget Header */}
        <div className="flex items-center mb-3">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-base">Monthly Finances</h3>
        </div>
        
        {/* Income Section - with improved dark mode colors */}
        <div className="bg-green-500/10 dark:bg-green-950/50 rounded-md p-2 mb-2">
          <div className="text-green-700 dark:text-green-300 font-medium mb-1 text-sm">Monthly Income</div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Salary:</span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(monthlySalary)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Property Income:</span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(propertyIncome)}</span>
          </div>
          <div className="border-t border-green-500/20 dark:border-green-300/20 mt-1 pt-1 flex justify-between">
            <span className="font-medium text-sm">Total Income:</span>
            <span className="font-semibold text-green-600 dark:text-green-300">+{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        
        {/* Expenses Section - with improved dark mode colors */}
        <div className="bg-red-500/10 dark:bg-red-950/50 rounded-md p-2 mb-2">
          <div className="text-red-700 dark:text-red-300 font-medium mb-1 text-sm">Monthly Expenses</div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Housing:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(housingExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Transportation:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(transportationExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Food & Groceries:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(foodExpense)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Lifestyle:</span>
            <span className="font-semibold text-red-600 dark:text-red-300">-{formatCurrency(lifestyleExpenses)}</span>
          </div>
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
      </CardContent>
    </Card>
  );
}