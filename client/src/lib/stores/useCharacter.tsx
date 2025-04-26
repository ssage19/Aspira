import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage, formatCurrency } from "../utils";
import { toast } from "sonner";
import { registerStore, getStore } from "../utils/storeRegistry";
import useAssetTracker from "./useAssetTracker";
import { startupInvestments } from "../data/investments";
import { useChallenges } from "./useChallenges";

// Expense rate constants
const EXPENSE_RATES = {
  HOUSING: {
    RENTAL: 2000,    // $2,000/mo for rental housing
    SHARED: 800,     // $800/mo for shared housing
    OWNED: 3500,     // $3,500/mo for owned home (mortgage payments)
    HOMELESS: 0,     // No housing expense for homeless
    LUXURY: 8000     // $8,000/mo for luxury housing
  },
  TRANSPORTATION: {
    ECONOMY: 350,    // $350/mo for economy car
    STANDARD: 500,   // $500/mo for standard car
    LUXURY: 1200,    // $1,200/mo for luxury car
    PREMIUM: 2500,   // $2,500/mo for premium car
    BICYCLE: 30,     // $30/mo for bicycle maintenance
    NONE: 150        // $150/mo for no vehicle (public transportation)
  },
  FOOD: 600          // $600/mo standard food expense
};

export interface CharacterSkills {
  intelligence: number;
  creativity: number;
  charisma: number;
  technical: number;
  leadership: number;
  physical: number;
  // New skill types can be added here
}

export interface Asset {
  id: string;
  name: string;
  type: "stock" | "bond" | "crypto" | "other";
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  purchaseDate: string;
  
  // Additional properties for different asset types
  // Bond properties
  maturityValue?: number;      // For bonds
  maturityDate?: string | Date;  // For bonds
  term?: number;               // For bonds - term in years
  yieldRate?: number;          // For bonds - interest rate
  
  // Startup investment properties
  otherType?: string;          // For categorizing other investments
  successChance?: number;      // For startup investments
  potentialReturnMultiple?: number; // For startup investments
  round?: string;              // For startup investments - funding round
  industry?: string;           // For startup investments - industry sector
  
  // Time-based maturity for startups
  maturityTimeInDays?: number; // Days until startup outcome is determined
  maturityDay?: number;        // The game day when maturity will be reached
  outcomeMessage?: string;     // Message describing the outcome (success/failure)
  outcomeProcessed?: boolean;  // Whether the outcome has been processed
  wasSuccessful?: boolean;     // Whether the investment was successful
  
  // General tracking
  active?: boolean;            // Whether the asset is still active or has been processed
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
  equity?: number;          // Current equity in the property (currentValue - loanAmount)
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
  category?: string; // Added for compatibility with AssetTracker
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
  currentDay?: number; // Current day of the month (1-31) for monthly calculations
  
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
  
  // Avatar customization
  avatarUrl: string | null;
  
  // Custom avatar properties
  avatarSkinTone?: string;
  avatarBodyType?: 'slim' | 'average' | 'athletic';
  avatarHeight?: number;
  avatarEyeColor?: string;
  selectedAccessories?: Record<string, string>; // type -> accessoryId
  
  // Transportation & Housing
  hasVehicle: boolean;
  vehicleType: 'none' | 'bicycle' | 'economy' | 'standard' | 'luxury' | 'premium';
  housingType: 'homeless' | 'shared' | 'rental' | 'owned' | 'luxury';
  
  // Time management
  freeTime: number;
  timeCommitment: number;
  
  // Skills (0-1000)
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
  
  // Time management
  addTimeCommitment: (hours: number) => void;
  reduceTimeCommitment: (hours: number) => void;
  updateFreeTime: (hours: number) => void;
  
  // Avatar customization
  updateAvatarUrl: (url: string | null) => void;
  updateAvatarSkinTone: (skinTone: string) => void;
  updateAvatarBodyType: (bodyType: 'slim' | 'average' | 'athletic') => void;
  updateAvatarHeight: (height: number) => void;
  updateAvatarEyeColor: (eyeColor: string) => void;
  selectAccessory: (type: string, accessoryId: string) => void;
  removeAccessory: (type: string) => void;
  
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
  decreaseSkillPoint: (skill: keyof CharacterSkills) => boolean;
  awardSkillPoints: (amount: number) => void;
  spendEarnedSkillPoint: (skill: keyof CharacterSkills) => boolean;
  
  // Net worth calculation
  calculateNetWorth: () => number;
  calculateNetWorthInternal: (wealth: number, assets: any[], properties: any[], lifestyleItems: any[]) => number;
  getNetWorthBreakdown: () => NetWorthBreakdown;
  syncAssetsWithAssetTracker: (updateMarketPrices?: boolean) => void;
  
  // Asset price syncing - behind the scenes
  syncPricesFromAssetTracker: () => void;
  
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
    currentDay: 1, // Start on day 1
    
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
    
    // Avatar customization
    avatarUrl: null as string | null, // Ready Player Me avatar URL
    
