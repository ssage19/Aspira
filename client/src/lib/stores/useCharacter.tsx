import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage, formatCurrency } from "../utils";
import { toast } from "sonner";
import { useTime } from "./useTime";
import useAssetTracker from "./useAssetTracker";

// Expense rate constants
const EXPENSE_RATES = {
  HOUSING: {
    RENTAL: 1800,    // $1,800/mo for rental
    SHARED: 900,     // $900/mo for shared housing
    OWNED: 0,        // No expense for owned (handled via property mortgage)
    HOMELESS: 0      // No housing expense
  },
  TRANSPORTATION: {
    ECONOMY: 300,    // $300/mo for economy vehicle
    STANDARD: 450,   // $450/mo for standard vehicle
    LUXURY: 1000,    // $1,000/mo for luxury vehicle
    PREMIUM: 1500,   // $1,500/mo for premium vehicle
    BICYCLE: 50,     // $50/mo for bicycle maintenance and public transport
    NONE: 0          // No transportation expense
  },
  FOOD: 600          // $600/mo standard food expense
};

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
  type: "housing" | "transportation" | "hobbies" | "subscriptions" | "luxury" | "vehicles" | "vacations" | "experiences" | "wellness" | "social" | "habit" | "education";
  monthlyCost?: number;
  maintenanceCost?: number; // Some items use maintenanceCost instead of monthlyCost
  happiness?: number;
  prestige?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  imageUrl?: string;
  
  // Duration-based properties for vacations and experiences
  durationInDays?: number; // How many days the experience/vacation lasts
  endDate?: string; // The date when the lifestyle item expires (ISO string)
  
  // Additional attributes
  socialStatus?: number;
  healthImpact?: number;
  timeCommitment?: number;
  environmentalImpact?: number;
  stressReduction?: number;
  skillDevelopment?: number;
  specialBenefits?: string[];
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
  lifestyleItems: number; // Added to match implementation
  total: number;
  version?: number; // Version for tracking staleness
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
  
  // State synchronization helper
  lastUpdated?: number; // Timestamp to ensure state changes are noticed by all subscribers
  
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
  deductWealth: (amount: number) => void;
  addIncome: (amount: number) => void;
  addExpense: (amount: number) => void;
  
  // Expense calculations
  getHousingExpense: () => number;
  getTransportationExpense: () => number;
  getFoodExpense: () => number;
  getLifestyleExpense: () => number;
  getTotalMonthlyExpense: () => number;
  
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
  calculateNetWorthInternal: (wealth: number, assets: any[], properties: any[], lifestyleItems: any[]) => number;
  getNetWorthBreakdown: () => NetWorthBreakdown;
  syncAssetsWithAssetTracker: () => void;
  
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
// Get a fresh default character state always using current date/time
const getDefaultCharacter = () => {
  // Always get a fresh current timestamp
  const currentTimestamp = Date.now();
  
  return {
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
    
    // State synchronization helper - ALWAYS use fresh timestamp
    lastUpdated: currentTimestamp,
    
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
  };
};

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
          getHousingExpense: state.getHousingExpense,
          getTransportationExpense: state.getTransportationExpense,
          getFoodExpense: state.getFoodExpense,
          getLifestyleExpense: state.getLifestyleExpense,
          getTotalMonthlyExpense: state.getTotalMonthlyExpense,
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
          calculateNetWorthInternal: state.calculateNetWorthInternal,
          syncAssetsWithAssetTracker: state.syncAssetsWithAssetTracker,
          processDailyUpdate: state.processDailyUpdate,
          weeklyUpdate: state.weeklyUpdate,
          monthlyUpdate: state.monthlyUpdate,
          saveState: state.saveState,
          resetCharacter: state.resetCharacter
        }));
        
        // Sync the assets with AssetTracker store after character creation
        get().syncAssetsWithAssetTracker();
        
        saveState();
      },
      
      // Economy functions
      addWealth: (amount) => {
        // Ensure amount is a valid number
        const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          // Ensure wealth and netWorth are valid numbers
          const currentWealth = typeof state.wealth === 'number' && !isNaN(state.wealth) 
                              ? state.wealth : 0;
          const currentNetWorth = typeof state.netWorth === 'number' && !isNaN(state.netWorth) 
                                ? state.netWorth : 0;
                                
          return { 
            wealth: currentWealth + validAmount,
            netWorth: currentNetWorth + validAmount,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        console.log(`Adding ${validAmount} to wealth. New wealth: ${get().wealth}`);
        saveState();
      },
      
      deductWealth: (amount: number) => {
        // Ensure amount is a valid positive number
        const validAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0 ? amount : 0;
        
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          // Ensure wealth and netWorth are valid numbers
          const currentWealth = typeof state.wealth === 'number' && !isNaN(state.wealth) 
                              ? state.wealth : 0;
          const currentNetWorth = typeof state.netWorth === 'number' && !isNaN(state.netWorth) 
                                ? state.netWorth : 0;
          
          // Ensure we don't subtract more than the player has (fallback to current wealth)
          const amountToDeduct = Math.min(validAmount, currentWealth);
                                
          return { 
            wealth: currentWealth - amountToDeduct,
            netWorth: currentNetWorth - amountToDeduct,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        console.log(`Deducting ${validAmount} from wealth. New wealth: ${get().wealth}`);
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

      // Expense calculations
      getHousingExpense: () => {
        const state = get();
        if (state.housingType === 'rental') {
          return EXPENSE_RATES.HOUSING.RENTAL;
        } else if (state.housingType === 'shared') {
          return EXPENSE_RATES.HOUSING.SHARED;
        } else if (state.housingType === 'owned') {
          return EXPENSE_RATES.HOUSING.OWNED;
        } else {
          return EXPENSE_RATES.HOUSING.HOMELESS;
        }
      },
      
      getTransportationExpense: () => {
        const state = get();
        if (state.vehicleType === 'economy') {
          return EXPENSE_RATES.TRANSPORTATION.ECONOMY;
        } else if (state.vehicleType === 'standard') {
          return EXPENSE_RATES.TRANSPORTATION.STANDARD;
        } else if (state.vehicleType === 'luxury') {
          return EXPENSE_RATES.TRANSPORTATION.LUXURY;
        } else if (state.vehicleType === 'premium') {
          return EXPENSE_RATES.TRANSPORTATION.PREMIUM;
        } else if (state.vehicleType === 'bicycle') {
          return EXPENSE_RATES.TRANSPORTATION.BICYCLE;
        } else {
          return EXPENSE_RATES.TRANSPORTATION.NONE;
        }
      },
      
      getFoodExpense: () => {
        return EXPENSE_RATES.FOOD;
      },
      
      getLifestyleExpense: () => {
        const state = get();
        return state.lifestyleItems.reduce((total, item) => {
          const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
          return total + monthlyCost;
        }, 0);
      },
      
      getTotalMonthlyExpense: () => {
        const state = get();
        const housingExpense = state.getHousingExpense();
        const transportationExpense = state.getTransportationExpense();
        const foodExpense = state.getFoodExpense();
        const lifestyleExpense = state.getLifestyleExpense();
        
        return housingExpense + transportationExpense + foodExpense + lifestyleExpense;
      },
      
      // Attributes
      addHappiness: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newHappiness = Math.max(0, Math.min(100, state.happiness + amount));
          return { 
            happiness: newHappiness,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        saveState();
      },
      
      addStress: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newStress = Math.max(0, Math.min(100, state.stress + amount));
          return { 
            stress: newStress,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        saveState();
      },
      
      addHealth: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newHealth = Math.max(0, Math.min(100, state.health + amount));
          return { 
            health: newHealth,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        saveState();
      },
      
      addPrestige: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newPrestige = Math.max(0, Math.min(100, state.prestige + amount));
          return { 
            prestige: newPrestige,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        saveState();
      },
      
      updateSocialConnections: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newSocialConnections = Math.max(0, Math.min(100, state.socialConnections + amount));
          return { 
            socialConnections: newSocialConnections,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        saveState();
      },
      
      // Basic needs
      updateHunger: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newHunger = Math.max(0, Math.min(100, state.hunger + amount));
          // Include lastUpdated field to force subscribers to recognize changes
          return { 
            hunger: newHunger,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp 
          };
        });
        
        // Log a message that will help with debugging
        if (amount < 0) {
          console.log(`Auto-maintenance consumed food, new hunger: ${get().hunger}`);
        } else if (amount > 0) {
          console.log(`Food consumed, new hunger: ${get().hunger}`);
        }
        
        saveState();
      },
      
      updateThirst: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newThirst = Math.max(0, Math.min(100, state.thirst + amount));
          // Include lastUpdated field to force subscribers to recognize changes
          return { 
            thirst: newThirst,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp 
          };
        });
        
        // Log a message that will help with debugging
        if (amount < 0) {
          console.log(`Auto-maintenance consumed drink, new thirst: ${get().thirst}`);
        } else if (amount > 0) {
          console.log(`Drink consumed, new thirst: ${get().thirst}`);
        }
        
        saveState();
      },
      
      updateEnergy: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newEnergy = Math.max(0, Math.min(100, state.energy + amount));
          // Include lastUpdated field to force subscribers to recognize changes
          return { 
            energy: newEnergy,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp 
          };
        });
        
        // Log a message that will help with debugging
        if (amount < 0) {
          console.log(`Energy decreased, new energy: ${get().energy}`);
        } else if (amount > 0) {
          console.log(`Energy increased, new energy: ${get().energy}`);
        }
        
        saveState();
      },
      
      updateComfort: (amount) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          const newComfort = Math.max(0, Math.min(100, state.comfort + amount));
          // Include lastUpdated field to force subscribers to recognize changes
          return { 
            comfort: newComfort,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp 
          };
        });
        
        // Log a message that will help with debugging
        if (amount < 0) {
          console.log(`Comfort decreased, new comfort: ${get().comfort}`);
        } else if (amount > 0) {
          console.log(`Comfort increased, new comfort: ${get().comfort}`);
        }
        
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
          
          // Calculate months since purchase
          const purchaseDate = new Date(property.purchaseDate);
          const currentDate = new Date();
          // Ensure we get a positive value (handle cases where system clock might be wrong)
          let monthsSincePurchase = 
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
            (currentDate.getMonth() - purchaseDate.getMonth());
          
          // Ensure we never have negative months (could happen with system clock issues)
          monthsSincePurchase = Math.max(0, monthsSincePurchase);
          
          // Store original purchase price for reference
          const originalPurchasePrice = property.purchasePrice || property.currentValue; 
          
          // Store the original property value before any adjustments
          const originalPropertyValue = property.currentValue;
          console.log(`Original property value: ${originalPropertyValue}`);
          
          // Calculate outstanding loan balance
          const outstandingLoan = property.loanAmount || 0;
          console.log(`Outstanding loan: ${outstandingLoan}`);
          
          /*
           * MAJOR CHANGE: For properties that are flipped too quickly, we need to ensure
           * the player takes a loss compared to their initial investment. 
           * 
           * 1. For immediate flips, the sale value should be substantially reduced
           * 2. Additional transaction costs should apply to make quick-flipping unprofitable
           * 3. The player should lose money when selling very recent purchases
           */
          
          // Define our scaling factors for quick flips
          let quickFlipAdjustment = 1.0; // Default: no adjustment
          let transactionCostMultiplier = 1.0; // Default: standard transaction costs
          let additionalTransactionCosts = 0; // Additional flat costs
          
          if (monthsSincePurchase < 1) {
            // For very quick flips (< 1 month):
            // 1. Reduce property value by 15%
            // 2. Increase transaction costs by 50%
            // 3. Add flat costs to ensure it's never profitable
            quickFlipAdjustment = 0.85; // 15% reduction in property value
            transactionCostMultiplier = 1.5; // 50% more in closing costs
            
            // Add additional transaction costs that scale with property value
            // This ensures the player always loses some money on an immediate flip
            additionalTransactionCosts = originalPurchasePrice * 0.05; // Additional 5% transaction costs
            
            console.log(`Quick flip detected (< 1 month): Applying severe penalties`);
          } else if (monthsSincePurchase < 6) {
            // For moderately quick flips (1-6 months):
            // 1. Reduce property value by 8%
            // 2. Increase transaction costs by 25%
            quickFlipAdjustment = 0.92; // 8% reduction in property value
            transactionCostMultiplier = 1.25; // 25% more in closing costs
            
            // Add smaller additional transaction costs
            additionalTransactionCosts = originalPurchasePrice * 0.03; // Additional 3% transaction costs
            
            console.log(`Quick flip detected (1-6 months): Applying moderate penalties`);
          }
          
          // Calculate the adjusted market value after quick-flip adjustments
          const adjustedValue = Math.round(originalPropertyValue * quickFlipAdjustment);
          console.log(`Property value after quick-flip adjustment: ${adjustedValue} (was ${originalPropertyValue})`);
          property.currentValue = adjustedValue;
          
          // Calculate the quick flip fee (the value reduction)
          const quickFlipFee = originalPropertyValue - adjustedValue;
          console.log(`Quick flip fee (value reduction): ${quickFlipFee}`);
          
          // Calculate closing costs with the adjusted multiplier and after value reduction
          const closingCosts = (property.currentValue * closingCostPercentage * transactionCostMultiplier) + additionalTransactionCosts;
          console.log(`Closing costs: ${closingCosts} (includes additional transaction costs of ${additionalTransactionCosts})`);
          
          // Calculate early payoff penalty if applicable (usually 2-3% if within first few years)
          let earlyPayoffPenalty = 0;
          if (monthsSincePurchase < 36) { // Less than 3 years
            earlyPayoffPenalty = outstandingLoan * 0.02; // 2% of remaining loan
            console.log(`Early payoff penalty: ${earlyPayoffPenalty}`);
          }
          
          // Calculate net proceeds from sale
          const grossSalePrice = property.currentValue;
          
          // Calculate net proceeds properly deducting all costs
          saleValue = grossSalePrice - closingCosts - outstandingLoan - earlyPayoffPenalty;
          
          console.log(`Detailed sale calculation:`);
          console.log(`Gross sale price (after quick flip adjustment): ${grossSalePrice}`);
          console.log(`Minus closing costs: ${closingCosts}`);
          console.log(`Minus outstanding loan: ${outstandingLoan}`);
          console.log(`Minus early payoff penalty: ${earlyPayoffPenalty}`);
          console.log(`Equals net proceeds: ${saleValue}`);
          
          // Compare with initial investment (down payment)
          const downPayment = originalPurchasePrice - outstandingLoan;
          const profitOrLoss = saleValue - downPayment;
          console.log(`Initial down payment: ${downPayment}`);
          console.log(`Profit/Loss on investment: ${profitOrLoss}`);
          
          // If the property is underwater (worth less than what's owed + costs),
          // the player still needs to pay the difference to close the sale
          if (saleValue < 0) {
            // Cap the loss at the player's available wealth if they can't cover it all
            const maxLoss = Math.min(Math.abs(saleValue), state.wealth);
            
            // Display a message to the user about the underwater property
            toast.error(`This property is underwater - you paid ${formatCurrency(maxLoss)} to close the sale`, {
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
            
            // For quick flips, provide detailed breakdown to the player
            if (quickFlipAdjustment < 1.0) {
              // Make sure we don't show negative months (can happen if the system clock is off)
              const displayMonths = Math.max(0, monthsSincePurchase);
              
              // Compare against original values
              toast.info(`Original value: ${formatCurrency(originalPropertyValue)}, Sale value after ${displayMonths}-month quick flip: ${formatCurrency(property.currentValue)}`, {
                duration: 5000,
                position: 'bottom-right',
              });
              
              // Show breakdown of transaction costs
              toast.info(`Quick flip fees: ${formatCurrency(quickFlipFee)} value reduction + ${formatCurrency(additionalTransactionCosts)} extra transaction costs`, {
                duration: 5000,
                position: 'bottom-right',
              });
              
              // Show the profit/loss information
              if (profitOrLoss < 0) {
                toast.error(`You lost ${formatCurrency(Math.abs(profitOrLoss))} on this investment due to quick-flip penalties`, {
                  duration: 5000,
                  position: 'bottom-right',
                });
              } else {
                toast.info(`Net proceeds: ${formatCurrency(saleValue)}`, {
                  duration: 5000,
                  position: 'bottom-right',
                });
              }
            } else {
              // Normal sale without quick-flip penalties
              toast.info(`Property sold for ${formatCurrency(grossSalePrice)} with net proceeds of ${formatCurrency(saleValue)}`, {
                duration: 5000,
                position: 'bottom-right',
              });
            }
            
            // Log detailed sale calculation
            console.log(`Final sale proceeds: ${saleValue}`);
            
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
        // Use maintenanceCost for monthly expenses, defaulting to 0 if not provided
        const monthlyCost = item.maintenanceCost || 0;
        
        // Get current game date instead of actual time for consistent durations
        const { currentGameDate } = useTime.getState();
        const purchaseDate = currentGameDate.toISOString();
        
        // Calculate end date for vacations and experiences if they have duration
        let endDate: string | undefined;
        
        if ((item.type === 'vacations' || item.type === 'experiences') && item.durationInDays) {
          // Create a new date object for the end date by adding durationInDays to the game date
          const endDateTime = new Date(currentGameDate);
          endDateTime.setDate(endDateTime.getDate() + item.durationInDays);
          endDate = endDateTime.toISOString();
          
          console.log(`Adding ${item.name} with duration of ${item.durationInDays} days. Will expire on ${endDate}`);
        }
        
        set((state) => ({
          lifestyleItems: [...state.lifestyleItems, {
            ...item,
            // Ensure we have a monthlyCost property for expense calculations
            monthlyCost: monthlyCost,
            // Add purchase date for all items
            purchaseDate: purchaseDate,
            // Add end date for duration-based items
            endDate: endDate
          }],
          // Add to expenses using the correct monthly cost
          expenses: state.expenses + monthlyCost,
          // No longer deducting wealth here since it's already handled in Lifestyle.tsx
          happiness: Math.min(100, state.happiness + (item.happiness || 0)),
          prestige: Math.min(100, state.prestige + (item.prestige || 0))
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
          
          // Use monthlyCost if available, otherwise use maintenanceCost
          const monthlyCost = item.monthlyCost || item.maintenanceCost || 0;
          
          return {
            lifestyleItems: state.lifestyleItems.filter(i => i.id !== itemId),
            expenses: state.expenses - monthlyCost,
            happiness: Math.max(0, state.happiness - (item.happiness || 0) / 2), // Reduce some happiness, but not all
            prestige: Math.max(0, state.prestige - (item.prestige || 0) / 2) // Reduce some prestige, but not all
          };
        });
        
        // Recalculate net worth after removing the item
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        
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
      
      // Internal function to calculate net worth from provided values
      // This can be used by both calculateNetWorth and resetCharacter
      calculateNetWorthInternal: (
        wealth: number, 
        assets: any[], 
        properties: any[], 
        lifestyleItems: any[]
      ) => {
        // Start with cash (liquid assets)
        let netWorth = wealth;
        
        // Add investment assets
        if (assets && assets.length > 0) {
          for (const asset of assets) {
            const assetValue = asset.currentPrice * asset.quantity;
            netWorth += assetValue;
          }
        }
        
        // Add property values and subtract outstanding loans
        if (properties && properties.length > 0) {
          for (const property of properties) {
            // Get current property value
            const propertyValue = property.currentValue;
            
            // Get outstanding loan amount
            const loanAmount = property.loanAmount || 0;
            
            // Property equity is value minus debt
            const equity = propertyValue - loanAmount;
            
            // Add equity to net worth (value minus debt)
            netWorth += equity;
          }
        }
        
        // Add lifestyle item values to net worth
        if (lifestyleItems && lifestyleItems.length > 0) {
          for (const item of lifestyleItems) {
            // Skip vacations and experiences as they're temporary and shouldn't contribute to net worth
            if (item.type === 'vacations' || item.type === 'experiences') {
              continue; // Skip this item
            }
            
            // For permanent lifestyle items, use purchase price with depreciation 
            // or a fixed value based on their monthly cost
            const purchasePrice = item.purchasePrice || 0;
            let itemValue = 0;
            
            if (purchasePrice > 0) {
              // For reset case we don't need to calculate depreciation
              itemValue = purchasePrice * 0.8; // Assume 20% initial depreciation
            } else {
              // If no purchase price, estimate value based on monthly cost or maintenanceCost
              const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
              itemValue = monthlyCost * 3; // Value as 3 months of payments
            }
            
            netWorth += itemValue;
          }
        }
        
        return netWorth;
      },
      
      // Calculate net worth
      calculateNetWorth: () => {
        const state = get();
        const BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';
        
        // Check for reset conditions first
        const resetInProgress = typeof window !== 'undefined' && 
                               window.sessionStorage && 
                               window.sessionStorage.getItem('game_reset_in_progress') === 'true';
                               
        const gameResetCompleted = typeof window !== 'undefined' && 
                                  window.sessionStorage && 
                                  window.sessionStorage.getItem('game_reset_completed') === 'true';
        
        const characterResetCompleted = typeof window !== 'undefined' && 
                                     window.sessionStorage && 
                                     window.sessionStorage.getItem('character_reset_completed') === 'true';
        
        // If we're in the middle of a reset, just return a simple calculation
        if (resetInProgress || gameResetCompleted || characterResetCompleted) {
          console.log('NetWorth calculation: Reset condition detected, using simplified calculation');
          
          // Create a basic breakdown with just cash and version info
          const resetBreakdown = {
            cash: state.wealth,
            stocks: 0,
            crypto: 0,
            bonds: 0,
            otherInvestments: 0,
            propertyEquity: 0,
            propertyValue: 0,
            propertyDebt: 0,
            lifestyleItems: 0,
            total: state.wealth,
            version: Date.now() // Add a version timestamp
          };
          
          // Store this basic breakdown in the state object
          (state as any).netWorthBreakdown = resetBreakdown;
          
          // Also explicitly store in localStorage for direct access by components
          try {
            if (typeof window !== 'undefined') {
              // First remove any old data
              localStorage.removeItem(BREAKDOWN_STORAGE_KEY);
              
              // Then store the fresh reset data
              localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(resetBreakdown));
              console.log(`Stored reset breakdown to localStorage:`, resetBreakdown);
            }
          } catch (e) {
            console.error('Error saving breakdown to localStorage:', e);
          }
          
          // Log the reset process for debugging
          console.log(`NetWorth calculation (RESET): Using wealth value of ${state.wealth} for net worth`);
          
          // Clear any reset flags that might interfere with future calculations
          if (typeof window !== 'undefined' && window.sessionStorage) {
            if (characterResetCompleted) {
              sessionStorage.removeItem('character_reset_completed');
              console.log('Cleared character_reset_completed flag');
            }
          }
          
          return state.wealth;
        }
        
        // Normal calculation path for non-reset situations
        
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
          lifestyleItems: 0, // Add lifestyle items to the breakdown
          total: 0,
          version: Date.now() // Add version timestamp
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
        
        // Add lifestyle item values to net worth
        // These should be considered depreciating assets but still have some value
        state.lifestyleItems.forEach(item => {
          // Skip vacations and experiences as they're temporary and shouldn't contribute to net worth
          if (item.type === 'vacations' || item.type === 'experiences') {
            return; // Skip this item
          }
          
          // For permanent lifestyle items, use purchase price with depreciation 
          // or a fixed value based on their monthly cost
          const purchasePrice = item.purchasePrice || 0;
          let itemValue = 0;
          
          if (purchasePrice > 0) {
            // Calculate time since purchase to apply depreciation
            const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : new Date();
            // Use game time for consistent depreciation
            const currentDate = useTime.getState().currentGameDate;
            const monthsSincePurchase = Math.max(0, 
              (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
              (currentDate.getMonth() - purchaseDate.getMonth())
            );
            
            // Apply depreciation based on months owned
            // Lifestyle items lose value over time but retain some residual value
            const depreciation = Math.min(0.75, monthsSincePurchase * 0.05); // Max 75% depreciation
            itemValue = purchasePrice * (1 - depreciation);
          } else {
            // If no purchase price, estimate value based on monthly cost or maintenanceCost
            // This is for subscriptions and other recurring items
            const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
            itemValue = monthlyCost * 3; // Value as 3 months of payments
          }
          
          breakdown.lifestyleItems += itemValue;
          netWorth += itemValue;
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
        console.log(`Lifestyle Items: ${breakdown.lifestyleItems} (${((breakdown.lifestyleItems / breakdown.total) * 100).toFixed(2)}%)`);
        console.log(`Property value: ${breakdown.propertyValue}`);
        console.log(`Property debt: ${breakdown.propertyDebt}`);
        console.log(`Total net worth: ${breakdown.total}`);
        
        // Store the breakdown for UI access
        // We don't use set() here to avoid triggering a loop
        // Instead, we'll make this accessible via a getter
        (state as any).netWorthBreakdown = breakdown;
        
        // Also save to localStorage for direct access by components
        try {
          if (typeof window !== 'undefined') {
            const BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';
            localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(breakdown));
            console.log(`Saved breakdown to localStorage:`, breakdown);
          }
        } catch (e) {
          console.error('Error saving breakdown to localStorage:', e);
        }
        
        return netWorth;
      },
      
      // Getter for the net worth breakdown
      getNetWorthBreakdown: () => {
        const state = get();
        const BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';
        
        // First, check for reset conditions that would indicate we should return empty data
        // We use sessionStorage to check global app state
        const resetInProgress = typeof window !== 'undefined' && 
                               window.sessionStorage && 
                               window.sessionStorage.getItem('game_reset_in_progress') === 'true';
        
        const forceCurrentDate = typeof window !== 'undefined' && 
                                window.sessionStorage && 
                                window.sessionStorage.getItem('force_current_date') === 'true';
                                
        const gameResetCompleted = typeof window !== 'undefined' && 
                                  window.sessionStorage && 
                                  window.sessionStorage.getItem('game_reset_completed') === 'true';
                                  
        const characterResetCompleted = typeof window !== 'undefined' && 
                                     window.sessionStorage && 
                                     window.sessionStorage.getItem('character_reset_completed') === 'true';
        
        // If any reset conditions are active, return a safe default
        if (resetInProgress || forceCurrentDate || gameResetCompleted || characterResetCompleted) {
          console.log('Character store: Reset condition detected, returning default breakdown');
          
          // Clean up any stale data
          
          // 1. Clear in-memory breakdown
          if ((state as any).netWorthBreakdown) {
            console.log('Character store: Explicitly nullifying cached breakdown due to reset');
            (state as any).netWorthBreakdown = null;
          }
          
          // 2. Clear localStorage breakdown
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(BREAKDOWN_STORAGE_KEY);
              console.log(`Removed breakdown from localStorage at key: ${BREAKDOWN_STORAGE_KEY}`);
            }
          } catch (e) {
            console.error('Error removing breakdown from localStorage:', e);
          }
          
          // 3. Create a fresh breakdown with version information
          const defaultBreakdown = {
            cash: state.wealth,
            stocks: 0,
            crypto: 0,
            bonds: 0,
            otherInvestments: 0,
            propertyEquity: 0,
            propertyValue: 0,
            propertyDebt: 0,
            lifestyleItems: 0,
            total: state.wealth,
            version: Date.now() // Add version timestamp
          };
          
          // 4. Store the fresh breakdown both in state and localStorage
          (state as any).netWorthBreakdown = defaultBreakdown;
          
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(defaultBreakdown));
              console.log(`Stored fresh reset breakdown to localStorage:`, defaultBreakdown);
            }
          } catch (e) {
            console.error('Error storing reset breakdown to localStorage:', e);
          }
          
          return defaultBreakdown;
        }
        
        // We're not in a reset state, so let's ensure our assets are properly synced with the AssetTracker
        get().syncAssetsWithAssetTracker();
        
        // Check localStorage first for a cached breakdown
        let storedBreakdown = null;
        if (typeof window !== 'undefined') {
          try {
            const storedData = localStorage.getItem(BREAKDOWN_STORAGE_KEY);
            if (storedData) {
              storedBreakdown = JSON.parse(storedData);
              console.log(`Retrieved breakdown from localStorage:`, storedBreakdown);
            }
          } catch (e) {
            console.error('Error reading breakdown from localStorage:', e);
          }
        }
        
        // Check if in-memory breakdown exists and is valid
        let memoryBreakdown = (state as any).netWorthBreakdown;
        
        // If we have both stored and memory breakdowns, use the newer one based on version
        if (storedBreakdown && memoryBreakdown) {
          const storedVersion = storedBreakdown.version || 0;
          const memoryVersion = memoryBreakdown.version || 0;
          
          // Use the newest breakdown based on version
          if (storedVersion > memoryVersion) {
            console.log('Using localStorage breakdown (newer version)');
            memoryBreakdown = storedBreakdown;
            (state as any).netWorthBreakdown = storedBreakdown;
          }
        } else if (storedBreakdown && !memoryBreakdown) {
          // If we only have stored breakdown, use that
          console.log('Using localStorage breakdown (no in-memory breakdown)');
          memoryBreakdown = storedBreakdown;
          (state as any).netWorthBreakdown = storedBreakdown;
        }
        
        // Check if the breakdown is valid and has up-to-date cash value
        if (memoryBreakdown && 
            typeof memoryBreakdown === 'object' &&
            'total' in memoryBreakdown) {
            
          // Check if cash value is out of sync with current wealth
          if (Math.abs(memoryBreakdown.cash - state.wealth) > 0.01) {
            console.log('Character store: Cash value in breakdown out of sync, forcing recalculation');
            // Force recalculation to ensure fresh data
            state.calculateNetWorth();
            
            // Get the fresh breakdown
            memoryBreakdown = (state as any).netWorthBreakdown;
          }
        } else {
          // No valid breakdown found, force calculation
          console.log('Character store: No valid breakdown found, forcing calculation');
          state.calculateNetWorth();
          
          // Get the fresh breakdown
          memoryBreakdown = (state as any).netWorthBreakdown;
        }
        
        // Return our best breakdown or a safe default
        if (memoryBreakdown && typeof memoryBreakdown === 'object' && 'total' in memoryBreakdown) {
          return memoryBreakdown;
        }
        
        // Final fallback if all else fails
        return {
          cash: state.wealth,
          stocks: 0,
          crypto: 0,
          bonds: 0,
          otherInvestments: 0,
          propertyEquity: 0,
          propertyValue: 0,
          propertyDebt: 0,
          lifestyleItems: 0,
          total: state.wealth,
          version: Date.now()
        };
      },
      
      // Helper function to sync all assets with the AssetTracker store
      // This ensures that the assets in the Character store are properly
      // reflected in the AssetTracker, which is used by other components
      syncAssetsWithAssetTracker: () => {
        console.log("Syncing assets with AssetTracker...");
        const state = get();
        const assetTracker = useAssetTracker.getState();
        
        // First, update cash
        assetTracker.updateCash(state.wealth);
        
        // Then, sync all stocks
        const stockAssets = state.assets.filter(asset => asset.type === 'stock');
        stockAssets.forEach(stock => {
          assetTracker.updateStock(stock.id, stock.quantity, stock.currentPrice);
        });
        
        // Sync crypto assets
        const cryptoAssets = state.assets.filter(asset => asset.type === 'crypto');
        cryptoAssets.forEach(crypto => {
          assetTracker.updateCrypto(crypto.id, crypto.quantity, crypto.currentPrice);
        });
        
        // Sync bonds
        const bondAssets = state.assets.filter(asset => asset.type === 'bond');
        bondAssets.forEach(bond => {
          assetTracker.updateBond(bond.id, bond.quantity, bond.currentPrice);
        });
        
        // Sync other investment assets
        const otherAssets = state.assets.filter(asset => asset.type === 'other');
        otherAssets.forEach(other => {
          assetTracker.updateOtherInvestment(other.id, other.currentPrice * other.quantity);
        });
        
        // Sync properties
        state.properties.forEach(property => {
          assetTracker.updateProperty(
            property.id, 
            property.currentValue, 
            property.loanAmount
          );
        });
        
        // Sync lifestyle items
        state.lifestyleItems.forEach(item => {
          // Calculate item value based on purchase price or monthly cost
          let itemValue = 0;
          
          if (item.purchasePrice) {
            // Skip vacations and experiences (they're temporary)
            if (item.type === 'vacations' || item.type === 'experiences') {
              return;
            }
            
            // For permanent items, use purchase price with simple depreciation
            const purchasePrice = item.purchasePrice;
            const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : new Date();
            const currentDate = useTime.getState().currentGameDate;
            const monthsSincePurchase = Math.max(0, 
              (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
              (currentDate.getMonth() - purchaseDate.getMonth())
            );
            
            // Apply depreciation (max 75%)
            const depreciation = Math.min(0.75, monthsSincePurchase * 0.05);
            itemValue = purchasePrice * (1 - depreciation);
          } else if (item.monthlyCost || item.maintenanceCost) {
            // For recurring cost items
            const monthlyCost = item.monthlyCost || item.maintenanceCost || 0;
            itemValue = monthlyCost * 3; // Value as 3 months of payments
          }
          
          assetTracker.updateLifestyleItem(item.id, itemValue);
        });
        
        // Force a recalculation of totals in the asset tracker
        assetTracker.recalculateTotals();
        console.log("Asset sync complete");
      },
      
      // Daily/weekly/monthly updates
      processDailyUpdate: () => {
        set((state) => {
          // Update days since promotion if employed
          let daysSincePromotion = state.daysSincePromotion;
          let dailyIncome = 0;
          
          // Get the dayCounter from useTime
          const { dayCounter, currentGameDate } = useTime.getState();
          
          // Check for expired lifestyle items (vacations and experiences that have ended)
          // Use the game time instead of actual time for consistent expiration
          const expiredItems: LifestyleItem[] = [];
          
          state.lifestyleItems.forEach(item => {
            if (item.endDate && (item.type === 'vacations' || item.type === 'experiences')) {
              const endDate = new Date(item.endDate);
              if (currentGameDate > endDate) {
                // This item has expired
                expiredItems.push(item);
              }
            }
          });
          
          // Remove expired items
          if (expiredItems.length > 0) {
            expiredItems.forEach(item => {
              console.log(`${item.name} has expired and will be removed.`);
              
              // Show toast notification for each expired item
              toast(`Your ${item.name} has ended.`, {
                duration: 5000,
                position: 'bottom-right',
                icon: '⏱️'
              });
              
              // Reverse the effects of the expired item on character attributes
              // Decrease happiness and prestige if they were boosted by this item
              if (item.happiness) {
                state.happiness = Math.max(0, state.happiness - item.happiness);
              }
              
              if (item.prestige) {
                state.prestige = Math.max(0, state.prestige - item.prestige);
              }
              
              // Reverse other effects
              if (item.socialStatus) {
                state.socialConnections = Math.max(0, state.socialConnections - item.socialStatus);
              }
              
              if (item.healthImpact) {
                state.health = Math.max(0, Math.min(100, state.health - item.healthImpact));
              }
              
              if (item.stressReduction) {
                state.stress = Math.min(100, state.stress + item.stressReduction);
              }
              
              if (item.environmentalImpact) {
                state.environmentalImpact = Math.max(0, Math.min(100, state.environmentalImpact - item.environmentalImpact));
              }
              
              // Remove any monthly costs from expenses
              const monthlyCost = item.monthlyCost || item.maintenanceCost || 0;
              state.expenses = Math.max(0, state.expenses - monthlyCost);
            });
            
            // Filter out the expired items from lifestyleItems
            const filteredItems = state.lifestyleItems.filter(item => 
              !expiredItems.some(expiredItem => expiredItem.id === item.id)
            );
            
            // Update the state with the filtered items
            state.lifestyleItems = filteredItems;
          }
          
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
            // Use monthlyCost if available, otherwise calculate from maintenanceCost
            const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
            return total + (monthlyCost / 30); // Daily expense
          }, 0);
          
          // Apply income and expenses
          const netDailyChange = dailyIncome + dailyPropertyIncome - dailyLifestyleExpenses;
          
          // Basic needs changes (hunger, thirst, energy decrease over time)
          // Slow down the decay rate even further to ensure auto-maintenance can keep up
          let hunger = Math.max(0, state.hunger - 2); // Further slowed down decay (was 3)
          let thirst = Math.max(0, state.thirst - 2.5); // Further slowed down decay (was 4)
          let energy = Math.max(0, state.energy - 1.5); // Further slowed down decay (was 2)
          
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
        const state = get();
        
        // Use our centralized expense calculation methods
        const housingExpense = state.getHousingExpense();
        const transportationExpense = state.getTransportationExpense();
        const foodExpense = state.getFoodExpense();
        const lifestyleExpenses = state.getLifestyleExpense();
        
        // Calculate total monthly expenses
        const totalMonthlyExpenses = state.getTotalMonthlyExpense();
        
        // Apply the monthly expenses if we have any
        if (totalMonthlyExpenses > 0) {
          const oldWealth = state.wealth;
          
          // Deduct expenses using our method to ensure proper state updates
          get().deductWealth(totalMonthlyExpenses);
          
          // Log the expense transaction with clear indication (but no toast)
          console.log(`MONTHLY EXPENSE DEDUCTION: ${formatCurrency(totalMonthlyExpenses)} has been deducted from your wealth.`);
          console.log(`Previous wealth: ${formatCurrency(oldWealth)}, new wealth: ${formatCurrency(state.wealth - totalMonthlyExpenses)}`);
          console.log(`Breakdown - Housing: ${formatCurrency(housingExpense)}, Transportation: ${formatCurrency(transportationExpense)}, Food: ${formatCurrency(foodExpense)}, Lifestyle: ${formatCurrency(lifestyleExpenses)}`);
          
          // Removed toast notification as it's now shown in the combined monthly summary
        }
        
        set((state) => {
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
        // Start with explicit cleanup of any existing portfolio data
        try {
          console.log("Starting character reset with NetWorthBreakdown cleanup");
          
          // 1. First clear the specific localStorage entry for portfolio
          const BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';
          if (typeof window !== 'undefined') {
            localStorage.removeItem(BREAKDOWN_STORAGE_KEY);
            console.log(`Removed breakdown storage at key: ${BREAKDOWN_STORAGE_KEY}`);
            
            // Also set a flag in sessionStorage to indicate character reset is in progress
            sessionStorage.setItem('character_reset_completed', 'true');
            console.log("Set character_reset_completed flag in sessionStorage");
          }
          
          // 2. Clear any in-memory breakdown data
          const state = get();
          if ((state as any).netWorthBreakdown) {
            console.log("Nullifying existing netWorthBreakdown in memory");
            (state as any).netWorthBreakdown = null;
          }
          
          // 3. Explicitly clear investment arrays
          if (state.assets && state.assets.length > 0) {
            console.log(`Resetting ${state.assets.length} assets to empty array`);
          }
          
          if (state.properties && state.properties.length > 0) {
            console.log(`Resetting ${state.properties.length} properties to empty array`);
          }
          
          if (state.lifestyleItems && state.lifestyleItems.length > 0) {
            console.log(`Resetting ${state.lifestyleItems.length} lifestyle items to empty array`);
          }
        } catch (e) {
          console.error("Error during pre-reset cleanup:", e);
        }
        
        // Get a completely fresh default character with the current timestamp
        const defaultCharacter = getDefaultCharacter();
        
        console.log("Resetting character with fresh timestamp:", defaultCharacter.lastUpdated);
        
        // Apply the default character but preserve all the functions
        set((state) => {
          // Create a new state with default values but preserved functions
          const newState = {
            ...defaultCharacter,
            // Keep the functions from the current state
            setName: state.setName,
            createNewCharacter: state.createNewCharacter,
            addWealth: state.addWealth,
            addIncome: state.addIncome,
            getHousingExpense: state.getHousingExpense,
            getTransportationExpense: state.getTransportationExpense,
            getFoodExpense: state.getFoodExpense,
            getLifestyleExpense: state.getLifestyleExpense,
            getTotalMonthlyExpense: state.getTotalMonthlyExpense,
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
            calculateNetWorthInternal: state.calculateNetWorthInternal,
            getNetWorthBreakdown: state.getNetWorthBreakdown,
            syncAssetsWithAssetTracker: state.syncAssetsWithAssetTracker,
            processDailyUpdate: state.processDailyUpdate,
            weeklyUpdate: state.weeklyUpdate,
            monthlyUpdate: state.monthlyUpdate,
            saveState: state.saveState,
            resetCharacter: state.resetCharacter
          };

          // Net worth for a fresh character should simply equal the initial wealth
          // No need for complex calculation since all assets are zeroed out
          newState.netWorth = defaultCharacter.wealth;
          
          // Create a clean breakdown object that perfectly matches the initial state
          const cleanBreakdown = {
            cash: defaultCharacter.wealth,
            stocks: 0,
            crypto: 0,
            bonds: 0,
            otherInvestments: 0,
            propertyEquity: 0,
            propertyValue: 0,
            propertyDebt: 0,
            lifestyleItems: 0,
            total: defaultCharacter.wealth
          };
          
          // Set the breakdown directly in the new state
          (newState as any).netWorthBreakdown = cleanBreakdown;
          
          // Add a reset timestamp to help with validation
          (newState as any)._netWorthResetTime = Date.now();
          
          console.log("Character reset with fresh netWorthBreakdown:", cleanBreakdown);
          
          return newState;
        });
        
        // Also clear character data from localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_KEY);
            console.log(`Removed character data at key: ${STORAGE_KEY}`);
            
            // Also explicitly remove breakdown again to be super sure
            localStorage.removeItem('business-empire-networth-breakdown');
          } catch (e) {
            console.error("Error clearing localStorage during character reset:", e);
          }
        }
        
        // Set a session flag to indicate reset was completed
        // This helps components know they need to refresh their data
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('character_reset_completed', 'true');
          sessionStorage.setItem('character_reset_timestamp', Date.now().toString());
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
  // Get the current state
  const state = useCharacter.getState();
  
  // Always update the lastUpdated timestamp to ensure synchronization
  const currentTimestamp = Date.now();
  
  // Set the lastUpdated timestamp directly
  useCharacter.setState({ lastUpdated: currentTimestamp });
  
  // Get the updated state with the new timestamp
  const updatedState = useCharacter.getState();
  
  // Save to localStorage
  setLocalStorage(STORAGE_KEY, updatedState);
}

export default useCharacter;