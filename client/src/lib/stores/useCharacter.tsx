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
}

interface CharacterState {
  name: string;
  wealth: number;
  netWorth: number;
  happiness: number;
  prestige: number;
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
  calculateNetWorth: () => number;
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
            state.happiness + item.happiness - (state.lifestyleItems.some(i => i.id === item.id) ? 0 : 0)
          );
          
          const newPrestige = state.prestige + item.prestige - 
            (state.lifestyleItems.some(i => i.id === item.id) ? state.lifestyleItems.find(i => i.id === item.id)?.prestige || 0 : 0);
          
          const newState = { 
            lifestyleItems: updatedItems,
            happiness: newHappiness,
            prestige: newPrestige,
            netWorth: get().calculateNetWorth()
          };
          
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
