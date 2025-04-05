import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type CharacterStartingWealth = 'bootstrapped' | 'middle-class' | 'wealthy';

export interface Asset {
  id: string;
  name: string;
  type: 'stock' | 'crypto' | 'bond' | 'startup';
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'mansion';
  value: number;
  income: number;
  expenses: number;
  purchaseDate: string;
}

export interface LifestyleItem {
  id: string;
  name: string;
  type: string;
  purchasePrice: number;
  maintenanceCost: number;
  happiness: number;
  prestige: number;
  
  // Extended attributes that may be present
  timeCommitment?: number;
  healthImpact?: number;
  stressReduction?: number;
  socialStatus?: number;
  skillDevelopment?: number;
  environmentalImpact?: number;
}

interface CharacterState {
  name: string;
  wealth: number;
  netWorth: number;
  happiness: number;
  prestige: number;
  
  // New character attributes
  stress: number; // 0-100 scale (0 = no stress, 100 = burnout)
  skills: number; // 0-100 scale (measure of developed skills)
  health: number; // 0-100 scale (100 = perfect health)
  socialConnections: number; // 0-100 scale (measure of social network)
  freeTime: number; // Hours per week available (max 168 total hours in a week)
  timeCommitment: number; // Hours committed per week
  environmentalImpact: number; // Negative to positive scale (-100 to 100)
  
  // Assets and possessions
  assets: Asset[];
  properties: Property[];
  lifestyleItems: LifestyleItem[];
  
  // Actions
  setName: (name: string) => void;
  createNewCharacter: (name: string, startingWealth: CharacterStartingWealth) => void;
  addWealth: (amount: number) => void;
  addAsset: (asset: Omit<Asset, 'quantity'> & { quantity?: number }) => void;
  removeAsset: (id: string, type: string) => void;
  addProperty: (property: Property) => void;
  sellProperty: (id: string) => void;
  addLifestyleItem: (item: LifestyleItem) => void;
  removeLifestyleItem: (id: string) => void; // Add remove function for items
  updateAttributes: (attributes: Partial<Omit<CharacterState, 'assets' | 'properties' | 'lifestyleItems'>>) => void;
  calculateNetWorth: () => number;
  resetProgress: () => void;
}

const STORAGE_KEY = 'luxury_lifestyle_character';

// Load from local storage if available
const loadSavedCharacter = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