    // Custom avatar properties
    avatarSkinTone: '#F5D0A9', // Default skin tone
    avatarBodyType: 'average' as const,
    avatarHeight: 0.5,
    avatarEyeColor: '#6B8E23', // Default eye color
    selectedAccessories: {
      'body': 'body-default',
      'hair': 'hair-short',
      'outfit': 'outfit-casual'
    } as Record<string, string>, // Default accessories
    
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
    leadership: 30,
    physical: 30
  },
  
  // Skill points available to allocate during character creation
  skillPoints: 100,
  
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
          decreaseSkillPoint: state.decreaseSkillPoint,
          awardSkillPoints: state.awardSkillPoints,
          spendEarnedSkillPoint: state.spendEarnedSkillPoint,
          calculateNetWorth: state.calculateNetWorth,
          calculateNetWorthInternal: state.calculateNetWorthInternal,
          syncAssetsWithAssetTracker: state.syncAssetsWithAssetTracker,
          processDailyUpdate: state.processDailyUpdate,
          weeklyUpdate: state.weeklyUpdate,
          monthlyUpdate: state.monthlyUpdate,
          saveState: state.saveState,
          resetCharacter: state.resetCharacter,
          // Avatar customization
          updateAvatarUrl: state.updateAvatarUrl
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
          
          // Convert to truncated decimal to avoid floating-point precision issues
          const newWealth = parseFloat((currentWealth + validAmount).toFixed(1));
          const newNetWorth = parseFloat((currentNetWorth + validAmount).toFixed(1));
                                
          return { 
            wealth: newWealth,
            netWorth: newNetWorth,
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
        
        // Early return if nothing to deduct
        if (validAmount <= 0) {
          console.log("No valid amount to deduct");
          return;
        }
        
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        // Log the starting wealth for debugging
        const startingWealth = get().wealth;
        
        set((state) => {
          // Ensure wealth and netWorth are valid numbers
          const currentWealth = typeof state.wealth === 'number' && !isNaN(state.wealth) 
                              ? state.wealth : 0;
          const currentNetWorth = typeof state.netWorth === 'number' && !isNaN(state.netWorth) 
                                ? state.netWorth : 0;
          
          // Ensure we don't subtract more than the player has (fallback to current wealth)
          const amountToDeduct = Math.min(validAmount, currentWealth);
          
          // Convert to truncated decimal to avoid floating-point precision issues
          const newWealth = parseFloat((currentWealth - amountToDeduct).toFixed(1));
          const newNetWorth = parseFloat((currentNetWorth - amountToDeduct).toFixed(1));
          
          // Log internal state changes      
          console.log(`INTERNAL: Deducting ${amountToDeduct} from ${currentWealth}, result: ${newWealth}`);
          
          return { 
            wealth: newWealth,
            netWorth: newNetWorth,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        // Verify the deduction worked by comparing before and after
        const endingWealth = get().wealth;
        const actualDeduction = startingWealth - endingWealth;
        
        console.log(`Deducting ${validAmount} from wealth. Before: ${startingWealth}, After: ${endingWealth}, Actual deduction: ${actualDeduction}`);
        
        // Save state to ensure persistence
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
        console.log("DEBUG: getHousingExpense in character store - housingType:", state.housingType);
        
        let expense = 0;
        if (state.housingType === 'rental') {
          expense = EXPENSE_RATES.HOUSING.RENTAL;
        } else if (state.housingType === 'shared') {
          expense = EXPENSE_RATES.HOUSING.SHARED;
        } else if (state.housingType === 'owned') {
          expense = EXPENSE_RATES.HOUSING.OWNED;
        } else if (state.housingType === 'luxury') {
          // Use the defined constant for luxury housing
          expense = EXPENSE_RATES.HOUSING.LUXURY; // $8,000/mo for luxury housing
        } else {
          expense = EXPENSE_RATES.HOUSING.HOMELESS;
        }
        
        console.log("DEBUG: getHousingExpense in character store - calculated expense:", expense);
        return expense;
      },
      
      getTransportationExpense: () => {
        const state = get();
        console.log("DEBUG: getTransportationExpense in character store - vehicleType:", state.vehicleType);
        
        let expense = 0;
        if (state.vehicleType === 'economy') {
          expense = EXPENSE_RATES.TRANSPORTATION.ECONOMY;
        } else if (state.vehicleType === 'standard') {
          expense = EXPENSE_RATES.TRANSPORTATION.STANDARD;
        } else if (state.vehicleType === 'luxury') {
          expense = EXPENSE_RATES.TRANSPORTATION.LUXURY;
        } else if (state.vehicleType === 'premium') {
          expense = EXPENSE_RATES.TRANSPORTATION.PREMIUM;
        } else if (state.vehicleType === 'bicycle') {
          expense = EXPENSE_RATES.TRANSPORTATION.BICYCLE;
        } else {
          expense = EXPENSE_RATES.TRANSPORTATION.NONE;
        }
        
        console.log("DEBUG: getTransportationExpense in character store - calculated expense:", expense);
        return expense;
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
          // Convert to integer using Math.round
          const newHappiness = Math.max(0, Math.min(100, Math.round(state.happiness + amount)));
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
          // Convert to integer using Math.round
          const newStress = Math.max(0, Math.min(100, Math.round(state.stress + amount)));
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
          // Convert to integer using Math.round
          const newHealth = Math.max(0, Math.min(100, Math.round(state.health + amount)));
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
          // Convert to integer using Math.round
          // Increased maximum prestige from 100 to 3000 to give players a higher goal
          const newPrestige = Math.max(0, Math.min(3000, Math.round(state.prestige + amount)));
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
          // Convert to integer using Math.round
          const newSocialConnections = Math.max(0, Math.min(100, Math.round(state.socialConnections + amount)));
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
          // Convert to integer using Math.round
          const newHunger = Math.max(0, Math.min(100, Math.round(state.hunger + amount)));
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
          // Convert to integer using Math.round
          const newThirst = Math.max(0, Math.min(100, Math.round(state.thirst + amount)));
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
          // Convert to integer using Math.round
          const newEnergy = Math.max(0, Math.min(100, Math.round(state.energy + amount)));
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
          // Convert to integer using Math.round
          const newComfort = Math.max(0, Math.min(100, Math.round(state.comfort + amount)));
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
        console.log("DEBUG: setVehicle called with type:", type);
        set((state) => ({
          vehicleType: type,
          hasVehicle: type !== 'none'
        }));
        console.log("DEBUG: After setVehicle, vehicle type is now:", get().vehicleType);
        saveState();
      },
      
      setHousing: (type) => {
        console.log("DEBUG: setHousing called with type:", type);
        set((state) => ({ housingType: type }));
        console.log("DEBUG: After setHousing, housing type is now:", get().housingType);
        saveState();
      },
      
      // Time management functions
      addTimeCommitment: (hours) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          // Convert to integer using Math.round
          const newTimeCommitment = Math.max(0, Math.round(state.timeCommitment + hours));
          // When we add time commitment, we need to reduce free time proportionally
          const newFreeTime = Math.max(0, Math.round(168 - newTimeCommitment)); // 168 hours in a week
          
          return { 
            timeCommitment: newTimeCommitment,
            freeTime: newFreeTime,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        console.log(`Added ${hours} hours to time commitment. New commitment: ${get().timeCommitment}, Free time: ${get().freeTime}`);
        saveState();
      },
      
      reduceTimeCommitment: (hours) => {
        // Create a timestamp to force state updates across components
        const updateTimestamp = Date.now();
        
        set((state) => {
          // Convert to integer using Math.round
          const newTimeCommitment = Math.max(0, Math.round(state.timeCommitment - hours));
          // When we reduce time commitment, we gain free time
          const newFreeTime = Math.min(168, Math.round(168 - newTimeCommitment)); // 168 hours in a week
          
          return { 
            timeCommitment: newTimeCommitment,
            freeTime: newFreeTime,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        console.log(`Reduced time commitment by ${hours} hours. New commitment: ${get().timeCommitment}, Free time: ${get().freeTime}`);
        saveState();
      },
      
      updateFreeTime: (hours) => {
        // This directly adds or removes free time without affecting time commitment
        // Useful for events that temporarily provide more free time without reducing commitments
        const updateTimestamp = Date.now();
        
        set((state) => {
          // Convert to integer using Math.round
          const newFreeTime = Math.max(0, Math.min(168, Math.round(state.freeTime + hours)));
          
          return { 
            freeTime: newFreeTime,
            // Add a timestamp field to force state updates
            lastUpdated: updateTimestamp
          };
        });
        
        console.log(`Updated free time by ${hours} hours. Free time: ${get().freeTime}`);
        saveState();
      },
      
      // Avatar customization
      updateAvatarUrl: (url) => {
        set({ avatarUrl: url });
        console.log("Avatar URL updated:", url);
        saveState();
      },
      
      // New custom avatar methods
      updateAvatarSkinTone: (skinTone) => {
        set({ avatarSkinTone: skinTone });
        console.log("Avatar skin tone updated:", skinTone);
        saveState();
      },
      
      updateAvatarBodyType: (bodyType) => {
        set({ avatarBodyType: bodyType });
        console.log("Avatar body type updated:", bodyType);
        saveState();
      },
      
      updateAvatarHeight: (height) => {
        set({ avatarHeight: height });
        console.log("Avatar height updated:", height);
        saveState();
      },
      
      updateAvatarEyeColor: (eyeColor) => {
        set({ avatarEyeColor: eyeColor });
        console.log("Avatar eye color updated:", eyeColor);
        saveState();
      },
      
      selectAccessory: (type, accessoryId) => {
        set(state => ({
          selectedAccessories: {
            ...state.selectedAccessories || {},
            [type]: accessoryId
          }
        }));
        console.log(`Selected ${type} accessory: ${accessoryId}`);
        saveState();
      },
      
      removeAccessory: (type) => {
        set(state => {
          const newAccessories = { ...state.selectedAccessories || {} };
          delete newAccessories[type];
          return { selectedAccessories: newAccessories };
        });
        console.log(`Removed ${type} accessory`);
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
        
        // CRITICAL: Add property to asset tracker immediately AND update net worth
        // We're implementing a two-phase commit pattern to ensure data consistency
        try {
          console.log("=== BEGINNING PROPERTY PURCHASE SYNC OPERATION ===");
          
          // PHASE 1: Update the asset tracker with the new property
          console.log("PHASE 1: Updating asset tracker with new property");
          
          // Import asset tracker from the module
          const assetTracker = useAssetTracker.getState();
          
          // Add the property to the asset tracker with safeguards for NaN values
          console.log(`Adding property to asset tracker: ${property.name}`);
          
          // Default values if something is undefined
          const sanitizedPurchasePrice = property.purchasePrice || property.currentValue || 0;
          const sanitizedCurrentValue = property.currentValue || property.purchasePrice || 0;
          const sanitizedLoanAmount = property.loanAmount || 0;
          
          // Safety check - ensure values are valid numbers
          const purchasePrice = isNaN(sanitizedPurchasePrice) ? 0 : sanitizedPurchasePrice;
          const currentValue = isNaN(sanitizedCurrentValue) ? 0 : sanitizedCurrentValue;
          const mortgage = isNaN(sanitizedLoanAmount) ? 0 : sanitizedLoanAmount;
          
          // Log the values for debugging
          console.log(`Property values being passed to asset tracker:
            - purchasePrice: ${purchasePrice}
            - currentValue: ${currentValue}
            - mortgage: ${mortgage}
          `);
          
          assetTracker.addProperty({
            id: property.id,
            name: property.name,
            purchasePrice: purchasePrice,
            currentValue: currentValue,
            mortgage: mortgage,
          });
          
          // Update cash in asset tracker to match character wealth exactly
          console.log(`Updating cash in asset tracker to ${get().wealth}`);
          assetTracker.updateCash(get().wealth);
          
          // Force recalculation of totals
          assetTracker.recalculateTotals();
          
          console.log("Asset tracker updated successfully");
          
          // PHASE 2: Calculate net worth in character store and save state
          console.log("PHASE 2: Updating character net worth and saving state");
          
          // Get fresh character state
          const character = get();
          
          // Recalculate net worth 
          const calculatedNetWorth = character.calculateNetWorth();
          console.log(`Calculated net worth: ${calculatedNetWorth}`);
          
          // Get the asset tracker's opinion of net worth after updates
          const trackerNetWorth = assetTracker.totalNetWorth;
          console.log(`Asset tracker net worth: ${trackerNetWorth}`);
          
          // Explicitly set net worth in character store
          set({ netWorth: calculatedNetWorth });
          
          // Save character state to localStorage
          saveState();
          console.log("Character state saved successfully");
          
          // VERIFICATION PHASE: Double-check all values match
          console.log("VERIFICATION PHASE: Checking final values");
          
          // Get fresh states after all updates
          const finalCharacter = get();
          const finalTracker = useAssetTracker.getState();
          
          console.log(`Final character wealth: ${finalCharacter.wealth.toFixed(2)}`);
          console.log(`Final tracker cash: ${finalTracker.cash.toFixed(2)}`);
          console.log(`Final character net worth: ${finalCharacter.netWorth.toFixed(2)}`);
          console.log(`Final tracker net worth: ${finalTracker.totalNetWorth.toFixed(2)}`);
          
          if (Math.abs(finalCharacter.wealth - finalTracker.cash) > 0.1) {
            console.warn("⚠️ Cash values don't match after property purchase!");
            // Force one final sync
            finalTracker.updateCash(finalCharacter.wealth);
            finalTracker.recalculateTotals();
          }
          
          console.log("=== PROPERTY PURCHASE SYNC OPERATION COMPLETED ===");
          
          // Finally sync all assets with tracker to ensure complete consistency
          // We do this after a short delay to allow the UI to update first
          setTimeout(() => {
            try {
              console.log("Running final consistency check...");
              get().syncAssetsWithAssetTracker(true);
              // Run the global refresh function as well for good measure
              if (typeof window !== 'undefined' && (window as any).globalUpdateAllPrices) {
                (window as any).globalUpdateAllPrices();
              }
            } catch (error) {
              console.error("Error during final asset sync after property purchase:", error);
            }
          }, 500);
        } catch (error) {
          console.error("Error updating asset tracker after property purchase:", error);
        }
        
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
        
        // CRITICAL: Update asset tracker after selling property
        try {
          // Import asset tracker from the module
          const assetTracker = useAssetTracker.getState();
          
          // Remove the property from the asset tracker
          console.log(`Removing property from asset tracker: ${propertyId}`);
          assetTracker.removeProperty(propertyId);
          
          // Update cash in asset tracker to match character wealth
          console.log(`Updating cash in asset tracker after property sale`);
          assetTracker.updateCash(get().wealth);
          
          // Force recalculation of totals
          assetTracker.recalculateTotals();
          
          console.log(`Asset tracker updated successfully after property sale`);
        } catch (error) {
          console.error("Error updating asset tracker after property sale:", error);
        }
        
        saveState();
        
        // Finally sync all assets with tracker to ensure complete consistency
        setTimeout(() => {
          try {
            get().syncAssetsWithAssetTracker(true);
          } catch (error) {
            console.error("Error during final asset sync after property sale:", error);
          }
        }, 100);
        
        return saleValue;
      },
      
      updatePropertyValue: (propertyId, newValue) => {
        set((state) => {
          const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
          
          if (propertyIndex === -1) {
            return state; // Property not found
          }
          
          const updatedProperties = [...state.properties];
          const property = updatedProperties[propertyIndex];
          updatedProperties[propertyIndex] = {
            ...property,
            currentValue: newValue
          };
          
          return { properties: updatedProperties };
        });
        
        // CRITICAL: Update the property in the asset tracker
        try {
          const assetTracker = useAssetTracker.getState();
          const property = get().properties.find(p => p.id === propertyId);
          
          if (property) {
            console.log(`Updating property in asset tracker: ${propertyId} with new value ${newValue}`);
            assetTracker.updateProperty(
              propertyId, 
              newValue, 
              property.loanAmount || 0
            );
            
            // Force recalculation of totals
            assetTracker.recalculateTotals();
          }
        } catch (error) {
          console.error("Error updating property in asset tracker:", error);
        }
        
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
        
        // CRITICAL: Update all properties in the asset tracker
        try {
          const assetTracker = useAssetTracker.getState();
          const properties = get().properties;
          
          console.log(`Updating all properties in asset tracker with multiplier: ${multiplier}`);
          
          // Update each property in the asset tracker
          for (const property of properties) {
            assetTracker.updateProperty(
              property.id, 
              property.currentValue, 
              property.loanAmount || 0
            );
          }
          
          // Force recalculation of totals
          assetTracker.recalculateTotals();
        } catch (error) {
          console.error("Error updating properties in asset tracker:", error);
        }
        
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
        // Keep track of updated property IDs
        const updatedPropertyIds: string[] = [];
        
        set((state) => {
          const updatedProperties = state.properties.map(property => {
            // Check if this property matches our criteria
            if (property.type === type) {
              if (idFilter && idFilter.length > 0) {
                // If we have an ID filter, only update matching properties
                if (idFilter.includes(property.id)) {
                  updatedPropertyIds.push(property.id);
                  return {
                    ...property,
                    currentValue: property.currentValue * multiplier
                  };
                }
              } else {
                // No ID filter, update all properties of this type
                updatedPropertyIds.push(property.id);
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
        
        // CRITICAL: Update properties in the asset tracker
        try {
          const assetTracker = useAssetTracker.getState();
          const properties = get().properties;
          
          console.log(`Updating properties in asset tracker for type ${type} with multiplier: ${multiplier}`);
          console.log(`Properties to update: ${updatedPropertyIds.length} of total ${properties.length}`);
          
          // Only update the properties that were affected
          for (const property of properties) {
            if (updatedPropertyIds.includes(property.id)) {
              assetTracker.updateProperty(
                property.id, 
                property.currentValue, 
                property.loanAmount || 0
              );
            }
          }
          
          // Force recalculation of totals
          assetTracker.recalculateTotals();
        } catch (error) {
          console.error("Error updating properties in asset tracker:", error);
        }
        
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
        const timeStore = getStore('time');
        const { currentGameDate } = timeStore ? timeStore.getState() : { currentGameDate: new Date() };
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
          
          // Calculate the actual months in position for job history
          // Use Math.floor to ensure we don't overestimate
          const daysInPreviousJob = state.daysSincePromotion;
          const monthsInPosition = Math.floor(daysInPreviousJob / 30);
          
          console.log(`Job promotion: Days in previous position: ${daysInPreviousJob}, calculated months: ${monthsInPosition}`);
          
          // Add the old job to history with proper month calculation
          const updatedHistory = oldJob 
            ? [...state.jobHistory, { ...oldJob, monthsInPosition: monthsInPosition }] 
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
          
          // Calculate the actual months in position for job history
          // Use Math.floor to ensure we don't overestimate
          const daysInPreviousJob = state.daysSincePromotion;
          const monthsInPosition = Math.floor(daysInPreviousJob / 30);
          
          console.log(`Job quit: Days in previous position: ${daysInPreviousJob}, calculated months: ${monthsInPosition}`);
          
          // Add the old job to history with proper month calculation
          const updatedHistory = oldJob 
            ? [...state.jobHistory, { ...oldJob, monthsInPosition: monthsInPosition }] 
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
          updatedSkills[skill] = Math.min(1000, updatedSkills[skill] + amount);
          
          return { skills: updatedSkills };
        });
        
        // Save state and trigger challenge progress check
        saveState();
        
        // Import useChallenges at the top level to avoid circular dependencies
        const useChallengesStore = useChallenges.getState();
        
        // Trigger challenge progress check
        if (useChallengesStore && typeof useChallengesStore.checkChallengeProgress === 'function') {
          console.log(`Triggering challenge progress check after improving ${skill} skill by ${amount}`);
          useChallengesStore.checkChallengeProgress();
        }
      },
      
      // Decrease skill point and refund it to the player's available skill points
      // This is used only during character creation
      decreaseSkillPoint: (skill: keyof CharacterSkills) => {
        let success = false;
        
        set((state) => {
          // Check if the skill has any points to remove (must be above 30, our base value)
          if (state.skills[skill] <= 30) {
            return state;
          }
          
          // Remove a point
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = updatedSkills[skill] - 1;
          
          success = true;
          
          return {
            skills: updatedSkills,
            skillPoints: state.skillPoints + 1
          };
        });
        
        saveState();
        return success;
      },
      
      // Skill points allocation for character creation
      allocateSkillPoint: (skill: keyof CharacterSkills) => {
        let success = false;
        
        set((state) => {
          // Check if we have points to allocate
          if (state.skillPoints <= 0) {
            return state;
          }
          
          // Check if the skill is already maxed out
          if (state.skills[skill] >= 1000) {
            return state;
          }
          
          // Allocate a point
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = Math.min(1000, updatedSkills[skill] + 1);
          
          success = true;
          
          return {
            skills: updatedSkills,
            skillPoints: state.skillPoints - 1
          };
        });
        
        saveState();
        
        // Trigger challenge progress check after skill allocation
        const useChallengesStore = useChallenges.getState();
        if (useChallengesStore && typeof useChallengesStore.checkChallengeProgress === 'function') {
          console.log(`Triggering challenge progress check after allocating skill point to ${skill}`);
          useChallengesStore.checkChallengeProgress();
        }
        
        return success;
      },
      
      // Award skill points during gameplay (from quests, achievements, etc.)
      awardSkillPoints: (amount) => {
        // Ensure amount is a valid number
        const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        
        console.log(`Awarding ${validAmount} skill points to character`);
        
        set((state) => {
          // Ensure current skill points is a valid number
          const currentSkillPoints = typeof state.earnedSkillPoints === 'number' && !isNaN(state.earnedSkillPoints) 
                                    ? state.earnedSkillPoints : 0;
          
          // Calculate new skill points total
          const newSkillPoints = currentSkillPoints + validAmount;
          
          console.log(`Previous skill points: ${currentSkillPoints}, New skill points: ${newSkillPoints}`);
          
          return {
            earnedSkillPoints: newSkillPoints
          };
        });
        
        // Show toast notification only for significant skill point awards (3+)
        // This reduces notification frequency while still alerting for important gains
        if (validAmount >= 3) {
          toast.success('Skill Points Awarded!', {
            description: `You gained ${validAmount} skill points that can be used to improve your character.`,
            position: 'top-center',
            duration: 3000
          });
        } else if (validAmount > 0) {
          // For smaller awards, just log to console without toast
          console.log(`Gained ${validAmount} skill points silently (below notification threshold)`);
        }
        
        saveState();
        
        // Check challenges after gaining skill points
        const challengesStore = useChallenges.getState();
        challengesStore.checkChallengeProgress();
      },
      
      // Spend earned skill points during gameplay
      spendEarnedSkillPoint: (skill: keyof CharacterSkills) => {
        let success = false;
        
        set((state) => {
          // Check if we have points to spend
          if (state.earnedSkillPoints <= 0) {
            return state;
          }
          
          // Check if the skill is already maxed out
          if (state.skills[skill] >= 1000) {
            return state;
          }
          
          // Allocate a point
          const updatedSkills = { ...state.skills };
          updatedSkills[skill] = Math.min(1000, updatedSkills[skill] + 1);
          
          success = true;
          
          return {
            skills: updatedSkills,
            earnedSkillPoints: state.earnedSkillPoints - 1
          };
        });
        
        saveState();
        
        // Trigger challenge progress check after spending skill point
        const useChallengesStore = useChallenges.getState();
        if (useChallengesStore && typeof useChallengesStore.checkChallengeProgress === 'function') {
          console.log(`Triggering challenge progress check after spending earned skill point on ${skill}`);
          useChallengesStore.checkChallengeProgress();
        }
        
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
          
          // First sync with asset tracker to ensure latest values
          get().syncAssetsWithAssetTracker();
          
          // Get fresh values from the asset tracker
          const assetTracker = useAssetTracker.getState();
          
          // Create a breakdown with asset tracker values
          const resetBreakdown = {
            cash: assetTracker.totalCash,
            stocks: assetTracker.totalStocks,
            crypto: assetTracker.totalCrypto,
            bonds: assetTracker.totalBonds,
            otherInvestments: assetTracker.totalOtherInvestments,
            propertyEquity: assetTracker.totalPropertyEquity,
            propertyValue: assetTracker.totalPropertyValue,
            propertyDebt: assetTracker.totalPropertyDebt,
            lifestyleItems: assetTracker.totalLifestyleValue,
            total: assetTracker.totalNetWorth,
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
        
        // Sync with asset tracker first to ensure latest values
        get().syncAssetsWithAssetTracker();
        
        // Get fresh values from the asset tracker
        const assetTracker = useAssetTracker.getState();
        
        // Get all totals directly from asset tracker with safety checks for NaN values
        // This prevents NaN from propagating through calculations and breaking the UI
        const cash = isNaN(assetTracker.totalCash) ? 0 : assetTracker.totalCash;
        const stocks = isNaN(assetTracker.totalStocks) ? 0 : assetTracker.totalStocks;
        const crypto = isNaN(assetTracker.totalCrypto) ? 0 : assetTracker.totalCrypto;
        const bonds = isNaN(assetTracker.totalBonds) ? 0 : assetTracker.totalBonds;
        const otherInvest = isNaN(assetTracker.totalOtherInvestments) ? 0 : assetTracker.totalOtherInvestments;
        const propEquity = isNaN(assetTracker.totalPropertyEquity) ? 0 : assetTracker.totalPropertyEquity;
        const propValue = isNaN(assetTracker.totalPropertyValue) ? 0 : assetTracker.totalPropertyValue;
        const propDebt = isNaN(assetTracker.totalPropertyDebt) ? 0 : assetTracker.totalPropertyDebt;
        const lifestyle = isNaN(assetTracker.totalLifestyleValue) ? 0 : assetTracker.totalLifestyleValue;
        
        // Manually calculate clean total to avoid NaN
        const cleanTotal = cash + stocks + crypto + bonds + otherInvest + propEquity + lifestyle;
        
        // Check if asset tracker total is valid
        const trackerTotal = isNaN(assetTracker.totalNetWorth) ? cleanTotal : assetTracker.totalNetWorth;
        
        // If we had to fix NaN values, log it
        if (isNaN(assetTracker.totalNetWorth) || isNaN(assetTracker.totalCash) || 
            isNaN(assetTracker.totalPropertyEquity) || isNaN(assetTracker.totalPropertyValue)) {
          console.error("❌ DETECTED NaN VALUES in asset calculation - fixed automatically");
          console.log(`Original tracker total: ${assetTracker.totalNetWorth}, fixed total: ${cleanTotal}`);
          
          // Force the asset tracker to recalculate with clean values
          assetTracker.recalculateTotals();
        }
        
        const breakdown = {
          cash,
          stocks,
          crypto, 
          bonds,
          otherInvestments: otherInvest,
          propertyEquity: propEquity,
          propertyValue: propValue,
          propertyDebt: propDebt,
          lifestyleItems: lifestyle,
          total: cleanTotal,
          version: Date.now() // Add version timestamp
        };
        
        // Use our clean calculated total
        let netWorth = cleanTotal;
        
        // Detailed logging for debugging
        console.log("Calculating net worth using asset tracker values:");
        console.log(`Cash: ${breakdown.cash}`);
        console.log(`Stocks: ${breakdown.stocks}`);
        console.log(`Crypto: ${breakdown.crypto}`);
        console.log(`Bonds: ${breakdown.bonds}`);
        console.log(`Other investments: ${breakdown.otherInvestments}`);
        console.log(`Property equity: ${breakdown.propertyEquity}`);
        console.log(`Property value: ${breakdown.propertyValue}`);
        console.log(`Property debt: ${breakdown.propertyDebt}`);
        console.log(`Lifestyle items: ${breakdown.lifestyleItems}`);
        console.log(`Total net worth: ${breakdown.total}`);
        
        // Helper function to safely calculate percentage (handles division by zero)
        const safePercentage = (value: number, total: number): string => {
          if (!total || total === 0 || isNaN(total)) return "0.00";
          const percentage = (value / total) * 100;
          return isNaN(percentage) ? "0.00" : percentage.toFixed(2);
        };
        
        // Log the breakdown for debugging with safe percentages
        console.log('Net worth breakdown:');
        console.log(`Cash: ${breakdown.cash} (${safePercentage(breakdown.cash, breakdown.total)}%)`);
        console.log(`Stocks: ${breakdown.stocks} (${safePercentage(breakdown.stocks, breakdown.total)}%)`);
        console.log(`Crypto: ${breakdown.crypto} (${safePercentage(breakdown.crypto, breakdown.total)}%)`);
        console.log(`Bonds: ${breakdown.bonds} (${safePercentage(breakdown.bonds, breakdown.total)}%)`);
        console.log(`Other investments: ${breakdown.otherInvestments} (${safePercentage(breakdown.otherInvestments, breakdown.total)}%)`);
        console.log(`Property equity: ${breakdown.propertyEquity} (${safePercentage(breakdown.propertyEquity, breakdown.total)}%)`);
        console.log(`Lifestyle Items: ${breakdown.lifestyleItems} (${safePercentage(breakdown.lifestyleItems, breakdown.total)}%)`);
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
          // First sync with the asset tracker
          get().syncAssetsWithAssetTracker();
          
          // Then get data from asset tracker
          const assetTracker = useAssetTracker.getState();
          
          // Use asset tracker values for the breakdown
          const defaultBreakdown = {
            cash: assetTracker.totalCash,
            stocks: assetTracker.totalStocks,
            crypto: assetTracker.totalCrypto,
            bonds: assetTracker.totalBonds,
            otherInvestments: assetTracker.totalOtherInvestments,
            propertyEquity: assetTracker.totalPropertyEquity,
            propertyValue: assetTracker.totalPropertyValue,
            propertyDebt: assetTracker.totalPropertyDebt,
            lifestyleItems: assetTracker.totalLifestyleValue,
            total: assetTracker.totalNetWorth,
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
        
        // Final fallback - use asset tracker as source of truth
        // Sync assets with asset tracker first
        get().syncAssetsWithAssetTracker();
        
        // Get fresh values from the asset tracker
        const assetTracker = useAssetTracker.getState();
        
        // Create breakdown with asset tracker values
        const fallbackBreakdown = {
          cash: assetTracker.totalCash,
          stocks: assetTracker.totalStocks,
          crypto: assetTracker.totalCrypto,
          bonds: assetTracker.totalBonds,
          otherInvestments: assetTracker.totalOtherInvestments,
          propertyEquity: assetTracker.totalPropertyEquity,
          propertyValue: assetTracker.totalPropertyValue,
          propertyDebt: assetTracker.totalPropertyDebt,
          lifestyleItems: assetTracker.totalLifestyleValue,
          total: assetTracker.totalNetWorth,
          version: Date.now()
        };
        
        console.log("Using fallback breakdown with asset tracker values:", fallbackBreakdown);
        return fallbackBreakdown;
      },
      
      // This empty block is intentionally left to show where the implementation
      // of the syncPricesFromAssetTracker function would be placed.
      // The actual implementation is defined later in the code.
      
      // Helper function to sync all assets with the AssetTracker store
      // This ensures that the assets in the Character store are properly
      // reflected in the AssetTracker, which is used by other components
      syncAssetsWithAssetTracker: (updateMarketPrices = true) => {
        console.log(`=== BEGINNING ASSET SYNC WITH ASSET TRACKER ${updateMarketPrices ? '(WITH PRICE UPDATES)' : '(MARKET CLOSED - NO PRICE UPDATES)'} ===`);
        const state = get();
        
        // Safeguard: Ensure the AssetTracker is accessible
        if (!useAssetTracker) {
          console.error("CRITICAL ERROR: AssetTracker module not available");
          return;
        }
        
        const assetTracker = useAssetTracker.getState();
        if (!assetTracker) {
          console.error("CRITICAL ERROR: AssetTracker state not available");
          return;
        }
        
        // CRITICAL ENHANCEMENT: Before doing anything else, force cash sync to ensure consistency
        // This ensures that the character's cash is always the source of truth
        const characterCash = state.wealth !== null && state.wealth !== undefined ? parseFloat(state.wealth.toFixed(1)) : 0;
        const trackerCash = assetTracker.cash !== null && assetTracker.cash !== undefined ? parseFloat(assetTracker.cash.toFixed(1)) : 0;
        
        if (characterCash !== trackerCash) {
          console.log(`Cash force-sync: Character wealth (${characterCash}) as source of truth over tracker cash (${trackerCash})`);
          useAssetTracker.setState({
            cash: state.wealth,
            totalCash: state.wealth,
            lastUpdated: Date.now()
          });
        }
        
        console.log("Character state snapshot:", {
          wealth: state.wealth,
          stockCount: state.assets?.filter(a => a.type === 'stock')?.length || 0,
          cryptoCount: state.assets?.filter(a => a.type === 'crypto')?.length || 0,
          bondCount: state.assets?.filter(a => a.type === 'bond')?.length || 0,
          otherInvestmentCount: state.assets?.filter(a => a.type === 'other')?.length || 0,
          propertyCount: state.properties?.length || 0,
          lifestyleItemCount: state.lifestyleItems?.length || 0
        });
        
        console.log("Asset tracker snapshot:", {
          cash: assetTracker.totalCash,
          stockCount: assetTracker.stocks?.length || 0,
          cryptoCount: assetTracker.cryptoAssets?.length || 0,
          bondCount: assetTracker.bonds?.length || 0,
          otherCount: assetTracker.otherInvestments?.length || 0,
          propertyCount: assetTracker.properties?.length || 0,
          lifestyleCount: assetTracker.lifestyleItems?.length || 0
        });
        
        // BIDIRECTIONAL SYNC FIRST:
        // Before pushing character state to asset tracker, update character state with latest prices
        // from asset tracker. This ensures latest market prices are reflected in the character store.
        get().syncPricesFromAssetTracker();
        
        // Check if we're in a reset state
        // Only consider 'game_reset_in_progress' flag to be truly indicative of a reset
        // The other flags can be set during normal game operation and shouldn't trigger asset reset
        const resetInProgress = typeof window !== 'undefined' && 
                               window.sessionStorage && 
                               window.sessionStorage.getItem('game_reset_in_progress') === 'true';
        
        // If a reset is happening, we should reset the asset tracker completely first
        if (resetInProgress) {
          console.log("RESET MODE DETECTED: Performing deep asset tracker reset first");
          try {
            // Reset the asset tracker completely
            assetTracker.resetAssetTracker();
            
            // Update cash to current character wealth (should be the starting amount)
            assetTracker.updateCash(state.wealth);
            
            // Force a recalculation with clean data
            assetTracker.recalculateTotals();
            assetTracker.forceUpdate();
            
            // Verify the reset was successful
            const verifiedState = useAssetTracker.getState();
            const resetSuccess = 
              verifiedState.stocks.length === 0 &&
              verifiedState.cryptoAssets.length === 0 &&
              verifiedState.bonds.length === 0 &&
              verifiedState.otherInvestments.length === 0 &&
              verifiedState.properties.length === 0 &&
              verifiedState.lifestyleItems.length === 0;
              
            console.log(`Deep asset tracker reset: ${resetSuccess ? 'SUCCESS ✓' : 'FAILED ✗'}`);
            
            if (!resetSuccess) {
              console.error("CRITICAL: Asset tracker reset failed! Items still exist in tracker");
              console.log("Attempting force removeAll one more time...");
              
              // Force remove all items in each category
              try {
                // Get fresh state after reset
                const freshState = useAssetTracker.getState();
                
                // Force remove each stock
                freshState.stocks.forEach(item => freshState.removeStock(item.id));
                
                // Force remove each crypto
                freshState.cryptoAssets.forEach(item => freshState.removeCrypto(item.id));
                
                // Force remove each bond
                freshState.bonds.forEach(item => freshState.removeBond(item.id));
                
                // Force remove each other investment
                freshState.otherInvestments.forEach(item => freshState.removeOtherInvestment(item.id));
                
                // Force remove each property
                freshState.properties.forEach(item => freshState.removeProperty(item.id));
                
                // Force remove each lifestyle item
                freshState.lifestyleItems.forEach(item => freshState.removeLifestyleItem(item.id));
                
                // Force a recalculation
                freshState.recalculateTotals();
                freshState.forceUpdate();
                
                console.log("Force removeAll complete - asset tracker should now be clean");
              } catch (forceRemoveError) {
                console.error("Force removeAll failed:", forceRemoveError);
              }
            }
            
            // Early return - we've reset everything to initial state
            console.log("=== ASSET SYNC COMPLETE (RESET MODE) ===");
            return;
          } catch (resetError) {
            console.error("Error during deep reset in syncAssetsWithAssetTracker:", resetError);
          }
        }
        
        console.log("NORMAL MODE: Syncing individual assets between character and asset tracker");
        
        // PHASE 1: UPDATE CASH AND SETUP
        try {
          // First, update cash
          assetTracker.updateCash(state.wealth);
          console.log(`Updated cash to: ${state.wealth}`);
          
          // Safeguard arrays
          if (!state.assets) state.assets = [];
          if (!state.properties) state.properties = [];
          if (!state.lifestyleItems) state.lifestyleItems = [];
          
        } catch (phase1Error) {
          console.error("Error in Phase 1 (cash update):", phase1Error);
        }
        
        // PHASE 2: STOCK SYNCING
        try {
          console.log("Phase 2: Syncing stocks");
          
          // 1. Get all existing stocks in tracker with validation
          const existingStocks = [...(assetTracker.stocks || [])];
          console.log(`Found ${existingStocks.length} stocks in asset tracker`);
          
          // 2. Get the IDs of stocks that should be in the tracker now
          const currentStockIds = state.assets
            .filter(asset => asset && asset.type === 'stock')
            .map(stock => stock.id);
            
          console.log(`Found ${currentStockIds.length} stocks in character state`);
          
          // 3. Remove stocks that aren't in the character state
          let removedStocksCount = 0;
          existingStocks.forEach(stock => {
            if (!currentStockIds.includes(stock.id)) {
              console.log(`Removing stock ${stock.id} from asset tracker (not in character state)`);
              assetTracker.removeStock(stock.id);
              removedStocksCount++;
            }
          });
          console.log(`Removed ${removedStocksCount} stocks from asset tracker`);
          
          // 4. Update/add existing stocks
          const stockAssets = state.assets.filter(asset => asset && asset.type === 'stock');
          
          // Print detailed info about stocks we're trying to sync
          console.log("Stocks from character state being synced:", 
            stockAssets.map(s => ({
              id: s.id, 
              name: s.name, 
              qty: s.quantity, 
              price: s.currentPrice
            }))
          );
          
          // Track counts for better error reporting
          let updatedCount = 0;
          let addedCount = 0;
          let errorCount = 0;
          
          stockAssets.forEach(stock => {
            try {
              // Check if this stock already exists in the asset tracker
              const existingStockIndex = assetTracker.stocks.findIndex(s => s.id === stock.id);
              
              if (existingStockIndex >= 0) {
                // Update the existing stock
                if (updateMarketPrices) {
                  console.log(`Updating existing stock in tracker: ${stock.name} (${stock.id}) with ${stock.quantity} shares at ${stock.currentPrice}`);
                  assetTracker.updateStock(stock.id, stock.quantity, stock.currentPrice);
                } else {
                  // Only update quantity when market is closed
                  console.log(`Market CLOSED: Only updating quantity for stock: ${stock.name} (${stock.id}) to ${stock.quantity} shares`);
                  const existingStock = assetTracker.stocks[existingStockIndex];
                  assetTracker.updateStock(stock.id, stock.quantity, existingStock.currentPrice);
                }
                updatedCount++;
              } else {
                // Add as a new stock
                console.log(`Adding new stock to tracker: ${stock.name} (${stock.id}) with ${stock.quantity} shares at ${stock.currentPrice}`);
                assetTracker.addStock({
                  id: stock.id,
                  name: stock.name,
                  shares: stock.quantity,
                  purchasePrice: stock.purchasePrice || stock.currentPrice,
                  currentPrice: stock.currentPrice
                });
                addedCount++;
              }
            } catch (e) {
              console.error(`Error syncing stock ${stock.id}:`, e);
              errorCount++;
            }
          });
          
          console.log(`Stock sync complete: ${updatedCount} updated, ${addedCount} added, ${errorCount} errors`);
        } catch (stockSyncError) {
          console.error("Error during stock syncing:", stockSyncError);
        }
        
        // PHASE 3: CRYPTO SYNCING
        try {
          console.log("Phase 3: Syncing crypto assets");
          
          // 1. Get all existing crypto in tracker
          const existingCrypto = [...(assetTracker.cryptoAssets || [])];
          console.log(`Found ${existingCrypto.length} crypto assets in tracker`);
          
          // 2. Get the IDs of crypto that should be in the tracker now
          const currentCryptoIds = state.assets
            .filter(asset => asset && asset.type === 'crypto')
            .map(crypto => crypto.id);
          console.log(`Found ${currentCryptoIds.length} crypto assets in character state`);
          
          // 3. Remove crypto that aren't in the character state
          let removedCryptoCount = 0;
          existingCrypto.forEach(crypto => {
            if (!currentCryptoIds.includes(crypto.id)) {
              console.log(`Removing crypto ${crypto.id} from asset tracker (not in character state)`);
              assetTracker.removeCrypto(crypto.id);
              removedCryptoCount++;
            }
          });
          console.log(`Removed ${removedCryptoCount} crypto assets from tracker`);
          
          // 4. Update/add existing crypto
          const cryptoAssets = state.assets.filter(asset => asset && asset.type === 'crypto');
          
          // Print detailed info about crypto we're trying to sync
          console.log("Crypto from character state being synced:", 
            cryptoAssets.map(c => ({
              id: c.id, 
              name: c.name, 
              qty: c.quantity, 
              price: c.currentPrice
            }))
          );
          
          // Track counts for better error reporting
          let cryptoUpdatedCount = 0;
          let cryptoAddedCount = 0;
          let cryptoErrorCount = 0;
          
          cryptoAssets.forEach(crypto => {
            try {
              // Check if this crypto already exists in the asset tracker
              const existingCryptoIndex = assetTracker.cryptoAssets.findIndex(c => c.id === crypto.id);
              
              if (existingCryptoIndex >= 0) {
                // Update the existing crypto
                if (updateMarketPrices) {
                  console.log(`Updating existing crypto in tracker: ${crypto.name} (${crypto.id}) with ${crypto.quantity} units at ${crypto.currentPrice}`);
                  assetTracker.updateCrypto(crypto.id, crypto.quantity, crypto.currentPrice);
                } else {
                  // Only update quantity when market is closed
                  console.log(`Market CLOSED: Only updating quantity for crypto: ${crypto.name} (${crypto.id}) to ${crypto.quantity} units`);
                  const existingCrypto = assetTracker.cryptoAssets[existingCryptoIndex];
                  assetTracker.updateCrypto(crypto.id, crypto.quantity, existingCrypto.currentPrice);
                }
                cryptoUpdatedCount++;
              } else {
                // Add as a new crypto
                console.log(`Adding new crypto to tracker: ${crypto.name} (${crypto.id}) with ${crypto.quantity} units at ${crypto.currentPrice}`);
                assetTracker.addCrypto({
                  id: crypto.id,
                  name: crypto.name,
                  amount: crypto.quantity,
                  purchasePrice: crypto.purchasePrice || crypto.currentPrice,
                  currentPrice: crypto.currentPrice
                });
                cryptoAddedCount++;
              }
            } catch (e) {
              console.error(`Error syncing crypto ${crypto.id}:`, e);
              cryptoErrorCount++;
            }
          });
          
          console.log(`Crypto sync complete: ${cryptoUpdatedCount} updated, ${cryptoAddedCount} added, ${cryptoErrorCount} errors`);
        } catch (cryptoSyncError) {
          console.error("Error during crypto syncing:", cryptoSyncError);
        }
        
        // PHASE 4: BOND SYNCING
        try {
          console.log("Phase 4: Syncing bonds");
          
          // 1. Get all existing bonds in tracker
          const existingBonds = [...(assetTracker.bonds || [])];
          console.log(`Found ${existingBonds.length} bonds in tracker`);
          
          // 2. Get the IDs of bonds that should be in the tracker now
          const currentBondIds = state.assets
            .filter(asset => asset && asset.type === 'bond')
            .map(bond => bond.id);
          console.log(`Found ${currentBondIds.length} bonds in character state`);
          
          // 3. Remove bonds that aren't in the character state
          let removedBondCount = 0;
          existingBonds.forEach(bond => {
            if (!currentBondIds.includes(bond.id)) {
              console.log(`Removing bond ${bond.id} from asset tracker (not in character state)`);
              assetTracker.removeBond(bond.id);
              removedBondCount++;
            }
          });
          console.log(`Removed ${removedBondCount} bonds from tracker`);
          
          // 4. Update/add existing bonds
          const bondAssets = state.assets.filter(asset => asset && asset.type === 'bond');
          
          // Print detailed info about bonds we're trying to sync
          console.log("Bonds from character state being synced:", 
            bondAssets.map(b => ({
              id: b.id, 
              name: b.name, 
              qty: b.quantity, 
              price: b.currentPrice
            }))
          );
          
          // Track counts for better error reporting
          let bondUpdatedCount = 0;
          let bondAddedCount = 0;
          let bondErrorCount = 0;
          
          bondAssets.forEach(bond => {
            try {
              // Check if this bond already exists in the asset tracker
              const existingBondIndex = assetTracker.bonds.findIndex(b => b.id === bond.id);
              
              if (existingBondIndex >= 0) {
                // Update the existing bond
                console.log(`Updating existing bond in tracker: ${bond.name} (${bond.id}) with ${bond.quantity} units at ${bond.currentPrice}`);
                assetTracker.updateBond(bond.id, bond.quantity, bond.currentPrice);
                bondUpdatedCount++;
              } else {
                // Add as a new bond
                console.log(`Adding new bond to tracker: ${bond.name} (${bond.id}) with ${bond.quantity} units at ${bond.currentPrice}`);
                // Add as a new bond - bonds need maturity info
                // First extract any additional properties we need
                // Use type assertions to handle properties not defined in the Asset type
                const maturityValue = (bond as any).maturityValue !== undefined 
                  ? (bond as any).maturityValue 
                  : bond.currentPrice * 1.05;
                  
                const maturityDate = (bond as any).maturityDate !== undefined
                  ? (bond as any).maturityDate 
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                  
                // Now create the properly typed bond data
                const bondData = {
                  id: bond.id,
                  name: bond.name,
                  amount: bond.quantity,
                  purchasePrice: bond.purchasePrice || bond.currentPrice,
                  maturityValue: maturityValue,
                  maturityDate: maturityDate
                };
                assetTracker.addBond(bondData);
                bondAddedCount++;
              }
            } catch (e) {
              console.error(`Error syncing bond ${bond.id}:`, e);
              bondErrorCount++;
            }
          });
          
          console.log(`Bond sync complete: ${bondUpdatedCount} updated, ${bondAddedCount} added, ${bondErrorCount} errors`);
        } catch (bondSyncError) {
          console.error("Error during bond syncing:", bondSyncError);
        }
        
        // PHASE 5: OTHER INVESTMENTS SYNCING
        try {
          console.log("Phase 5: Syncing other investments");
          
          // 1. Get all existing other investments in tracker
          const existingOther = [...(assetTracker.otherInvestments || [])];
          console.log(`Found ${existingOther.length} other investments in tracker`);
          
          // 2. Get the IDs of other investments that should be in the tracker now
          const currentOtherIds = state.assets
            .filter(asset => asset && asset.type === 'other')
            .map(other => other.id);
          console.log(`Found ${currentOtherIds.length} other investments in character state`);
          
          // 3. Remove other investments that aren't in the character state
          let removedOtherCount = 0;
          existingOther.forEach(other => {
            if (!currentOtherIds.includes(other.id)) {
              console.log(`Removing other investment ${other.id} from asset tracker (not in character state)`);
              assetTracker.removeOtherInvestment(other.id);
              removedOtherCount++;
            }
          });
          console.log(`Removed ${removedOtherCount} other investments from tracker`);
          
          // 4. Update/add existing other investments
          const otherAssets = state.assets.filter(asset => asset && asset.type === 'other');
          
          // Print detailed info about other investments we're trying to sync
          console.log("Other investments from character state being synced:", 
            otherAssets.map(o => ({
              id: o.id, 
              name: o.name, 
              qty: o.quantity, 
              price: o.currentPrice,
              total: o.currentPrice * o.quantity
            }))
          );
          
          // Track counts for better error reporting
          let otherUpdatedCount = 0;
          let otherAddedCount = 0;
          let otherErrorCount = 0;
          
          otherAssets.forEach(other => {
            try {
              // Calculate total value
              const totalValue = other.currentPrice * other.quantity;
              
              // Check if this investment already exists in the asset tracker
              const existingOtherIndex = assetTracker.otherInvestments.findIndex(o => o.id === other.id);
              
              if (existingOtherIndex >= 0) {
                // Update the existing investment
                console.log(`Updating existing other investment in tracker: ${other.name} (${other.id}) with total value ${totalValue}`);
                assetTracker.updateOtherInvestment(other.id, totalValue);
                otherUpdatedCount++;
              } else {
                // Add as a new investment
                console.log(`Adding new other investment to tracker: ${other.name} (${other.id}) with total value ${totalValue}`);
                // Add as a new "other" investment
                const otherInvestmentData = {
                  id: other.id,
                  name: other.name,
                  amount: 1, // Use amount of 1 as we're storing total value
                  purchasePrice: totalValue,
                  currentValue: totalValue
                };
                assetTracker.addOtherInvestment(otherInvestmentData);
                otherAddedCount++;
              }
            } catch (e) {
              console.error(`Error syncing other investment ${other.id}:`, e);
              otherErrorCount++;
            }
          });
          
          console.log(`Other investment sync complete: ${otherUpdatedCount} updated, ${otherAddedCount} added, ${otherErrorCount} errors`);
        } catch (otherSyncError) {
          console.error("Error during other investment syncing:", otherSyncError);
        }
        
        // PHASE 6: PROPERTIES SYNCING
        try {
          console.log("Phase 6: Syncing properties");
          
          // 1. Get all existing properties in tracker
          const existingProperties = [...(assetTracker.properties || [])];
          console.log(`Found ${existingProperties.length} properties in tracker`);
          
          // 2. Get the IDs of properties that should be in the tracker now
          const currentPropertyIds = (state.properties || []).map(property => property.id);
          console.log(`Found ${currentPropertyIds.length} properties in character state`);
          
          // 3. Remove properties that aren't in the character state
          let removedPropertyCount = 0;
          existingProperties.forEach(property => {
            if (!currentPropertyIds.includes(property.id)) {
              console.log(`Removing property ${property.id} from asset tracker (not in character state)`);
              assetTracker.removeProperty(property.id);
              removedPropertyCount++;
            }
          });
          console.log(`Removed ${removedPropertyCount} properties from tracker`);
          
          // 4. Update/add existing properties
          (state.properties || []).forEach(property => {
            if (property && property.id) {
              // Check if property exists in the tracker
              const existingProperty = assetTracker.properties.find(p => p.id === property.id);
              
              if (existingProperty) {
                // Update existing property
                assetTracker.updateProperty(
                  property.id, 
                  property.currentValue, 
                  property.loanAmount
                );
              } else {
                // Add new property to tracker
                assetTracker.addProperty({
                  id: property.id,
                  name: property.name,
                  purchasePrice: property.purchasePrice,
                  currentValue: property.currentValue,
                  mortgage: property.loanAmount,
                });
              }
            }
          });
          console.log(`Updated ${state.properties?.length || 0} properties in tracker`);
        } catch (propertySyncError) {
          console.error("Error during property syncing:", propertySyncError);
        }
        
        // PHASE 7: LIFESTYLE ITEMS SYNCING
        try {
          console.log("Phase 7: Syncing lifestyle items");
          
          // 1. Get all existing lifestyle items in tracker
          const existingLifestyleItems = [...(assetTracker.lifestyleItems || [])];
          console.log(`Found ${existingLifestyleItems.length} lifestyle items in tracker`);
          
          // 2. Get the IDs of lifestyle items that should be in the tracker now
          const currentLifestyleItemIds = (state.lifestyleItems || []).map(item => item.id);
          console.log(`Found ${currentLifestyleItemIds.length} lifestyle items in character state`);
          
          // 3. Remove lifestyle items that aren't in the character state
          let removedLifestyleCount = 0;
          existingLifestyleItems.forEach(item => {
            if (!currentLifestyleItemIds.includes(item.id)) {
              console.log(`Removing lifestyle item ${item.id} from asset tracker (not in character state)`);
              assetTracker.removeLifestyleItem(item.id);
              removedLifestyleCount++;
            }
          });
          console.log(`Removed ${removedLifestyleCount} lifestyle items from tracker`);
          
          // 4. Update/add existing lifestyle items
          (state.lifestyleItems || []).forEach(item => {
            if (!item || !item.id) return;
            
            // Calculate item value based on purchase price or monthly cost
            let itemValue = 0;
            
            try {
              if (item.purchasePrice) {
                // Skip vacations and experiences (they're temporary)
                if (item.type === 'vacations' || item.type === 'experiences') {
                  return;
                }
                
                // For permanent items, use purchase price with simple depreciation
                const purchasePrice = item.purchasePrice;
                const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : new Date();
                
                // Safe access to time store via registry
                let currentDate = new Date();
                try {
                  const timeStore = getStore('time');
                  if (timeStore && timeStore.getState) {
                    currentDate = timeStore.getState().currentGameDate || new Date();
                  }
                } catch (timeError) {
                  console.warn("Failed to get game date, using current date:", timeError);
                }
                
                // Calculate months since purchase
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
              
              // Check if the item exists in the tracker
              const existingItem = assetTracker.lifestyleItems.find(trackerItem => trackerItem.id === item.id);
              
              if (existingItem) {
                // Update existing item
                assetTracker.updateLifestyleItem(item.id, itemValue);
              } else {
                // Add new item to tracker
                assetTracker.addLifestyleItem({
                  id: item.id,
                  name: item.name,
                  category: item.category || item.type || "other",
                  type: item.type,
                  purchaseDate: item.purchaseDate,
                  purchasePrice: item.purchasePrice || 0,
                  currentValue: itemValue
                });
              }
            } catch (itemValueError) {
              console.error(`Error calculating value for lifestyle item ${item.id}:`, itemValueError);
            }
          });
          console.log(`Updated ${state.lifestyleItems?.length || 0} lifestyle items in tracker`);
        } catch (lifestyleSyncError) {
          console.error("Error during lifestyle item syncing:", lifestyleSyncError);
        }
        
        // PHASE 8: FINAL CALCULATIONS AND VERIFICATION
        try {
          console.log("Phase 8: Final recalculation and verification");
          
          // Force a recalculation of totals
          assetTracker.recalculateTotals();
          
          // Verify asset counts in the tracker
          const finalState = useAssetTracker.getState();
          const finalCounts = {
            stocks: finalState.stocks.length,
            crypto: finalState.cryptoAssets.length,
            bonds: finalState.bonds.length,
            otherInvestments: finalState.otherInvestments.length,
            properties: finalState.properties.length,
            lifestyleItems: finalState.lifestyleItems.length,
            totalNetWorth: finalState.totalNetWorth
          };
          
          console.log("Final asset counts in tracker:", finalCounts);
          
          // Log unexpected discrepancies
          const characterStockCount = state.assets?.filter(a => a?.type === 'stock')?.length || 0;
          const characterCryptoCount = state.assets?.filter(a => a?.type === 'crypto')?.length || 0;
          const characterBondCount = state.assets?.filter(a => a?.type === 'bond')?.length || 0;
          const characterOtherCount = state.assets?.filter(a => a?.type === 'other')?.length || 0;
          
          if (finalCounts.stocks !== characterStockCount) {
            console.warn(`Stock count discrepancy: Character=${characterStockCount}, Tracker=${finalCounts.stocks}`);
          }
          
          if (finalCounts.crypto !== characterCryptoCount) {
            console.warn(`Crypto count discrepancy: Character=${characterCryptoCount}, Tracker=${finalCounts.crypto}`);
          }
          
          if (finalCounts.bonds !== characterBondCount) {
            console.warn(`Bond count discrepancy: Character=${characterBondCount}, Tracker=${finalCounts.bonds}`);
          }
          
          if (finalCounts.otherInvestments !== characterOtherCount) {
            console.warn(`Other investment count discrepancy: Character=${characterOtherCount}, Tracker=${finalCounts.otherInvestments}`);
          }
          
          if (finalCounts.properties !== (state.properties?.length || 0)) {
            console.warn(`Property count discrepancy: Character=${state.properties?.length || 0}, Tracker=${finalCounts.properties}`);
          }
          
          if (finalCounts.lifestyleItems !== (state.lifestyleItems?.length || 0)) {
            console.warn(`Lifestyle item count discrepancy: Character=${state.lifestyleItems?.length || 0}, Tracker=${finalCounts.lifestyleItems}`);
          }
        } catch (finalPhaseError) {
          console.error("Error during final recalculation and verification:", finalPhaseError);
        }
        
        console.log("=== ASSET SYNC COMPLETE (NORMAL MODE) ===");
      },
      
      // Daily/weekly/monthly updates
      syncPricesFromAssetTracker: () => {
        const state = get();
        
        // Safeguard: Ensure the AssetTracker is accessible
        if (!useAssetTracker) {
          console.error("CRITICAL ERROR: AssetTracker module not available");
          return;
        }
        
        // Get the asset tracker state
        const assetTracker = useAssetTracker.getState();
        if (!assetTracker) {
          console.error("CRITICAL ERROR: AssetTracker state not available");
          return;
        }
        
        console.log("PRICE SYNC: Updating character store with latest prices from asset tracker");
        
        // PHASE 1: STOCK PRICE SYNCING
        try {
          // For each stock in asset tracker, update the price in the character store
          assetTracker.stocks.forEach(trackerStock => {
            // Find the corresponding stock in character assets
            const characterAssetIndex = state.assets.findIndex(
              asset => asset.type === 'stock' && asset.id === trackerStock.id
            );
            
            if (characterAssetIndex >= 0) {
              const currentPrice = trackerStock.currentPrice;
              const currentAsset = state.assets[characterAssetIndex];
              
              // Only update if the price is different and valid
              if (currentPrice > 0 && currentPrice !== currentAsset.currentPrice) {
                // Create an updated asset with the new price
                set(state => {
                  const updatedAssets = [...state.assets];
                  const updatedAsset = {...updatedAssets[characterAssetIndex]};
                  updatedAsset.currentPrice = currentPrice;
                  // Calculate and update total value (may not have a totalValue property directly)
                  updatedAssets[characterAssetIndex] = updatedAsset;
                  
                  console.log(`PRICE SYNC: Updated ${updatedAsset.name} price in character store from ${currentAsset.currentPrice} to ${currentPrice}`);
                  
                  return { assets: updatedAssets };
                });
              }
            }
          });
          
          console.log("PRICE SYNC: Stock price sync complete");
        } catch (stockPriceSyncError) {
          console.error("Error during stock price syncing:", stockPriceSyncError);
        }
        
        // PHASE 2: PROPERTY VALUE SYNCING
        try {
          // For each property in asset tracker, update the value in character store
          assetTracker.properties.forEach(trackerProperty => {
            // Find the corresponding property in character properties
            const characterPropertyIndex = state.properties.findIndex(
              property => property.id === trackerProperty.id
            );
            
            if (characterPropertyIndex >= 0) {
              const currentValue = trackerProperty.currentValue;
              const currentProperty = state.properties[characterPropertyIndex];
              
              // Only update if the value is different and valid
              if (currentValue > 0 && currentValue !== currentProperty.currentValue) {
                // Create an updated property with the new value
                set(state => {
                  const updatedProperties = [...state.properties];
                  const updatedProperty = {...updatedProperties[characterPropertyIndex]};
                  updatedProperty.currentValue = currentValue;
                  // Property might not have equity/mortgage directly, but we can calculate it
                  // In our system, properties typically use loanAmount instead of mortgage
                  const loanAmount = updatedProperty.loanAmount || 0;
                  // Manually calculate equity (we don't need to store it directly)
                  updatedProperties[characterPropertyIndex] = updatedProperty;
                  
                  console.log(`PRICE SYNC: Updated ${updatedProperty.name} value in character store from ${currentProperty.currentValue} to ${currentValue}`);
                  
                  return { properties: updatedProperties };
                });
              }
            }
          });
          
          console.log("PRICE SYNC: Property value sync complete");
        } catch (propertyValueSyncError) {
          console.error("Error during property value syncing:", propertyValueSyncError);
        }
        
        // PHASE 3: CRYPTO PRICE SYNCING
        try {
          // For each crypto in asset tracker, update the price in character store
          if (assetTracker.cryptoAssets && Array.isArray(assetTracker.cryptoAssets)) {
            assetTracker.cryptoAssets.forEach(trackerCrypto => {
              // Find the corresponding crypto in character assets
              const characterAssetIndex = state.assets.findIndex(
                asset => asset.type === 'crypto' && asset.id === trackerCrypto.id
              );
              
              if (characterAssetIndex >= 0) {
                const currentPrice = trackerCrypto.currentPrice;
                const currentAsset = state.assets[characterAssetIndex];
                
                // Only update if the price is different and valid
                if (currentPrice > 0 && currentPrice !== currentAsset.currentPrice) {
                  // Create an updated asset with the new price
                  set(state => {
                    const updatedAssets = [...state.assets];
                    const updatedAsset = {...updatedAssets[characterAssetIndex]};
                    updatedAsset.currentPrice = currentPrice;
                    updatedAssets[characterAssetIndex] = updatedAsset;
                    
                    console.log(`PRICE SYNC: Updated ${updatedAsset.name} crypto price in character store from ${currentAsset.currentPrice} to ${currentPrice}`);
                    
                    return { assets: updatedAssets };
                  });
                }
              }
            });
            
            console.log("PRICE SYNC: Crypto price sync complete");
          } else {
            console.warn("PRICE SYNC: No crypto assets found in asset tracker or invalid data structure");
          }
        } catch (cryptoPriceSyncError) {
          console.error("Error during crypto price syncing:", cryptoPriceSyncError);
        }
        
        console.log("PRICE SYNC: Price synchronization from asset tracker to character complete");
      },
      
      processDailyUpdate: (forcedDayCounter = null) => {
        // Get current day and date from time store via registry, or use forced values for offline processing
        const timeStore = getStore('time');
        const timeState = timeStore ? timeStore.getState() : { 
          currentGameDate: new Date(), 
          currentDay: new Date().getDate(),
          currentMonth: new Date().getMonth() + 1 
        };
        const { currentGameDate, currentDay, currentMonth } = timeState;
        // Use forced day counter if provided (for offline processing), otherwise get from time state
        const dayCounter = forcedDayCounter !== null ? forcedDayCounter : timeState.dayCounter;
        
        // Log with more detail about which day counter we're using
        if (forcedDayCounter !== null) {
          console.log(`Processing daily update with FORCED day counter: ${dayCounter} (offline processing)`);
        } else {
          console.log(`Processing daily update with day counter: ${dayCounter} (live)`);
        }
        
        set((state) => {
          // Update days since promotion if employed
          let daysSincePromotion = state.daysSincePromotion;
          let dailyIncome = 0;
          
          // Update the current day in state for property income calculations
          state.currentDay = currentDay;
          
          // If the character has a job, check if we need to improve job-related skills
          if (state.job && state.job.monthsInPosition !== undefined) {            
            // Increment days since promotion counter first
            daysSincePromotion += 1;
            
            // Check if we've reached a 30-day milestone with the job
            // The daysSincePromotion counter tracks job tenure in days
            if (daysSincePromotion > 0 && daysSincePromotion % 30 === 0) {
              console.log(`30-day job milestone reached! Days since promotion: ${daysSincePromotion}`);
              
              // This is a critical section for job tenure - we're at a 30-day milestone
              // We need to properly increment the month counter
              
              // Get the current month count from the job
              const currentMonths = state.job.monthsInPosition;
              
              // Simply increment by 1 month since we've hit exactly 30 days
              const newMonthCount = currentMonths + 1;
              
              console.log(`Job tenure calculation: Current months: ${currentMonths}, New month count: ${newMonthCount}`);
              
              // Update the monthsInPosition counter on the job directly
              // This is the value shown in the Career tab UI
              state.job.monthsInPosition = newMonthCount;
              
              // Reset days to 1 (not 0) to maintain consistent counting
              daysSincePromotion = 1;
              
              console.log(`Updated job months in position to: ${state.job.monthsInPosition} and reset days to 1`);
              
              // Check if we've reached a 12-month milestone
              if (newMonthCount > 0 && newMonthCount % 12 === 0) {
                console.log(`12-month (1 year) job milestone reached! Converting to years.`);
                // We will handle the display in the UI with Math.floor(months/12) for years
                // No need to reset months to 0 since we use modulo for display
              }
              
              // Apply skill gains directly to the character's skills
              if (state.job.skillGains) {
                // Create a copy of the skills object to modify
                const updatedSkills = { ...state.skills };
                let totalGains = 0;
                
                // Apply each skill gain directly
                for (const [skillName, gainAmount] of Object.entries(state.job.skillGains)) {
                  const skill = skillName as keyof CharacterSkills;
                  if (skill in updatedSkills) {
                    // Apply the gain directly to the skill (up to the max of 1000)
                    const oldValue = updatedSkills[skill];
                    updatedSkills[skill] = Math.min(1000, updatedSkills[skill] + gainAmount);
                    const actualGain = updatedSkills[skill] - oldValue;
                    totalGains += actualGain;
                    
                    console.log(`Improved ${skill} skill by ${actualGain} points (from ${oldValue} to ${updatedSkills[skill]})`);
                  }
                }
                
                // Update the skills directly in the state
                state.skills = updatedSkills;
                
                // Log the skill improvements
                if (totalGains > 0) {
                  console.log(`Automatically improved job-related skills by ${totalGains} points after 30 days at ${state.job.title}`);
                }
                
                // Give the player 5 additional skill points to allocate manually
                const additionalPoints = 5;
                
                // Update the earned skill points that the player can allocate manually
                state.earnedSkillPoints = (state.earnedSkillPoints || 0) + additionalPoints;
                
                // Log the additional points
                console.log(`Awarded ${additionalPoints} flexible skill points for the player to allocate manually`);
                
                // Show a notification for the manual skill points
                toast.success(`Monthly 5 Skill Points Awarded`, {
                  position: 'top-center',
                  duration: 4000
                });
              }
            }
          }
          
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
            // If multiple items expired, batch them into a single notification 
            // instead of showing one per item
            const itemNames = expiredItems.map(item => item.name);
            
            // For multiple expired items, show a consolidated toast
            if (expiredItems.length > 1) {
              console.log(`${expiredItems.length} lifestyle items have expired and will be removed:`, itemNames);
              
              // Show a single consolidated toast for all expired items
              toast(`${expiredItems.length} lifestyle items have ended: ${itemNames.join(', ')}`, {
                duration: 5000,
                position: 'bottom-right',
                icon: '⏱️'
              });
            } else {
              // For a single expired item, show a simple toast
              console.log(`${itemNames[0]} has expired and will be removed.`);
              
              toast(`Your ${itemNames[0]} has ended.`, {
                duration: 5000,
                position: 'bottom-right',
                icon: '⏱️'
              });
            }
            
            // Process all expired items
            expiredItems.forEach(item => {
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
              
              // Calculate formatted currency string for logging only
              const formattedAmount = adjustedBiWeeklyIncome.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              });
              
              // Log paycheck info with a toast notification
              console.log(`Bi-weekly paycheck received: ${formattedAmount}`);
              
              // Show a toast notification for paychecks - players want to see when they get paid
              toast.success(`Bi-weekly Paycheck: ${formattedAmount}`, {
                position: 'top-right',
                duration: 5000,
                icon: '💰'
              });
            }
          }
          
          // Add property income (monthly instead of daily)
          let dailyPropertyIncome = 0;
          
          // Only add property income on the 1st day of each month
          if (state.currentDay === 1) {
            dailyPropertyIncome = state.properties.reduce((total, property) => {
              return total + property.income; // Full monthly income on 1st day
            }, 0);
            
            // Log property income for the month but don't toast (reducing notifications)
            if (dailyPropertyIncome > 0) {
              console.log(`Monthly property income received: ${dailyPropertyIncome.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}`);
            }
          }
          
          // Process lifestyle expenses
          const dailyLifestyleExpenses = state.lifestyleItems.reduce((total, item) => {
            // Use monthlyCost if available, otherwise calculate from maintenanceCost
            const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
            return total + (monthlyCost / 30); // Daily expense
          }, 0);
          
          // Check for startup investments that have reached maturity
          let startupReturns = 0;
          state.assets.forEach(asset => {
            // Only process startup investments (other type) that are active and have a maturity date
            if (asset.type === 'other' && asset.active !== false && 
                asset.maturityDay !== undefined && !asset.outcomeProcessed) {
                
              // Check if we've reached or passed the maturity date
              if (currentDay >= asset.maturityDay) {
                console.log(`Startup investment ${asset.name} has reached maturity day`);
                
                // Determine if the investment was successful based on probability
                const wasSuccessful = Math.random() < (asset.successChance || 0);
                
                // Get the return multiplier and set the outcome message
                let returnMultiplier = 0;
                let outcomeMessage = '';
                
                if (wasSuccessful) {
                  // Success outcome - get the return multiplier
                  returnMultiplier = asset.potentialReturnMultiple || 0;
                  
                  // Find the startup in our data to get the success message
                  const startupData = startupInvestments.find(s => s.id === asset.id);
                  outcomeMessage = startupData?.possibleOutcomes.success.message || 
                                   `${asset.name} was successful!`;
                  
                  // Calculate the return amount
                  const returnAmount = asset.purchasePrice * returnMultiplier;
                  startupReturns += returnAmount;
                  
                  // Show success notification with return amount
                  toast.success(
                    `Startup Success: ${outcomeMessage} You received a ${returnMultiplier}x return of ${formatCurrency(returnAmount)}!`,
                    { duration: 7000 }
                  );
                } else {
                  // Failure outcome - no return
                  // Find the startup in our data to get the failure message
                  const startupData = startupInvestments.find(s => s.id === asset.id);
                  outcomeMessage = startupData?.possibleOutcomes.failure.message || 
                                   `${asset.name} unfortunately failed.`;
                  
                  // Show failure notification
                  toast.error(
                    `Startup Failure: ${outcomeMessage} Your investment was lost.`,
                    { duration: 7000 }
                  );
                }
                
                // Update the asset with outcome information
                asset.outcomeProcessed = true;
                asset.wasSuccessful = wasSuccessful;
                asset.outcomeMessage = outcomeMessage;
                asset.active = false;
              }
            }
          });
          
          // Apply income and expenses (including any startup returns)
          const netDailyChange = dailyIncome + dailyPropertyIncome + startupReturns - dailyLifestyleExpenses;
          
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
          
          // Removed property income toast notification to reduce UI clutter
          // All financial details are now available in the Monthly Finances widget
          
          // Apply changes
          return { 
            daysSincePromotion,
            currentDay, // Make sure we return the current day to update state
            wealth: state.wealth + netDailyChange,
            netWorth: state.netWorth + netDailyChange,
            hunger,
            thirst,
            energy,
            comfort,
            health,
            // DO NOT overwrite monthsInPosition here - it's maintained by the 30-day milestone check
            job: state.job
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
        // Import the monthly finances calculator - fixed to use proper import
        // Using inline import to avoid circular dependencies
        const calculateMonthlyFinances = (state: any) => {
          // Basic calculation if the import fails
          let totalExpenses = 0;
          
          // Housing expenses
          if (state.housingType === 'rental') totalExpenses += 2000;
          else if (state.housingType === 'shared') totalExpenses += 800;
          else if (state.housingType === 'owned') totalExpenses += 3500;
          else if (state.housingType === 'luxury') totalExpenses += 8000;
          
          // Transportation expenses
          if (state.vehicleType === 'economy') totalExpenses += 350;
          else if (state.vehicleType === 'standard') totalExpenses += 500;
          else if (state.vehicleType === 'luxury') totalExpenses += 1200;
          else if (state.vehicleType === 'premium') totalExpenses += 2500;
          else if (state.vehicleType === 'bicycle') totalExpenses += 30;
          else totalExpenses += 150; // public transportation
          
          // Lifestyle expenses (from items)
          const lifestyleExpenses = state.lifestyleItems?.reduce((total: number, item: any) => {
            return total + (item.monthlyCost || 0);
          }, 0) || 0;
          
          totalExpenses += lifestyleExpenses;
          
          // Basic living expenses
          totalExpenses += 1000; // Food, utilities, etc.
          
          return {
            totalExpenses,
            housingExpenses: state.housingType === 'rental' ? 2000 : 
                           state.housingType === 'shared' ? 800 :
                           state.housingType === 'owned' ? 3500 :
                           state.housingType === 'luxury' ? 8000 : 0,
            transportationExpenses: state.vehicleType === 'economy' ? 350 :
                                 state.vehicleType === 'standard' ? 500 :
                                 state.vehicleType === 'luxury' ? 1200 :
                                 state.vehicleType === 'premium' ? 2500 :
                                 state.vehicleType === 'bicycle' ? 30 : 150,
            lifestyleExpenses,
            basicExpenses: 1000
          };
        };
        
        const state = get();
        
        // Use the centralized expense calculation to ensure consistency with the UI display
        const financeData = calculateMonthlyFinances(state);
        
        // Get the total expenses from the detailed calculation
        const totalMonthlyExpenses = financeData.totalExpenses;
        
        // Process mortgage payments and update equity for all properties
        // This must be done before deducting expenses
        if (state.properties.length > 0) {
          // Check if any properties have been paid off this month
          let paidOffProperties: string[] = [];
          
          // Process each property's mortgage payment
          const updatedProperties = state.properties.map(property => {
            // Skip if property has no mortgage
            if (!property.loanAmount || property.loanAmount <= 0) {
              return property;
            }
            
            // Calculate how much of the payment goes to principal vs interest
            const annualInterestRate = property.interestRate / 100;
            const monthlyInterestRate = annualInterestRate / 12;
            const interestPayment = property.loanAmount * monthlyInterestRate;
            const principalPayment = property.monthlyPayment - interestPayment;
            
            // Calculate new loan balance
            const newLoanAmount = Math.max(0, property.loanAmount - principalPayment);
            
            // If loan amount is very small (less than $1), consider it fully paid
            const finalLoanAmount = newLoanAmount < 1 ? 0 : newLoanAmount;
            
            // Check if property was just paid off (had a balance before, now zero)
            if (property.loanAmount > 0 && finalLoanAmount === 0) {
              paidOffProperties.push(property.name);
            }
            
            // Log the mortgage payment breakdown (console only, no toast)
            console.log(`Property mortgage payment for ${property.name}:`);
            console.log(`  Total payment: $${property.monthlyPayment.toFixed(2)}`);
            console.log(`  Interest portion: $${interestPayment.toFixed(2)}`);
            console.log(`  Principal portion: $${principalPayment.toFixed(2)}`);
            console.log(`  Previous loan balance: $${property.loanAmount.toFixed(2)}`);
            console.log(`  New loan balance: $${finalLoanAmount.toFixed(2)}`);
            
            // Return updated property with new loan amount
            return {
              ...property,
              loanAmount: finalLoanAmount,
              // Update equity (current value minus remaining loan)
              equity: property.currentValue - finalLoanAmount
            };
          });
          
          // Update properties in store
          set({ properties: updatedProperties });
          
          // Only show a toast if a property was fully paid off
          if (paidOffProperties.length > 0) {
            if (paidOffProperties.length === 1) {
              toast.success(`Congratulations! Your property "${paidOffProperties[0]}" is now fully paid off!`, {
                duration: 5000,
                position: 'bottom-right',
              });
            } else if (paidOffProperties.length > 1) {
              toast.success(`Multiple properties paid off: ${paidOffProperties.join(", ")}!`, {
                duration: 5000,
                position: 'bottom-right',
              });
            }
          }
          
          // Sync with asset tracker if it's available
          if (useAssetTracker) {
            const assetTracker = useAssetTracker.getState();
            
            // Update each property in the asset tracker
            updatedProperties.forEach(property => {
              if (assetTracker.updateProperty) {
                assetTracker.updateProperty(property.id, property.currentValue, property.loanAmount);
              }
            });
          }
        }
        
        // Apply the monthly expenses if we have any
        if (totalMonthlyExpenses > 0) {
          const oldWealth = state.wealth;
          
          // Deduct expenses using our method to ensure proper state updates
          get().deductWealth(totalMonthlyExpenses);
          
          // Get the updated state after deducting expenses
          const updatedState = get();
          
          // Log the expense transaction with clear indication (no toast)
          console.log(`MONTHLY EXPENSE DEDUCTION: ${formatCurrency(totalMonthlyExpenses)} has been deducted from your wealth.`);
          console.log(`Previous wealth: ${formatCurrency(oldWealth)}, new wealth: ${formatCurrency(updatedState.wealth)}`);
          console.log(`Expense breakdown:`, {
            housing: financeData.housingExpense,
            transportation: financeData.transportationExpense,
            food: financeData.foodExpense,
            healthcare: financeData.healthcareExpense,
            taxes: financeData.taxExpense,
            lifestyle: financeData.lifestyleExpenses,
            business: financeData.businessExpenses
          });
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
          
          // We'll only log tenure info in the monthly update but NOT modify it
          // The daily update function is solely responsible for incrementing months
          
          // This is just for debugging - tracking job tenure metrics
          const daysSincePromotion = state.daysSincePromotion;
          let updatedJob = state.job;
          
          if (updatedJob) {
            // Log the current tenure state for verification
            const currentMonths = updatedJob.monthsInPosition || 0;
            const daysSinceLastMonth = daysSincePromotion % 30;
            const daysIntoCurrentMonth = (daysSincePromotion - 1) % 30 + 1;
            
            console.log(`Monthly job tenure log: Months in position: ${currentMonths}, Days since promotion: ${daysSincePromotion}`);
            console.log(`Days since last month increase: ${daysSinceLastMonth}, Days into current month: ${daysIntoCurrentMonth}`);
            
            // DO NOT modify the monthsInPosition value - let the daily update handle it
            
            // Note: All job-related skill improvements are now handled directly 
            // in the daily update function based on job tenure (every 30 days)
            // No manual skill points are awarded - skills are improved automatically
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
        console.log("=== STARTING COMPLETE CHARACTER RESET ===");
        
        // Set a flag to indicate reset in progress
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('game_reset_in_progress', 'true');
          console.log("Set game_reset_in_progress flag in sessionStorage");
        }
        
        try {
          // PHASE 1: RESET ASSET TRACKER FIRST
          // This is critical - AssetTracker must be reset BEFORE character state
          console.log("PHASE 1: Resetting asset tracker store (CRITICAL)");
          
          try {
            const assetTracker = useAssetTracker.getState();
            if (assetTracker && typeof assetTracker.resetAssetTracker === 'function') {
              // Reset the asset tracker completely
              assetTracker.resetAssetTracker();
              
              // Force a recalculation to ensure clean totals
              assetTracker.recalculateTotals();
              
              // Verify the reset worked - log the state of the asset tracker
              const verifyState = useAssetTracker.getState();
              console.log("Asset tracker reset verification:", {
                stocks: verifyState.stocks.length,
                crypto: verifyState.cryptoAssets.length,
                bonds: verifyState.bonds.length,
                otherInvestments: verifyState.otherInvestments.length,
                properties: verifyState.properties.length,
                lifestyleItems: verifyState.lifestyleItems.length,
                totalNetWorth: verifyState.totalNetWorth
              });
              
              console.log("Successfully reset asset tracker store");
            } else {
              console.error("Failed to access asset tracker's reset function!");
            }
          } catch (assetTrackerError) {
            console.error("Error resetting asset tracker:", assetTrackerError);
          }
          
          // PHASE 2: CLEAR LOCALSTORAGE
          console.log("PHASE 2: Clearing all related localStorage entries");
          
          // Clear all related localStorage entries
          const keysToRemove = [
            'business-empire-networth-breakdown',
            'business-empire-asset-tracker',
            'business-empire-character',
            'business-empire-assets'
          ];
          
          if (typeof window !== 'undefined') {
            // Remove each key and report success/failure
            keysToRemove.forEach(key => {
              try {
                localStorage.removeItem(key);
                console.log(`Successfully removed ${key} from localStorage`);
                
                // Verify it's really gone
                const itemStillExists = localStorage.getItem(key);
                if (itemStillExists) {
                  console.error(`WARNING: Failed to remove ${key} from localStorage!`);
                }
              } catch (storageError) {
                console.error(`Error removing ${key} from localStorage:`, storageError);
              }
            });
            
            // Also set a flag in sessionStorage to indicate character reset is in progress
            sessionStorage.setItem('character_reset_completed', 'true');
            console.log("Set character_reset_completed flag in sessionStorage");
          }
          
          // PHASE 3: CLEAR IN-MEMORY DATA
          console.log("PHASE 3: Clearing in-memory data");
          
          const state = get();
          
          // Clear any in-memory breakdown data
          if ((state as any).netWorthBreakdown) {
            console.log("Nullifying existing netWorthBreakdown in memory");
            (state as any).netWorthBreakdown = null;
          }
          
          // Log existing asset counts for verification
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
        
        // Make sure to sync with asset tracker after reset
        try {
          console.log("Final step: syncing reset character state with asset tracker");
          
          // Wait a moment to ensure asset tracker has finished its own reset
          setTimeout(() => {
            try {
              get().syncAssetsWithAssetTracker();
              console.log("Successfully synced reset character with asset tracker");
            } catch (syncError) {
              console.error("Error syncing with asset tracker after reset:", syncError);
            }
          }, 100);
        } catch (finalSyncError) {
          console.error("Failed during final asset tracker sync:", finalSyncError);
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

// Register the character store in the global registry for cross-module access
// This enables other modules to access the store without circular dependencies
registerStore('character', useCharacter);

// Log when the character store is registered successfully
console.log('✅ Character Store: Registered in global store registry');

export default useCharacter;