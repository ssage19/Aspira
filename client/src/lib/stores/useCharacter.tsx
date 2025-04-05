import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage, formatCurrency } from "../utils";
import { toast } from "sonner";
import { useTime } from "./useTime";

export interface CharacterSkills {
  intelligence: number;
  creativity: number;
  charisma: number;
  technical: number;
  leadership: number;
}

export interface Asset {
  id: string;
  name: string;
  type: "stock" | "bond" | "crypto" | "other";
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  purchaseDate: string;
}

export interface Property {
  id: string;
  name: string;
  type: "residential" | "commercial" | "industrial" | "mansion";
  location: string;
  purchasePrice: number;    // Full purchase price of the property
  downPayment: number;      // Amount paid upfront
  currentValue: number;     // Current market value
  loanAmount: number;       // Remaining loan balance
  loanTerm: number;         // Loan term in years
  interestRate: number;     // Annual interest rate
  monthlyPayment: number;   // Monthly loan payment
  income: number;           // Monthly income
  expenses: number;         // Monthly expenses (excluding mortgage)
  monthlyIncome?: number;   // Legacy field, replaced by income
  appreciationRate: number; // Annual appreciation rate
  purchaseDate: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  value?: number;           // Alias for currentValue in some places
  roi?: number;             // Return on investment for commercial properties
  prestige?: number;        // For luxury properties
  imageUrl?: string;
}

export interface LifestyleItem {
  id: string;
  name: string;
  type: "housing" | "transportation" | "hobbies" | "subscriptions" | "luxury";
  monthlyCost: number;
  happiness: number;
  prestige: number;
  purchasePrice?: number;
  purchaseDate?: string;
  imageUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: number;
  stress: number;
  happinessImpact: number;
  prestigeImpact: number;
  timeCommitment: number;
  skillGains: Partial<CharacterSkills>;
  skillRequirements: Partial<CharacterSkills>;
  professionId: string;
  jobLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  monthsInPosition: number;
  experienceRequired: number;
}

interface NetWorthBreakdown {
  cash: number;
  stocks: number;
  crypto: number;
  bonds: number;
  otherInvestments: number;
  propertyEquity: number;
  propertyValue: number;
  propertyDebt: number;
  total: number;
}

interface CharacterState {
  // Basic info
  name: string;
  wealth: number;
  netWorth: number;
  
  // Character attributes (0-100)
  happiness: number;
  prestige: number;
  stress: number;
  health: number;
  socialConnections: number;
  environmentalImpact: number;
  
  // Basic needs (0-100)
  hunger: number;      // 0 = starving, 100 = full
  thirst: number;      // 0 = dehydrated, 100 = hydrated
  energy: number;      // 0 = exhausted, 100 = energetic
  comfort: number;     // 0 = uncomfortable, 100 = comfortable
  
  // Transportation & Housing
  hasVehicle: boolean;
  vehicleType: 'none' | 'bicycle' | 'economy' | 'standard' | 'luxury' | 'premium';
  housingType: 'homeless' | 'shared' | 'rental' | 'owned' | 'luxury';
  
  // Time management
  freeTime: number;
  timeCommitment: number;
  
  // Skills (0-100)
  skills: CharacterSkills;
  
  // Skill points - for allocation during character creation and gameplay
  skillPoints: number;
  earnedSkillPoints: number;
  
  // Character possessions
  assets: Asset[];
  properties: Property[];
  lifestyleItems: LifestyleItem[];
  
  // Career
  job: Job | null;
  jobHistory: Job[];
  daysSincePromotion: number;
  income: number;
  expenses: number;
  
  // Demographic info (for achievements/events)
  age: number;
  education: string;
  
  // Functions
  setName: (name: string) => void;
  
  // Character creation
  createNewCharacter: (name: string, initialWealth: number, job: Job | null, customSkills?: CharacterSkills) => void;
  
  // Economy functions
  addWealth: (amount: number) => void;
  addIncome: (amount: number) => void;
  addExpense: (amount: number) => void;
  
  // Attributes
  addHappiness: (amount: number) => void;
  addStress: (amount: number) => void;
  addHealth: (amount: number) => void;
  addPrestige: (amount: number) => void;
  updateSocialConnections: (amount: number) => void;
  
  // Basic needs
  updateHunger: (amount: number) => void;
  updateThirst: (amount: number) => void;
  updateEnergy: (amount: number) => void;
  updateComfort: (amount: number) => void;
  setVehicle: (type: CharacterState['vehicleType']) => void;
  setHousing: (type: CharacterState['housingType']) => void;
  
  // Assets management
  addAsset: (asset: Asset) => void;
  sellAsset: (assetId: string, quantity: number) => number;
  updateAssetValue: (assetId: string, newPrice: number) => void;
  updateAllAssetValues: (multiplier: number) => void;
  updateAssetValuesByType: (type: Asset['type'], multiplier: number, idFilter?: string[]) => void;
  
  // Properties management
  addProperty: (property: Property) => void;
  sellProperty: (propertyId: string) => number;
  updatePropertyValue: (propertyId: string, newValue: number) => void;
  updatePropertyIncome: (propertyId: string, newIncome: number) => void;
  updateAllPropertyValues: (multiplier: number) => void;
  updateAllPropertyIncome: (multiplier: number) => void;
  updatePropertyValuesByType: (type: Property['type'], multiplier: number, idFilter?: string[]) => void;
  updatePropertyIncomeByType: (type: Property['type'], multiplier: number, idFilter?: string[]) => void;
  
  // Lifestyle
  addLifestyleItem: (item: LifestyleItem) => void;
  removeLifestyleItem: (itemId: string) => void;
  
  // Career
  setJob: (job: Job) => void;
  promoteJob: (newJob: Job) => void;
  quitJob: () => void;
  