export const useCharacter = create<CharacterState>()(
  subscribeWithSelector((set, get) => {
    // Try to load saved character
    const savedCharacter = loadSavedCharacter();
    
    return {
      // Default state - will be overwritten if saved data exists
      name: savedCharacter?.name || "",
      wealth: savedCharacter?.wealth || 0,
      netWorth: savedCharacter?.netWorth || 0,
      happiness: savedCharacter?.happiness || 50,
      prestige: savedCharacter?.prestige || 0,
      
      // New attributes with default values
      stress: savedCharacter?.stress || 20,
      skills: savedCharacter?.skills || 10,
      health: savedCharacter?.health || 70,
      socialConnections: savedCharacter?.socialConnections || 30,
      freeTime: savedCharacter?.freeTime || 80,
      timeCommitment: savedCharacter?.timeCommitment || 40, 
      environmentalImpact: savedCharacter?.environmentalImpact || 0,
      
      // Collections
      assets: savedCharacter?.assets || [],
      properties: savedCharacter?.properties || [],
      lifestyleItems: savedCharacter?.lifestyleItems || [],
      
      setName: (name) => set({ name }),
      
      createNewCharacter: (name, startingWealth) => {
        let initialWealth = 10000; // Bootstrapped
        
        if (startingWealth === 'middle-class') {
          initialWealth = 100000;
        } else if (startingWealth === 'wealthy') {
          initialWealth = 1000000;
        }
        
        const initialState = {
          name,
          wealth: initialWealth,
          netWorth: initialWealth,
          happiness: 50,
          prestige: startingWealth === 'wealthy' ? 20 : startingWealth === 'middle-class' ? 10 : 0,
          
          // Initial attributes based on starting wealth
          stress: startingWealth === 'wealthy' ? 10 : 20, // Rich people start less stressed
          skills: 10,
          health: 70,
          socialConnections: startingWealth === 'wealthy' ? 40 : 30,
          freeTime: 80,
          timeCommitment: 40,
          environmentalImpact: 0,
          
          // Collections
          assets: [],
          properties: [],
          lifestyleItems: []
        };
        
        set(initialState);
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, initialState);
      },
      
      addWealth: (amount) => {
        set((state) => {
          const newWealth = state.wealth + amount;
          const newState = { 
            wealth: newWealth, 
            netWorth: get().calculateNetWorth() 
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      addAsset: (assetInfo) => {
        set((state) => {
          const { id, type } = assetInfo;
          const existingAssetIndex = state.assets.findIndex(
            asset => asset.id === id && asset.type === type
          );
          
          let updatedAssets;
          
          if (existingAssetIndex >= 0) {
            // Update existing asset quantity
            updatedAssets = [...state.assets];
            const existingAsset = updatedAssets[existingAssetIndex];
            const quantity = assetInfo.quantity || 1;
            
            updatedAssets[existingAssetIndex] = {
              ...existingAsset,
              quantity: existingAsset.quantity + quantity
            };
          } else {
            // Add new asset
            const newAsset: Asset = {
              ...assetInfo as Asset,
              quantity: assetInfo.quantity || 1
            };
            updatedAssets = [...state.assets, newAsset];
          }
          
          const newState = { 
            assets: updatedAssets,
            netWorth: get().calculateNetWorth()
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      removeAsset: (id, type) => {
        set((state) => {
          const updatedAssets = state.assets.filter(
            asset => !(asset.id === id && asset.type === type)
          );
          
          const newState = { 
            assets: updatedAssets,
            netWorth: get().calculateNetWorth()
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      addProperty: (property) => {
        set((state) => {
          const updatedProperties = [...state.properties, property];
          
          const newState = { 
            properties: updatedProperties,
            netWorth: get().calculateNetWorth()
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      sellProperty: (id) => {
        set((state) => {
          const updatedProperties = state.properties.filter(
            property => property.id !== id
          );
          
          const newState = { 
            properties: updatedProperties,
            netWorth: get().calculateNetWorth()
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      addLifestyleItem: (item) => {
        set((state) => {
          // Get the existing item if any
          const existingItem = state.lifestyleItems.find(i => i.id === item.id);
          const isReplacing = !!existingItem;
          
          const updatedItems = [...state.lifestyleItems];
          
          // Check if we should replace an existing item of the same type
          if (item.type === 'vehicles' || item.type === 'housing') {
            // For these types, keep only the latest/highest prestige item
            const existingIndex = updatedItems.findIndex(existing => 
              existing.id === item.id || (existing.type === item.type && existing.prestige < item.prestige)
            );
            
            if (existingIndex >= 0) {
              updatedItems[existingIndex] = item;
            } else {
              updatedItems.push(item);
            }
          } else {
            // For other types, just add if not already owned
            if (!updatedItems.some(existing => existing.id === item.id)) {
              updatedItems.push(item);
            }
          }
          
          // Update happiness and prestige
          const newHappiness = Math.min(100, 
            state.happiness + item.happiness - (isReplacing ? existingItem.happiness : 0)
          );
          
          const newPrestige = state.prestige + item.prestige - 
            (isReplacing ? existingItem.prestige : 0);
          
          // Begin with basic state updates
          const newState: Partial<CharacterState> = { 
            lifestyleItems: updatedItems,
            happiness: newHappiness,
            prestige: newPrestige,
            netWorth: get().calculateNetWorth()
          };
          
          // Process the effects of lifestyle attributes if they exist
          // (We'll need to lookup the original item data to get its attributes)
          
          // For hobbies, there are time commitments to manage
          if (item.type === 'hobbies') {
            // Lookup item from original data (we'll need to do this from outside this function)
            // Simulating by managing just the time commitment for now
            newState.timeCommitment = state.timeCommitment + 
              (item.timeCommitment || 0) - (isReplacing ? (existingItem.timeCommitment || 0) : 0);
              
            newState.freeTime = Math.max(0, state.freeTime - 
              (item.timeCommitment || 0) + (isReplacing ? (existingItem.timeCommitment || 0) : 0));
          }
          
          // For all lifestyle items with health impacts
          if (item.healthImpact !== undefined) {
            newState.health = Math.min(100, Math.max(0, 
              state.health + (item.healthImpact || 0) - (isReplacing ? (existingItem.healthImpact || 0) : 0)
            ));
          }
          
          // For stress reduction
          if (item.stressReduction !== undefined) {
            newState.stress = Math.min(100, Math.max(0,
              state.stress - (item.stressReduction || 0) + (isReplacing ? (existingItem.stressReduction || 0) : 0)
            ));
          }
          
          // For social connections
          if (item.socialStatus !== undefined) {
            newState.socialConnections = Math.min(100, Math.max(0,
              state.socialConnections + (item.socialStatus || 0) - (isReplacing ? (existingItem.socialStatus || 0) : 0)
            ));
          }
          
          // For skill development
          if (item.skillDevelopment !== undefined) {
            newState.skills = Math.min(100, Math.max(0,
              state.skills + (item.skillDevelopment || 0) - (isReplacing ? (existingItem.skillDevelopment || 0) : 0)
            ));
          }
          
          // For environmental impact
          if (item.environmentalImpact !== undefined) {
            newState.environmentalImpact = Math.min(100, Math.max(-100,
              state.environmentalImpact + (item.environmentalImpact || 0) - 
              (isReplacing ? (existingItem.environmentalImpact || 0) : 0)
            ));
          }
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      calculateNetWorth: () => {
        const state = get();
        
        // Add liquid wealth
        let netWorth = state.wealth;
        
        // Add property values
        netWorth += state.properties.reduce((total, property) => total + property.value, 0);
        
        // Add asset values (simplified - in a real app, we'd use current market prices)
        // For now, we'll just use purchase price * quantity
        netWorth += state.assets.reduce((total, asset) => total + (asset.purchasePrice * asset.quantity), 0);
        
        // Add lifestyle item values (depreciated)
        // Luxury items lose value, so we calculate at 50% of purchase price
        netWorth += state.lifestyleItems.reduce((total, item) => 
          total + (item.purchasePrice * 0.5), 0
        );
        
        return netWorth;
      },
      
      // Remove lifestyle item and apply the reverse effects
      removeLifestyleItem: (id) => {
        set((state) => {
          const itemToRemove = state.lifestyleItems.find(item => item.id === id);
          if (!itemToRemove) return state; // If item not found, do nothing
          
          const updatedItems = state.lifestyleItems.filter(item => item.id !== id);
          
          // Basic attributes to update (reverse the effects)
          let newState: Partial<CharacterState> = { 
            lifestyleItems: updatedItems,
            happiness: Math.max(0, state.happiness - (itemToRemove.happiness || 0)),
            prestige: Math.max(0, state.prestige - (itemToRemove.prestige || 0)),
            netWorth: get().calculateNetWorth()
          };
          
          // Reverse the extended attribute effects
          
          // For time commitment
          if (itemToRemove.timeCommitment) {
            newState.timeCommitment = Math.max(0, state.timeCommitment - itemToRemove.timeCommitment);
            newState.freeTime = Math.min(168, state.freeTime + itemToRemove.timeCommitment);
          }
          
          // For health impacts
          if (itemToRemove.healthImpact !== undefined) {
            newState.health = Math.min(100, Math.max(0, state.health - itemToRemove.healthImpact));
          }
          
          // For stress reduction (reverse means adding back stress)
          if (itemToRemove.stressReduction !== undefined) {
            newState.stress = Math.min(100, Math.max(0, state.stress + itemToRemove.stressReduction));
          }
          
          // For social connections
          if (itemToRemove.socialStatus !== undefined) {
            newState.socialConnections = Math.min(100, Math.max(0, 
              state.socialConnections - itemToRemove.socialStatus));
          }
          
          // For skill development
          if (itemToRemove.skillDevelopment !== undefined) {
            newState.skills = Math.min(100, Math.max(0,
              state.skills - itemToRemove.skillDevelopment));
          }
          
          // For environmental impact
          if (itemToRemove.environmentalImpact !== undefined) {
            newState.environmentalImpact = Math.min(100, Math.max(-100,
              state.environmentalImpact - itemToRemove.environmentalImpact));
          }
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...newState });
          
          return newState;
        });
      },
      
      // Update character attributes (for applying lifestyle effects)
      updateAttributes: (attributes) => {
        set((state) => {
          // Apply updates with constraints to keep values in valid ranges
          const updatedAttributes: Partial<CharacterState> = {};
          
          // Process each attribute with its specific constraints
          if (attributes.stress !== undefined) {
            updatedAttributes.stress = Math.min(100, Math.max(0, attributes.stress));
          }
          
          if (attributes.skills !== undefined) {
            updatedAttributes.skills = Math.min(100, Math.max(0, attributes.skills));
          }
          
          if (attributes.health !== undefined) {
            updatedAttributes.health = Math.min(100, Math.max(0, attributes.health));
          }
          
          if (attributes.socialConnections !== undefined) {
            updatedAttributes.socialConnections = Math.min(100, Math.max(0, attributes.socialConnections));
          }
          
          if (attributes.happiness !== undefined) {
            updatedAttributes.happiness = Math.min(100, Math.max(0, attributes.happiness));
          }
          
          if (attributes.prestige !== undefined) {
            updatedAttributes.prestige = Math.max(0, attributes.prestige); // No upper limit on prestige
          }
          
          if (attributes.freeTime !== undefined) {
            updatedAttributes.freeTime = Math.max(0, attributes.freeTime);
          }
          
          if (attributes.timeCommitment !== undefined) {
            updatedAttributes.timeCommitment = Math.max(0, attributes.timeCommitment);
          }
          
          if (attributes.environmentalImpact !== undefined) {
            // Environmental impact can be negative (harmful) or positive (beneficial)
            updatedAttributes.environmentalImpact = Math.min(100, Math.max(-100, attributes.environmentalImpact));
          }
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, { ...state, ...updatedAttributes });
          
          return updatedAttributes;
        });
      },
      
      resetProgress: () => {
        // Reset the state to default values
        const defaultState = {
          name: "",
          wealth: 5000, // Starting cash
          netWorth: 5000,
          happiness: 50,
          prestige: 0,
          
          // Reset all new attributes too
          stress: 20,
          skills: 10,
          health: 70,
          socialConnections: 30,
          freeTime: 80,
          timeCommitment: 40,
          environmentalImpact: 0,
          
          // Collections
          assets: [],
          properties: [],
          lifestyleItems: []
        };
        
        set(defaultState);
        
        // Clear from local storage
        setLocalStorage(STORAGE_KEY, defaultState);
        
        // Reset achievements (by clearing localStorage for achievements)
        localStorage.removeItem('business-empire-achievements');
        
        // Also clear the claimed rewards to allow players to claim rewards for achievements they unlock again
        localStorage.removeItem('business-empire-claimed-rewards');
        
        // Just clear the time store data instead
        localStorage.removeItem('luxury_lifestyle_time');
        
        // Reset other stores if necessary
        // This approach ensures a clean slate when starting a new game
      }
    };
  })
);

// Set up a subscription to save character data when it changes
useCharacter.subscribe(
  (state) => state,
  (state) => {
    setLocalStorage(STORAGE_KEY, state);
  }
);
