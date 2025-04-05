import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";
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
  purchasePrice: number;
  currentValue: number;
  monthlyIncome: number;
  purchaseDate: string;
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
  skillGains: Partial<CharacterSkills>;
  skillRequirements?: Partial<CharacterSkills>;
  careerTrack: string;
  level: number;
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
  
  // Skills (0-100)
  skills: CharacterSkills;
  
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
  createNewCharacter: (name: string, initialWealth: number, job: Job | null) => void;
  
  // Economy functions
  addWealth: (amount: number) => void;
  addIncome: (amount: number) => void;
  addExpense: (amount: number) => void;
  
  // Attributes
  addHappiness: (amount: number) => void;
  addStress: (amount: number) => void;
  addHealth: (amount: number) => void;
  addPrestige: (amount: number) => void;
  
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
  
  // Net worth calculation
  calculateNetWorth: () => number;
  
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
  
  skills: {
    intelligence: 50,
    creativity: 50,
    charisma: 50,
    technical: 50,
    leadership: 50
  },
  
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
      createNewCharacter: (name, initialWealth, job) => {
        const defaultCharacter = getDefaultCharacter();
        
        const newCharacter = {
          ...defaultCharacter,
          name,
          wealth: initialWealth,
          netWorth: initialWealth,
          job,
          income: job ? job.salary : 0
        };
        
        set(newCharacter as CharacterState);
        saveState();
      },
      
      // Economy functions
      addWealth: (amount) => {
        set((state) => ({ 
          wealth: state.wealth + amount,
          netWorth: state.netWorth + amount
        }));
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
      
      // Assets management
      addAsset: (asset) => {
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
              wealth: state.wealth - (asset.quantity * asset.currentPrice)
            };
          } else {
            // Add new asset
            return { 
              assets: [...state.assets, asset],
              wealth: state.wealth - (asset.quantity * asset.currentPrice)
            };
          }
        });
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
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
        set((state) => ({
          properties: [...state.properties, property],
          wealth: state.wealth - property.purchasePrice
        }));
        
        // Calculate new net worth
        const character = get();
        set({ netWorth: character.calculateNetWorth() });
        saveState();
      },
      
      sellProperty: (propertyId) => {
        let saleValue = 0;
        
        set((state) => {
          const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
          
          if (propertyIndex === -1) {
            return state; // Property not found
          }
          
          const property = state.properties[propertyIndex];
          saleValue = property.currentValue;
          
          return {
            properties: state.properties.filter(p => p.id !== propertyId),
            wealth: state.wealth + saleValue
          };
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
            monthlyIncome: property.monthlyIncome * multiplier
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
                    monthlyIncome: property.monthlyIncome * multiplier
                  };
                }
              } else {
                // No ID filter, update all properties of this type
                return {
                  ...property,
                  monthlyIncome: property.monthlyIncome * multiplier
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
        // If it has a purchase price, deduct from wealth
        let wealthAdjustment = 0;
        if (item.purchasePrice) {
          wealthAdjustment = -item.purchasePrice;
        }
        
        set((state) => ({
          lifestyleItems: [...state.lifestyleItems, item],
          expenses: state.expenses + item.monthlyCost,
          wealth: state.wealth + wealthAdjustment,
          happiness: Math.min(100, state.happiness + item.happiness),
          prestige: Math.min(100, state.prestige + item.prestige)
        }));
        
        // Calculate new net worth
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
          income: job.salary,
          daysSincePromotion: 0
        }));
        
        saveState();
      },
      
      promoteJob: (newJob) => {
        set((state) => {
          const oldJob = state.job;
          
          return {
            job: newJob,
            jobHistory: oldJob ? [...state.jobHistory, oldJob] : state.jobHistory,
            income: newJob.salary,
            daysSincePromotion: 0,
            prestige: Math.min(100, state.prestige + newJob.prestigeImpact),
            happiness: Math.min(100, state.happiness + newJob.happinessImpact),
            stress: Math.min(100, state.stress + newJob.stress)
          };
        });
        
        saveState();
      },
      
      quitJob: () => {
        set((state) => {
          const oldJob = state.job;
          
          return {
            job: null,
            jobHistory: oldJob ? [...state.jobHistory, oldJob] : state.jobHistory,
            income: 0,
            stress: Math.max(0, state.stress - 20), // Reduce stress
            happiness: Math.max(0, state.happiness - 10) // Temporary happiness loss
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
      
      // Calculate net worth
      calculateNetWorth: () => {
        const state = get();
        
        // Add cash
        let netWorth = state.wealth;
        
        // Add asset values
        netWorth += state.assets.reduce((total, asset) => {
          return total + (asset.currentPrice * asset.quantity);
        }, 0);
        
        // Add property values
        netWorth += state.properties.reduce((total, property) => {
          return total + property.currentValue;
        }, 0);
        
        return netWorth;
      },
      
      // Daily/weekly/monthly updates
      processDailyUpdate: () => {
        set((state) => {
          // Update days since promotion if employed
          let daysSincePromotion = state.daysSincePromotion;
          if (state.job) {
            daysSincePromotion += 1;
          }
          
          return { daysSincePromotion };
        });
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
          // Add income
          const updatedWealth = state.wealth + state.income - state.expenses;
          
          // Property income
          const propertyIncome = state.properties.reduce((total, property) => {
            return total + property.monthlyIncome;
          }, 0);
          
          // Calculate health effects based on stress and happiness
          const stressEffect = (state.stress > 70) ? -5 : (state.stress < 30) ? 2 : 0;
          const happinessEffect = (state.happiness > 70) ? 3 : (state.happiness < 30) ? -3 : 0;
          
          const updatedHealth = Math.max(0, Math.min(100, state.health + stressEffect + happinessEffect));
          
          return {
            wealth: updatedWealth + propertyIncome,
            health: updatedHealth
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
        set(defaultCharacter as CharacterState);
        saveState();
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