import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type EconomyState = "boom" | "recession" | "stable";
export type MarketTrend = "bull" | "bear" | "stable";
export type MarketHealth = "excellent" | "good" | "average" | "poor" | "critical";
export type VolatilityLevel = "low" | "medium" | "high" | "extreme";

// Helper function to convert numeric health value to market health category
export const getMarketHealthCategory = (healthValue: number): MarketHealth => {
  if (healthValue >= 80) return "excellent";
  if (healthValue >= 60) return "good";
  if (healthValue >= 40) return "average";
  if (healthValue >= 20) return "poor";
  return "critical";
};

interface EconomyStore {
  // Current state of the economy
  economyState: EconomyState;
  marketTrend: MarketTrend;
  
  // Market health indicators (0-100)
  stockMarketHealth: number;
  realEstateMarketHealth: number;
  
  // Helper methods for getting categorized health
  getStockMarketHealthCategory: () => MarketHealth;
  getRealEstateMarketHealthCategory: () => MarketHealth;
  
  // Economy factors
  inflation: number;
  interestRate: number;
  
  // Functions
  updateEconomy: () => void;
  processWeeklyUpdate: () => void; // Update economy trends weekly
  processMonthlyUpdate: () => void; // Process larger economic shifts monthly
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
      
      // Helper methods for getting categorized health
      getStockMarketHealthCategory: () => {
        return getMarketHealthCategory(get().stockMarketHealth);
      },
      
      getRealEstateMarketHealthCategory: () => {
        return getMarketHealthCategory(get().realEstateMarketHealth);
      },
      
      // Economy factors
      inflation: savedData?.inflation || 2.5,
      interestRate: savedData?.interestRate || 3.0,
      
      // Update economy based on time and random factors
      updateEconomy: () => {
        // This is a general update method that can be called any time
        // For now, it's a simple placeholder
        console.log("Updating economy...");
      },
      
      // Process weekly economic updates - called when dayCounter % 7 === 0
      processWeeklyUpdate: () => {
        const state = get();
        
        // Small fluctuations in market health (±1-3 points)
        const stockChange = (Math.random() * 6) - 3; // -3 to +3
        const realEstateChange = (Math.random() * 4) - 2; // -2 to +2
        
        // Update stock market health with small weekly fluctuations
        const newStockHealth = Math.max(0, Math.min(100, state.stockMarketHealth + stockChange));
        
        // Update real estate market with smaller fluctuations (more stable)
        const newRealEstateHealth = Math.max(0, Math.min(100, state.realEstateMarketHealth + realEstateChange));
        
        // Adjust market trend based on recent movements
        // Simple rule: If stock health is trending up over threshold, market is bullish
        let newMarketTrend = state.marketTrend;
        if (newStockHealth > 65 && state.marketTrend !== "bull") {
          newMarketTrend = "bull";
        } else if (newStockHealth < 35 && state.marketTrend !== "bear") {
          newMarketTrend = "bear";
        } else if (newStockHealth >= 35 && newStockHealth <= 65 && state.marketTrend !== "stable") {
          newMarketTrend = "stable";
        }
        
        // Update the state with all new values
        set({
          stockMarketHealth: newStockHealth,
          realEstateMarketHealth: newRealEstateHealth,
          marketTrend: newMarketTrend as MarketTrend
        });
        
        // Save state after all updates
        saveState();
        console.log("Weekly economy update processed");
      },
      
      // Process monthly economic updates - more significant shifts
      // Called when dayCounter % 30 === 0
      processMonthlyUpdate: () => {
        const state = get();
        
        // Larger monthly shifts (±2-5 points)
        const stockChange = (Math.random() * 10) - 5; // -5 to +5
        const realEstateChange = (Math.random() * 8) - 4; // -4 to +4
        
        // Economy state can shift based on market health
        // Simplistic model:
        // - Both markets healthy (>60) = boom
        // - Both markets poor (<40) = recession
        // - Mixed or average = stable
        const newStockHealth = Math.max(0, Math.min(100, state.stockMarketHealth + stockChange));
        const newRealEstateHealth = Math.max(0, Math.min(100, state.realEstateMarketHealth + realEstateChange));
        
        let newEconomyState = state.economyState;
        
        if (newStockHealth > 60 && newRealEstateHealth > 60) {
          newEconomyState = "boom";
        } else if (newStockHealth < 40 && newRealEstateHealth < 40) {
          newEconomyState = "recession";
        } else {
          newEconomyState = "stable";
        }
        
        // Small adjustments to inflation and interest rates
        // More complex in real economy but simplified here
        let newInflation = state.inflation;
        let newInterestRate = state.interestRate;
        
        // In boom: inflation tends up, interest rates follow
        // In recession: inflation tends down, interest rates lowered to stimulate
        if (newEconomyState === "boom") {
          newInflation += (Math.random() * 0.3); // Small increase
          if (newInflation > 4) {
            newInterestRate += (Math.random() * 0.2); // Rates rise to fight inflation
          }
        } else if (newEconomyState === "recession") {
          newInflation -= (Math.random() * 0.2); // Small decrease
          newInterestRate -= (Math.random() * 0.3); // Rates lower to stimulate
        } else {
          // Random small moves in stable economy
          newInflation += (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
          newInterestRate += (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
        }
        
        // Constrain values to realistic ranges
        newInflation = Math.max(0, Math.min(12, newInflation));
        newInterestRate = Math.max(0, Math.min(10, newInterestRate));
        
        // Update all values
        set({
          stockMarketHealth: newStockHealth,
          realEstateMarketHealth: newRealEstateHealth,
          economyState: newEconomyState as EconomyState,
          inflation: newInflation,
          interestRate: newInterestRate
        });
        
        // Save state after all updates
        saveState();
        console.log("Monthly economy update processed");
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