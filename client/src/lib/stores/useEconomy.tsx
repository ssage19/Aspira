import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type EconomyState = "boom" | "recession" | "stable";
export type MarketTrend = "bull" | "bear" | "stable";
export type MarketHealth = "excellent" | "good" | "average" | "poor" | "critical";
export type VolatilityLevel = "low" | "medium" | "high" | "extreme";

interface EconomyStore {
  // Current state of the economy
  economyState: EconomyState;
  marketTrend: MarketTrend;
  
  // Market health indicators (0-100)
  stockMarketHealth: number;
  realEstateMarketHealth: number;
  
  // Economy factors
  inflation: number;
  interestRate: number;
  
  // Functions
  updateEconomy: () => void;
  setEconomyState: (state: EconomyState) => void;
  setMarketTrend: (trend: MarketTrend) => void;
  setStockMarketHealth: (health: number) => void;
  setRealEstateMarketHealth: (health: number) => void;
  setInflation: (rate: number) => void;
  setInterestRate: (rate: number) => void;
}

const STORAGE_KEY = 'business-empire-economy';

// Load from local storage if available
const loadEconomyData = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

export const useEconomy = create<EconomyStore>()(
  subscribeWithSelector((set, get) => {
    // Try to load saved data
    const savedData = loadEconomyData();
    
    return {
      // Economy state
      economyState: savedData?.economyState || "stable",
      marketTrend: savedData?.marketTrend || "stable",
      
      // Market health indicators
      stockMarketHealth: savedData?.stockMarketHealth || 50,
      realEstateMarketHealth: savedData?.realEstateMarketHealth || 50,
      
      // Economy factors
      inflation: savedData?.inflation || 2.5,
      interestRate: savedData?.interestRate || 3.0,
      
      // Update economy based on time and random factors
      updateEconomy: () => {
        // This would eventually implement a more complex economic model
        // For now, it's a simple placeholder
        console.log("Updating economy...");
      },
      
      // Setters for each property
      setEconomyState: (state: EconomyState) => {
        set({ economyState: state });
        saveState();
      },
      
      setMarketTrend: (trend: MarketTrend) => {
        set({ marketTrend: trend });
        saveState();
      },
      
      setStockMarketHealth: (health: number) => {
        set({ stockMarketHealth: Math.max(0, Math.min(100, health)) });
        saveState();
      },
      
      setRealEstateMarketHealth: (health: number) => {
        set({ realEstateMarketHealth: Math.max(0, Math.min(100, health)) });
        saveState();
      },
      
      setInflation: (rate: number) => {
        set({ inflation: Math.max(0, rate) });
        saveState();
      },
      
      setInterestRate: (rate: number) => {
        set({ interestRate: Math.max(0, rate) });
        saveState();
      }
    };
  })
);

// Helper function to save the current state to localStorage
function saveState() {
  const state = useEconomy.getState();
  setLocalStorage(STORAGE_KEY, state);
}

export default useEconomy;