  // Skills
  improveSkill: (skill: keyof CharacterSkills, amount: number) => void;
  allocateSkillPoint: (skill: keyof CharacterSkills) => boolean;
  awardSkillPoints: (amount: number) => void;
  spendEarnedSkillPoint: (skill: keyof CharacterSkills) => boolean;
  
  // Net worth calculation
  calculateNetWorth: () => number;
  getNetWorthBreakdown: () => NetWorthBreakdown;
  
  // Daily/weekly updates
  processDailyUpdate: () => void;
  weeklyUpdate: () => void;
  monthlyUpdate: () => void;
  
  // Save state
  saveState: () => void;
  resetCharacter: () => void;
}

const STORAGE_KEY = 'business-empire-character';

// Load from local storage if available
const loadSavedCharacter = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

// Default state for a new character
const getDefaultCharacter = () => ({
  name: "",
  wealth: 10000,
  netWorth: 10000,
  
  happiness: 70,
  prestige: 10,
  stress: 30,
  health: 80,
  socialConnections: 60,
  environmentalImpact: 0,
  
  // Initialize basic needs with default values
  hunger: 90,      // Start well-fed
  thirst: 90,      // Start well-hydrated
  energy: 80,      // Start rested
  comfort: 70,     // Start reasonably comfortable
  
  // Transportation & Housing
  hasVehicle: false,
  vehicleType: 'none' as const,
  housingType: 'shared' as const,
  
  freeTime: 40,
  timeCommitment: 40,
  
  // Starting skill levels - these will be customized during character creation
  skills: {
    intelligence: 30,
    creativity: 30,
    charisma: 30,
    technical: 30,
    leadership: 30
  },
  
  // Skill points available to allocate during character creation
  skillPoints: 50,
  
  // Earned skill points that can be spent later
  earnedSkillPoints: 0,
  
  assets: [],
  properties: [],
  lifestyleItems: [],
  
  job: null,
  jobHistory: [],
  daysSincePromotion: 0,
  income: 0,
  expenses: 0,
  
  age: 25,
  education: "Bachelor's Degree"
});

export const useCharacter = create<CharacterState>()(
  subscribeWithSelector((set, get) => {
    // Try to load saved character
    const savedCharacter = loadSavedCharacter();
    
    // Initialize with saved data or defaults
    const initialState = savedCharacter || getDefaultCharacter();
    
    return {
      ...initialState,
      
      // Set character name
      setName: (name) => {
        set({ name });
        saveState();
      },
      
      // Create a new character
      createNewCharacter: (name, initialWealth, job, customSkills) => {
        const defaultCharacter = getDefaultCharacter();
        
        // Create a new character with the default values plus our overrides
        set((state) => ({
          ...defaultCharacter,
          name,
          wealth: initialWealth,
          netWorth: initialWealth,
          job,
          income: job ? job.salary : 0,
          // Apply custom skills if provided, otherwise use defaults
          skills: customSkills || defaultCharacter.skills,
          // Set skill points to 0 since they've been allocated
          skillPoints: 0,
          // Keep the functions from the current state
          setName: state.setName,
          createNewCharacter: state.createNewCharacter,
          addWealth: state.addWealth,
          addIncome: state.addIncome,
          addExpense: state.addExpense,
          addHappiness: state.addHappiness,
          addStress: state.addStress,
          addHealth: state.addHealth,
          addPrestige: state.addPrestige,
          addAsset: state.addAsset,
          sellAsset: state.sellAsset,
          updateAssetValue: state.updateAssetValue,
          updateAllAssetValues: state.updateAllAssetValues,
          updateAssetValuesByType: state.updateAssetValuesByType,
          addProperty: state.addProperty,
          sellProperty: state.sellProperty,
          updatePropertyValue: state.updatePropertyValue,
          updatePropertyIncome: state.updatePropertyIncome,
          updateAllPropertyValues: state.updateAllPropertyValues,
          updateAllPropertyIncome: state.updateAllPropertyIncome,
          updatePropertyValuesByType: state.updatePropertyValuesByType,
          updatePropertyIncomeByType: state.updatePropertyIncomeByType,
          addLifestyleItem: state.addLifestyleItem,
          removeLifestyleItem: state.removeLifestyleItem,
          setJob: state.setJob,
          promoteJob: state.promoteJob,
          quitJob: state.quitJob,
          improveSkill: state.improveSkill,
          allocateSkillPoint: state.allocateSkillPoint,
          awardSkillPoints: state.awardSkillPoints,
          spendEarnedSkillPoint: state.spendEarnedSkillPoint,
          calculateNetWorth: state.calculateNetWorth,
          processDailyUpdate: state.processDailyUpdate,
          weeklyUpdate: state.weeklyUpdate,
          monthlyUpdate: state.monthlyUpdate,
          saveState: state.saveState,
          resetCharacter: state.resetCharacter
        }));
        
        saveState();
      },
      
      // Economy functions
      addWealth: (amount) => {
        // Ensure amount is a valid number
        const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        
        set((state) => {
          // Ensure wealth and netWorth are valid numbers
          const currentWealth = typeof state.wealth === 'number' && !isNaN(state.wealth) 
                              ? state.wealth : 0;
          const currentNetWorth = typeof state.netWorth === 'number' && !isNaN(state.netWorth) 
                                ? state.netWorth : 0;
                                
          return { 
            wealth: currentWealth + validAmount,
            netWorth: currentNetWorth + validAmount
          };
        });
        
        console.log(`Adding ${validAmount} to wealth. New wealth: ${get().wealth}`);
        saveState();
      },
      
      addIncome: (amount) => {
        set((state) => ({ income: state.income + amount }));
        saveState();
      },
      
      addExpense: (amount) => {
        set((state) => ({ expenses: state.expenses + amount }));
        saveState();
      },
      
      // Attributes
      addHappiness: (amount) => {
        set((state) => {
          const newHappiness = Math.max(0, Math.min(100, state.happiness + amount));
          return { happiness: newHappiness };
        });
        saveState();
      },
      
      addStress: (amount) => {
        set((state) => {
          const newStress = Math.max(0, Math.min(100, state.stress + amount));
          return { stress: newStress };
        });
        saveState();
      },
      
      addHealth: (amount) => {
        set((state) => {
          const newHealth = Math.max(0, Math.min(100, state.health + amount));
          return { health: newHealth };
        });
        saveState();
      },
      
      addPrestige: (amount) => {
        set((state) => {
          const newPrestige = Math.max(0, Math.min(100, state.prestige + amount));
          return { prestige: newPrestige };
        });
        saveState();
      },
      
      updateSocialConnections: (amount) => {
        set((state) => {
          const newSocialConnections = Math.max(0, Math.min(100, state.socialConnections + amount));
          return { socialConnections: newSocialConnections };
        });
        saveState();
      },
      
      // Basic needs
      updateHunger: (amount) => {
        set((state) => {
          const newHunger = Math.max(0, Math.min(100, state.hunger + amount));
          return { hunger: newHunger };
        });
        saveState();
      },
      
      updateThirst: (amount) => {
        set((state) => {
          const newThirst = Math.max(0, Math.min(100, state.thirst + amount));
          return { thirst: newThirst };
        });
        saveState();
      },
      
      updateEnergy: (amount) => {
        set((state) => {
          const newEnergy = Math.max(0, Math.min(100, state.energy + amount));
          return { energy: newEnergy };
        });
        saveState();
      },
      
      updateComfort: (amount) => {
        set((state) => {
          const newComfort = Math.max(0, Math.min(100, state.comfort + amount));
          return { comfort: newComfort };
        });
        saveState();
      },
      
      setVehicle: (type) => {
        set((state) => ({
          vehicleType: type,
          hasVehicle: type !== 'none'
        }));
        saveState();
      },
      
      setHousing: (type) => {
        set((state) => ({ housingType: type }));
        saveState();
      },
      
      // Assets management
      addAsset: (asset) => {
        // Cost of the asset purchase
        const purchaseCost = asset.quantity * asset.currentPrice;
        
        set((state) => {
          // Check if we already own this asset
          const existingIndex = state.assets.findIndex(a => a.id === asset.id);
          
          if (existingIndex >= 0) {
            // Update existing asset
            const existingAsset = state.assets[existingIndex];
            const totalValue = (existingAsset.quantity * existingAsset.currentPrice) + 
                              (asset.quantity * asset.currentPrice);
            const totalQuantity = existingAsset.quantity + asset.quantity;
            const averagePrice = totalValue / totalQuantity;
            
            const updatedAssets = [...state.assets];
            updatedAssets[existingIndex] = {
              ...existingAsset,
              quantity: totalQuantity,
              currentPrice: asset.currentPrice,
              purchasePrice: averagePrice
            };
            
            return { 
              assets: updatedAssets,
              wealth: state.wealth - purchaseCost
            };
          } else {
            // Add new asset
            return { 
              assets: [...state.assets, asset],
              wealth: state.wealth - purchaseCost
            };
          }
        });
        
        // Calculate new net worth after purchase
        // Net worth should remain the same because we're just converting cash to an asset
        // of equal value, but recalculate to ensure all values are in sync
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        
        // We don't need to explicitly track achievements here
        // Instead, they will be tracked in the component that calls this function
        
        saveState();
      },
      
      sellAsset: (assetId, quantity) => {
        let saleValue = 0;
        
        set((state) => {
          const assetIndex = state.assets.findIndex(a => a.id === assetId);
          
          if (assetIndex === -1) {
            return state; // Asset not found
          }
          
          const asset = state.assets[assetIndex];
          
          // Check if we're selling all or part
          if (quantity >= asset.quantity) {
            // Selling all
            saleValue = asset.quantity * asset.currentPrice;
            
            return {
              assets: state.assets.filter(a => a.id !== assetId),
              wealth: state.wealth + saleValue
            };
          } else {
            // Selling part
            saleValue = quantity * asset.currentPrice;
            
            const updatedAssets = [...state.assets];
            updatedAssets[assetIndex] = {
              ...asset,
              quantity: asset.quantity - quantity
            };
            
            return {
              assets: updatedAssets,
              wealth: state.wealth + saleValue
            };
          }
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        
        // We don't need to explicitly track achievements here
        // Instead, they will be tracked in the component that calls this function
        
        saveState();
        
        return saleValue;
      },
      
      updateAssetValue: (assetId, newPrice) => {
        set((state) => {
          const assetIndex = state.assets.findIndex(a => a.id === assetId);
          
          if (assetIndex === -1) {
            return state; // Asset not found
          }
          
          const updatedAssets = [...state.assets];
          updatedAssets[assetIndex] = {
            ...updatedAssets[assetIndex],
            currentPrice: newPrice
          };
          
          return { assets: updatedAssets };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      updateAllAssetValues: (multiplier) => {
        set((state) => {
          const updatedAssets = state.assets.map(asset => ({
            ...asset,
            currentPrice: asset.currentPrice * multiplier
          }));
          
          return { assets: updatedAssets };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      updateAssetValuesByType: (type, multiplier, idFilter) => {
        set((state) => {
          const updatedAssets = state.assets.map(asset => {
            // Check if this asset matches our criteria
            if (asset.type === type) {
              if (idFilter && idFilter.length > 0) {
                // If we have an ID filter, only update matching assets
                if (idFilter.includes(asset.id)) {
                  return {
                    ...asset,
                    currentPrice: asset.currentPrice * multiplier
                  };
                }
              } else {
                // No ID filter, update all assets of this type
                return {
                  ...asset,
                  currentPrice: asset.currentPrice * multiplier
                };
              }
            }
            
            return asset; // Return unchanged if no match
          });
          
          return { assets: updatedAssets };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      // Properties management
      addProperty: (property) => {
        // Ensure consistent property value handling
        // Make sure currentValue and purchasePrice are the same at purchase time
        if (property.purchasePrice && !property.currentValue) {
          property.currentValue = property.purchasePrice;
        } else if (property.currentValue && !property.purchasePrice) {
          property.purchasePrice = property.currentValue;
        }
        
        // Ensure we have both value and currentValue set for backward compatibility
        if (property.currentValue && !property.value) {
          property.value = property.currentValue;
        }
        
        // Get the down payment amount from the property
        const downPayment = property.downPayment;
        
        // If not provided, default required mortgage fields
        if (!property.loanAmount) {
          property.loanAmount = property.currentValue - downPayment;
        }
        if (!property.loanTerm) {
          property.loanTerm = 30; // 30 years default
        }
        if (!property.interestRate) {
          property.interestRate = 5.5; // 5.5% default
        }
        if (!property.monthlyPayment) {
          // Calculate monthly payment for the mortgage based on loanAmount
          // Using simplified formula: P = L[i(1 + i)^n]/[(1 + i)^n - 1]
          // Where P = payment, L = loan amount, i = monthly interest rate, n = number of payments
          const monthlyRate = property.interestRate / 100 / 12;
          const numberOfPayments = property.loanTerm * 12;
          const factor = (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
          property.monthlyPayment = property.loanAmount * factor;
        }
        
        // Check if the purchase would result in negative wealth
        const currentWealth = get().wealth;
        if (currentWealth < downPayment) {
          // Not enough money to make the purchase
          toast.error("Insufficient funds for the down payment", {
            duration: 3000,
            position: 'bottom-right',
          });
          return false; // Indicate failure
        }
        
        // Ensure income is properly set (backward compatibility)
        if (property.monthlyIncome && !property.income) {
          property.income = property.monthlyIncome;
        } else if (property.income && !property.monthlyIncome) {
          property.monthlyIncome = property.income;
        }
        
        // Add the property to the collection
        set((state) => ({
          properties: [...state.properties, property],
          wealth: state.wealth - downPayment,
          // Also add the monthly payment to ongoing expenses
          expenses: state.expenses + property.monthlyPayment,
          // Add property income to player's income
          income: state.income + property.income
        }));
        
        // Log purchase details for debugging
        console.log(`Property purchased: ${property.name}`);
        console.log(`Purchase price: ${property.purchasePrice}, Current value: ${property.currentValue}`);
        console.log(`Down payment: ${downPayment}, Loan amount: ${property.loanAmount}`);
        
        // Calculate new net worth after purchase
        // Net worth = assets (property value) - liabilities (loan amount)
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
        
        return true; // Indicate success
      },
      
      sellProperty: (propertyId) => {
        let saleValue = 0;
        let propertyExpenseReduction = 0;
        let incomeReduction = 0;
        
        set((state) => {
          const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
          
          if (propertyIndex === -1) {
            return state; // Property not found
          }
          
          const property = state.properties[propertyIndex];
          
          // Calculate closing costs and realtor fees (typically 6-7% of sale price)
          const closingCostPercentage = 0.07; // 7%
          const closingCosts = property.currentValue * closingCostPercentage;
          
          // Calculate outstanding loan balance
          const outstandingLoan = property.loanAmount || 0;
          
          // Calculate early payoff penalty if applicable (usually 2-3% if within first few years)
          // Calculate months since purchase
          const purchaseDate = new Date(property.purchaseDate);
          const currentDate = new Date();
          const monthsSincePurchase = 
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
            (currentDate.getMonth() - purchaseDate.getMonth());
            
          let earlyPayoffPenalty = 0;
          if (monthsSincePurchase < 36) { // Less than 3 years
            earlyPayoffPenalty = outstandingLoan * 0.02; // 2% of remaining loan
          }
          
          // For quick flips (less than 1 month), add significant transaction costs
          // This reflects market reality and prevents exploiting quick buy/sell
          let quickFlipFee = 0;
          let quickFlipAdjustment = 1.0; // Default: no adjustment
          
          if (monthsSincePurchase < 1) {
            // For very quick flips (< 1 month), the property loses 15% of its value
            // This simulates significant transaction costs and market inefficiency
            quickFlipAdjustment = 0.85; // 15% loss in value
            
            // Log for debugging
            console.log(`Quick flip detected (< 1 month): Applying 15% value reduction`);
            console.log(`Original purchase price: ${property.purchasePrice}, Current market value before reduction: ${property.currentValue}`);
          } else if (monthsSincePurchase < 6) {
            // For moderately quick flips (1-6 months), the property loses 8% of its value
            quickFlipAdjustment = 0.92; // 8% loss in value
            
            // Log for debugging
            console.log(`Quick flip detected (1-6 months): Applying 8% value reduction`);
            console.log(`Original purchase price: ${property.purchasePrice}, Current market value before reduction: ${property.currentValue}`);
          }
          
          // Apply the quick flip adjustment directly to the property's current value
          // This ensures that the discount is applied before any other calculations
          property.currentValue = Math.round(property.currentValue * quickFlipAdjustment);
          
          // Calculate the dollar value of the quick flip fee for notification purposes
          if (quickFlipAdjustment < 1.0) {
            // The quick-flip fee is the difference between original market value and reduced value
            const originalValue = property.currentValue / quickFlipAdjustment;
            quickFlipFee = originalValue - property.currentValue;
            console.log(`Quick flip fee calculated: ${quickFlipFee}`);
          }
          
          // Calculate net proceeds from sale
          const grossSalePrice = property.currentValue;
          saleValue = grossSalePrice - closingCosts - outstandingLoan - earlyPayoffPenalty;
          
          // If the property is underwater (worth less than what's owed + costs),
          // the player still needs to pay the difference to close the sale
          if (saleValue < 0) {
            // Cap the loss at the player's available wealth if they can't cover it all
            const maxLoss = Math.min(Math.abs(saleValue), state.wealth);
            
            // Display a message to the user about the underwater property
            toast.warning(`This property is underwater - you paid ${formatCurrency(maxLoss)} to close the sale`, {
              duration: 5000,
              position: 'bottom-right',
            });
            
            // Track the monthly payment and income we're removing
            propertyExpenseReduction = property.monthlyPayment || 0;
            incomeReduction = property.income || 0;
            
            return {
              properties: state.properties.filter(p => p.id !== propertyId),
              wealth: state.wealth - maxLoss, // Subtract the loss from wealth
              expenses: state.expenses - propertyExpenseReduction,
              income: state.income - incomeReduction
            };
          } else {
            // Property sold with positive proceeds
            // Track the monthly payment and income we're removing
            propertyExpenseReduction = property.monthlyPayment || 0;
            incomeReduction = property.income || 0;
            
            // For quick flips, show breakdown of the transaction costs
            if (quickFlipFee > 0) {
              toast.info(`Quick flip fee: ${formatCurrency(quickFlipFee)} due to selling after only ${monthsSincePurchase} months`, {
                duration: 5000,
                position: 'bottom-right',
              });
            }
            
            return {
              properties: state.properties.filter(p => p.id !== propertyId),
              wealth: state.wealth + saleValue,
              expenses: state.expenses - propertyExpenseReduction,
              income: state.income - incomeReduction
            };
          }
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
        
        return saleValue;
      },
      
      updatePropertyValue: (propertyId, newValue) => {
        set((state) => {
          const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
          
          if (propertyIndex === -1) {
            return state; // Property not found
          }
          
          const updatedProperties = [...state.properties];
          updatedProperties[propertyIndex] = {
            ...updatedProperties[propertyIndex],
            currentValue: newValue
          };
          
          return { properties: updatedProperties };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      updatePropertyIncome: (propertyId, newIncome) => {
        set((state) => {
          const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
          
          if (propertyIndex === -1) {
            return state; // Property not found
          }
          
          const updatedProperties = [...state.properties];
          updatedProperties[propertyIndex] = {
            ...updatedProperties[propertyIndex],
            income: newIncome,
            // For backwards compatibility
            monthlyIncome: newIncome
          };
          
          return { properties: updatedProperties };
        });
        
        saveState();
      },
      
      updateAllPropertyValues: (multiplier) => {
        set((state) => {
          const updatedProperties = state.properties.map(property => ({
            ...property,
            currentValue: property.currentValue * multiplier
          }));
          
          return { properties: updatedProperties };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      updateAllPropertyIncome: (multiplier) => {
        set((state) => {
          const updatedProperties = state.properties.map(property => ({
            ...property,
            income: property.income * multiplier,
            // For backwards compatibility
            monthlyIncome: property.income * multiplier
          }));
          
          return { properties: updatedProperties };
        });
        
        saveState();
      },
      
      updatePropertyValuesByType: (type, multiplier, idFilter) => {
        set((state) => {
          const updatedProperties = state.properties.map(property => {
            // Check if this property matches our criteria
            if (property.type === type) {
              if (idFilter && idFilter.length > 0) {
                // If we have an ID filter, only update matching properties
                if (idFilter.includes(property.id)) {
                  return {
                    ...property,
                    currentValue: property.currentValue * multiplier
                  };
                }
              } else {
                // No ID filter, update all properties of this type
                return {
                  ...property,
                  currentValue: property.currentValue * multiplier
                };
              }
            }
            
            return property; // Return unchanged if no match
          });
          
          return { properties: updatedProperties };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      updatePropertyIncomeByType: (type, multiplier, idFilter) => {
        set((state) => {
          const updatedProperties = state.properties.map(property => {
            // Check if this property matches our criteria
            if (property.type === type) {
              if (idFilter && idFilter.length > 0) {
                // If we have an ID filter, only update matching properties
                if (idFilter.includes(property.id)) {
                  return {
                    ...property,
                    income: (property.income || 0) * multiplier,
                    // For backwards compatibility
                    monthlyIncome: (property.income || 0) * multiplier
                  };
                }
              } else {
                // No ID filter, update all properties of this type
                return {
                  ...property,
                  income: (property.income || 0) * multiplier,
                  // For backwards compatibility
                  monthlyIncome: (property.income || 0) * multiplier
                };
              }
            }
            
            return property; // Return unchanged if no match
          });
          
          return { properties: updatedProperties };
        });
        
        saveState();
      },
      
      // Lifestyle
      addLifestyleItem: (item) => {
        // Calculate purchase cost (if applicable)
        let purchaseCost = 0;
        if (item.purchasePrice) {
          purchaseCost = item.purchasePrice;
        }
        
        set((state) => ({
          lifestyleItems: [...state.lifestyleItems, item],
          expenses: state.expenses + item.monthlyCost,
          wealth: state.wealth - purchaseCost,
          happiness: Math.min(100, state.happiness + item.happiness),
          prestige: Math.min(100, state.prestige + item.prestige)
        }));
        
        // Calculate new net worth after purchase
        // Net worth should account for lifestyle item value
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      removeLifestyleItem: (itemId) => {
        set((state) => {
          const item = state.lifestyleItems.find(i => i.id === itemId);
          
          if (!item) {
            return state; // Item not found
          }
          
          return {
            lifestyleItems: state.lifestyleItems.filter(i => i.id !== itemId),
            expenses: state.expenses - item.monthlyCost,
            happiness: Math.max(0, state.happiness - item.happiness / 2), // Reduce some happiness, but not all
            prestige: Math.max(0, state.prestige - item.prestige / 2) // Reduce some prestige, but not all
          };
        });
        
        saveState();
      },
      
      // Career
      setJob: (job) => {
        set((state) => ({
          job,
          // We'll calculate income dynamically on a daily basis now
          // but we'll keep income field as total annual income for reference
          income: job.salary,
          daysSincePromotion: 0,
          timeCommitment: job.timeCommitment,
          freeTime: Math.max(0, 168 - job.timeCommitment) // 168 hours in a week
        }));
        
        saveState();
      },
      
      promoteJob: (newJob) => {
        set((state) => {
          const oldJob = state.job;
          
          // Add the old job to history
          const updatedHistory = oldJob 
            ? [...state.jobHistory, { ...oldJob, monthsInPosition: state.daysSincePromotion / 30 }] 
            : state.jobHistory;
          
          return {
            job: { ...newJob, monthsInPosition: 0 }, // Reset months in position for new job
            jobHistory: updatedHistory,
            // Keep income as the annual salary for reference
            income: newJob.salary,
            daysSincePromotion: 0,
            prestige: Math.min(100, state.prestige + newJob.prestigeImpact),
            happiness: Math.min(100, state.happiness + newJob.happinessImpact),
            stress: Math.min(100, state.stress + newJob.stress),
            timeCommitment: newJob.timeCommitment,
            freeTime: Math.max(0, 168 - newJob.timeCommitment) // 168 hours in a week
          };
        });
        
        saveState();
      },
      
      quitJob: () => {
        set((state) => {
          const oldJob = state.job;
          
          // Add the old job to history
          const updatedHistory = oldJob 
            ? [...state.jobHistory, { ...oldJob, monthsInPosition: state.daysSincePromotion / 30 }] 
            : state.jobHistory;
          
          return {
            job: null,
            jobHistory: updatedHistory,
            income: 0,
            stress: Math.max(0, state.stress - 20), // Reduce stress
            happiness: Math.max(0, state.happiness - 10), // Temporary happiness loss
            timeCommitment: 0,
            freeTime: 168 // All time is free when unemployed (168 hours in a week)
          };
        });
        
        saveState();
      },
      
      // Skills
      improveSkill: (skill, amount) => {
        set((state) => {
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = Math.min(100, updatedSkills[skill] + amount);
          
          return { skills: updatedSkills };
        });
        
        saveState();
      },
      
      // Skill points allocation for character creation
      allocateSkillPoint: (skill) => {
        let success = false;
        
        set((state) => {
          // Check if we have points to allocate
          if (state.skillPoints <= 0) {
            return state;
          }
          
          // Check if the skill is already maxed out
          if (state.skills[skill] >= 100) {
            return state;
          }
          
          // Allocate a point
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = Math.min(100, updatedSkills[skill] + 1);
          
          success = true;
          
          return {
            skills: updatedSkills,
            skillPoints: state.skillPoints - 1
          };
        });
        
        saveState();
        return success;
      },
      
      // Award skill points during gameplay (from quests, achievements, etc.)
      awardSkillPoints: (amount) => {
        set((state) => ({
          earnedSkillPoints: state.earnedSkillPoints + amount
        }));
        
        saveState();
      },
      
      // Spend earned skill points during gameplay
      spendEarnedSkillPoint: (skill) => {
        let success = false;
        
        set((state) => {
          // Check if we have points to spend
          if (state.earnedSkillPoints <= 0) {
            return state;
          }
          
          // Check if the skill is already maxed out
          if (state.skills[skill] >= 100) {
            return state;
          }
          
          // Allocate a point
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = Math.min(100, updatedSkills[skill] + 1);
          
          success = true;
          
          return {
            skills: updatedSkills,
            earnedSkillPoints: state.earnedSkillPoints - 1
          };
        });
        
        saveState();
        return success;
      },
      
      // Calculate net worth
      calculateNetWorth: () => {
        const state = get();
        
        // Start with cash (liquid assets)
        let netWorth = state.wealth;
        
        // Map containing detailed breakdown of assets for logging
        const breakdown = {
          cash: state.wealth,
          stocks: 0,
          crypto: 0,
          bonds: 0,
          otherInvestments: 0,
          propertyEquity: 0,
          propertyValue: 0,
          propertyDebt: 0,
          total: 0
        };
        
        // Add investment assets
        state.assets.forEach(asset => {
          const assetValue = asset.currentPrice * asset.quantity;
          netWorth += assetValue;
          
          // Track by investment type for breakdown
          switch(asset.type) {
            case 'stock':
              breakdown.stocks += assetValue;
              break;
            case 'crypto':
              breakdown.crypto += assetValue;
              break;
            case 'bond':
              breakdown.bonds += assetValue;
              break;
            default:
              breakdown.otherInvestments += assetValue;
          }
        });
        
        // Add property values and subtract outstanding loans
        state.properties.forEach(property => {
          // Get current property value
          const propertyValue = property.currentValue;
          breakdown.propertyValue += propertyValue;
          
          // Get outstanding loan amount
          const loanAmount = property.loanAmount || 0;
          breakdown.propertyDebt += loanAmount;
          
          // Property equity is value minus debt
          const equity = propertyValue - loanAmount;
          breakdown.propertyEquity += equity;
          
          // Add equity to net worth (value minus debt)
          netWorth += equity;
        });
        
        // Calculate total for percentage calculation
        breakdown.total = netWorth;
        
        // Log the breakdown for debugging
        console.log('Net worth breakdown:');
        console.log(`Cash: ${breakdown.cash} (${((breakdown.cash / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Stocks: ${breakdown.stocks} (${((breakdown.stocks / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Crypto: ${breakdown.crypto} (${((breakdown.crypto / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Bonds: ${breakdown.bonds} (${((breakdown.bonds / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Other investments: ${breakdown.otherInvestments} (${((breakdown.otherInvestments / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Property equity: ${breakdown.propertyEquity} (${((breakdown.propertyEquity / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Property value: ${breakdown.propertyValue}`);
        console.log(`Property debt: ${breakdown.propertyDebt}`);
        console.log(`Total net worth: ${breakdown.total}`);
        
        // Store the breakdown for UI access
        // We don't use set() here to avoid triggering a loop
        // Instead, we'll make this accessible via a getter
        (state as any).netWorthBreakdown = breakdown;
        
        return netWorth;
      },
      
      // Getter for the net worth breakdown
      getNetWorthBreakdown: () => {
        return (get() as any).netWorthBreakdown || {
          cash: get().wealth,
          stocks: 0,
          crypto: 0,
          bonds: 0,
          otherInvestments: 0,
          propertyEquity: 0,
          propertyValue: 0,
          propertyDebt: 0,
          total: get().wealth
        };
      },
      
      // Daily/weekly/monthly updates
      processDailyUpdate: () => {
        set((state) => {
          // Update days since promotion if employed
          let daysSincePromotion = state.daysSincePromotion;
          let dailyIncome = 0;
          
          // Get the dayCounter from useTime
          const { dayCounter } = useTime.getState();
          
          if (state.job) {
            // Increment days since promotion
            daysSincePromotion += 1;
            
            // Check if it's payday (every 14 days - bi-weekly paycheck)
            if (dayCounter % 14 === 0) {
              // Calculate bi-weekly income based on annual salary
              // Annual salary / 26 pay periods (annual to bi-weekly)
              const biWeeklyIncome = state.job.salary / 26;
              
              // Add a small random variation to make payments more interesting (±5%)
              const variation = 1 + ((Math.random() * 0.1) - 0.05);
              const adjustedBiWeeklyIncome = biWeeklyIncome * variation;
              
              // Assign to dailyIncome which will be added to wealth
              dailyIncome = adjustedBiWeeklyIncome;
              
              // Calculate formatted currency string directly using toLocaleString
              const formattedAmount = adjustedBiWeeklyIncome.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              });
              
              // Notify about paycheck
              toast(`Paycheck received: ${formattedAmount}`, {
                duration: 5000,
                position: 'bottom-right',
                icon: '💰'
              });
            }
          }
          
          // Add property income
          const dailyPropertyIncome = state.properties.reduce((total, property) => {
            return total + (property.income / 30); // Daily property income (monthly income ÷ 30)
          }, 0);
          
          // Process lifestyle expenses
          const dailyLifestyleExpenses = state.lifestyleItems.reduce((total, item) => {
            return total + (item.monthlyCost / 30); // Daily expense
          }, 0);
          
          // Apply income and expenses
          const netDailyChange = dailyIncome + dailyPropertyIncome - dailyLifestyleExpenses;
          
          // Basic needs changes (hunger, thirst, energy decrease over time)
          // Slow down the decay rate significantly to prevent death during 8-10 hour absences
          let hunger = Math.max(0, state.hunger - 3); // Slowed down decay (was 15)
          let thirst = Math.max(0, state.thirst - 4); // Slowed down decay (was 20)
          let energy = Math.max(0, state.energy - 2); // Slowed down decay (was 10)
          
          // Housing type affects comfort
          let comfort = state.comfort;
          switch(state.housingType) {
            case 'homeless':
              comfort = Math.max(0, comfort - 5); // Decrease comfort if homeless
              energy = Math.max(0, energy - 5);   // Extra energy loss if homeless
              break;
            case 'shared':
              // Comfort stays neutral in shared housing
              break;
            case 'rental':
              comfort = Math.min(100, comfort + 1); // Slight comfort gain with rental
              break;
            case 'owned':
              comfort = Math.min(100, comfort + 2); // Better comfort gain with owned home
              break;
            case 'luxury':
              comfort = Math.min(100, comfort + 3); // Best comfort with luxury housing
              energy = Math.min(100, energy + 2);   // Extra energy gain with luxury
              break;
          }
          
          // Comprehensive health calculation based on all basic needs and stress
          
          // Get weighted averages of needs with different importance factors
          // Scale is 0-100 for each need, and we'll use the following weights:
          const hungerWeight = 0.25;     // 25% - critical for survival
          const thirstWeight = 0.25;     // 25% - critical for survival
          const energyWeight = 0.2;      // 20% - important for daily functioning
          const comfortWeight = 0.1;     // 10% - impacts long-term wellbeing
          
          // Calculate the base health score from weighted needs
          const basicNeedsScore = (
            (hunger * hungerWeight) +
            (thirst * thirstWeight) +
            (energy * energyWeight) +
            (comfort * comfortWeight)
          ) / (hungerWeight + thirstWeight + energyWeight + comfortWeight);
          
          // Apply stress penalty (high stress hurts health)
          // Stress is on a scale of 0-100, where 0 is best (no stress)
          const stressScore = Math.max(0, 100 - state.stress);
          const stressWeight = 0.2;      // 20% - significant impact on health
          
          // Calculate final health score with both needs and stress factored in
          const targetHealth = (
            (basicNeedsScore * (1 - stressWeight)) +
            (stressScore * stressWeight)
          );
          
          // Gradually adjust current health toward the target (don't change too abruptly)
          // Health changes slowly, at a rate of up to 5% per day
          const maxDailyChange = 3; // Max points change per day
          const healthDifference = targetHealth - state.health;
          
          let health = state.health;
          if (Math.abs(healthDifference) > 0) {
            // Move health toward target, but limit the daily change rate
            health += Math.sign(healthDifference) * Math.min(Math.abs(healthDifference), maxDailyChange);
            // Ensure health stays within bounds
            health = Math.max(0, Math.min(100, health));
          }
          
          // Debug log to see health calculation (commented out in production)
          // console.log(`Health calc: needs=${basicNeedsScore.toFixed(1)}, stress=${stressScore.toFixed(1)}, target=${targetHealth.toFixed(1)}, actual=${health.toFixed(1)}`);
          
          // Show property income notification if there's any
          if (dailyPropertyIncome > 0) {
            // Format the currency string directly
            const formattedPropertyIncome = dailyPropertyIncome.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            });
            
            toast(`Property income received: ${formattedPropertyIncome}`, {
              duration: 3000,
              position: 'bottom-right',
              icon: '🏢'
            });
          }
          
          // Apply changes
          return { 
            daysSincePromotion,
            wealth: state.wealth + netDailyChange,
            netWorth: state.netWorth + netDailyChange,
            hunger,
            thirst,
            energy,
            comfort,
            health
          };
        });
        
        saveState();
      },
      
      weeklyUpdate: () => {
        set((state) => {
          // Apply job effects weekly
          let happiness = state.happiness;
          let stress = state.stress;
          let updatedSkills = { ...state.skills };
          
          if (state.job) {
            // Apply happiness impact
            happiness = Math.max(0, Math.min(100, happiness + state.job.happinessImpact / 4));
            
            // Apply stress impact
            stress = Math.max(0, Math.min(100, stress + state.job.stress / 4));
            
            // Apply skill gains
            for (const [skill, gain] of Object.entries(state.job.skillGains)) {
              const skillKey = skill as keyof CharacterSkills;
              if (skillKey in updatedSkills) {
                updatedSkills[skillKey] = Math.min(100, updatedSkills[skillKey] + (gain / 4));
              }
            }
          }
          
          return {
            happiness,
            stress,
            skills: updatedSkills
          };
        });
        
        saveState();
      },
      
      monthlyUpdate: () => {
        set((state) => {
          // Property income is now calculated daily instead of monthly
          
          // Monthly health adjustments based on happiness and environmental factors
          // Daily calculation handles basic needs and stress, this handles longer-term factors
          
          // Happiness has a gradual effect on health (positive or negative)
          const happinessEffect = state.happiness > 75 ? 3 : // Very happy: significant health boost
                                state.happiness > 50 ? 1 : // Moderately happy: small health boost
                                state.happiness < 25 ? -3 : // Very unhappy: significant health decline
                                state.happiness < 50 ? -1 : // Moderately unhappy: small health decline
                                0; // Neutral happiness: no effect
          
          // Social connections impact health (loneliness is detrimental to health)
          const socialEffect = state.socialConnections > 70 ? 2 : // Strong social network: health benefit
                             state.socialConnections < 30 ? -2 : // Limited social connections: health penalty
                             0; // Average social life: neutral effect
          
          // Environmental impact can affect health (pollution, etc.)
          const environmentEffect = state.environmentalImpact > 50 ? -1 : // High environmental impact: slight health penalty
                                  state.environmentalImpact > 75 ? -2 : // Very high impact: larger health penalty
                                  0; // Low environmental impact: no effect
          
          // Apply monthly health adjustments (smaller than daily adjustments to avoid large swings)
          const updatedHealth = Math.max(0, Math.min(100, state.health + happinessEffect + socialEffect + environmentEffect));
          
          // Update job experience if employed
          let updatedJob = state.job;
          if (updatedJob) {
            // Increment months in current position
            updatedJob = {
              ...updatedJob,
              monthsInPosition: (updatedJob.monthsInPosition || 0) + 1
            };
          }
          
          return {
            health: updatedHealth,
            job: updatedJob
          };
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      saveState: () => {
        const state = get();
        setLocalStorage(STORAGE_KEY, state);
      },
      
      resetCharacter: () => {
        const defaultCharacter = getDefaultCharacter();
        
        // Apply the default character but preserve all the functions
        set((state) => ({
          ...defaultCharacter,
          // Keep the functions from the current state
          setName: state.setName,
          createNewCharacter: state.createNewCharacter,
          addWealth: state.addWealth,
          addIncome: state.addIncome,
          addExpense: state.addExpense,
          addHappiness: state.addHappiness,
          addStress: state.addStress,
          addHealth: state.addHealth,
          addPrestige: state.addPrestige,
          addAsset: state.addAsset,
          sellAsset: state.sellAsset,
          updateAssetValue: state.updateAssetValue,
          updateAllAssetValues: state.updateAllAssetValues,
          updateAssetValuesByType: state.updateAssetValuesByType,
          addProperty: state.addProperty,
          sellProperty: state.sellProperty,
          updatePropertyValue: state.updatePropertyValue,
          updatePropertyIncome: state.updatePropertyIncome,
          updateAllPropertyValues: state.updateAllPropertyValues,
          updateAllPropertyIncome: state.updateAllPropertyIncome,
          updatePropertyValuesByType: state.updatePropertyValuesByType,
          updatePropertyIncomeByType: state.updatePropertyIncomeByType,
          addLifestyleItem: state.addLifestyleItem,
          removeLifestyleItem: state.removeLifestyleItem,
          setJob: state.setJob,
          promoteJob: state.promoteJob,
          quitJob: state.quitJob,
          improveSkill: state.improveSkill,
          allocateSkillPoint: state.allocateSkillPoint,
          awardSkillPoints: state.awardSkillPoints,
          spendEarnedSkillPoint: state.spendEarnedSkillPoint,
          calculateNetWorth: state.calculateNetWorth,
          processDailyUpdate: state.processDailyUpdate,
          weeklyUpdate: state.weeklyUpdate,
          monthlyUpdate: state.monthlyUpdate,
          saveState: state.saveState,
          resetCharacter: state.resetCharacter
        }));
        
        // Also clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
  })
);

// Load character
if (typeof window !== 'undefined') {
  // Initial load
  const savedCharacter = loadSavedCharacter();
  if (savedCharacter) {
    useCharacter.setState(savedCharacter);
  }
}

// Helper function to save the current state to localStorage
function saveState() {
  const state = useCharacter.getState();
  setLocalStorage(STORAGE_KEY, state);
}

export default useCharacter;