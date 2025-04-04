import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useTime } from "./useTime";

export type MarketTrend = 'bull' | 'bear' | 'stable';
export type EconomyState = 'boom' | 'recession' | 'stable';

interface EconomyStore {
  // Economic indicators
  inflation: number;
  interestRate: number;
  economyState: EconomyState;
  marketTrend: MarketTrend;
  stockMarketHealth: number; // 0-100
  realEstateMarketHealth: number; // 0-100
  
  // Events
  activeEvents: EconomicEvent[];
  
  // Actions
  updateEconomy: () => void;
  triggerEvent: (event: EconomicEvent) => void;
  resolveEvent: (eventId: string) => void;
}

export interface EconomicEvent {
  id: string;
  name: string;
  description: string;
  impact: {
    inflation?: number;
    interestRate?: number;
    stockMarket?: number;
    realEstate?: number;
  };
  duration: number; // in days
  startDay: number;
}

export const useEconomy = create<EconomyStore>()(
  subscribeWithSelector((set, get) => ({
    inflation: 2.5,
    interestRate: 3.0,
    economyState: 'stable',
    marketTrend: 'stable',
    stockMarketHealth: 65,
    realEstateMarketHealth: 70,
    activeEvents: [],
    
    updateEconomy: () => {
      const { currentDay } = useTime.getState();
      
      // Process active events first
      const activeEvents = [...get().activeEvents];
      const remainingEvents = activeEvents.filter(event => {
        return currentDay - event.startDay < event.duration;
      });
      
      // Set our base values
      let newInflation = get().inflation;
      let newInterestRate = get().interestRate;
      let newStockMarketHealth = get().stockMarketHealth;
      let newRealEstateMarketHealth = get().realEstateMarketHealth;
      
      // Fluctuate a bit every day
      const inflationChange = (Math.random() - 0.5) * 0.3;
      const interestRateChange = (Math.random() - 0.5) * 0.2;
      const stockMarketChange = (Math.random() - 0.5) * 2;
      const realEstateChange = (Math.random() - 0.5) * 1;
      
      newInflation += inflationChange;
      newInterestRate += interestRateChange;
      newStockMarketHealth += stockMarketChange;
      newRealEstateMarketHealth += realEstateChange;
      
      // Add event impacts
      remainingEvents.forEach(event => {
        if (event.impact.inflation) newInflation += event.impact.inflation / event.duration;
        if (event.impact.interestRate) newInterestRate += event.impact.interestRate / event.duration;
        if (event.impact.stockMarket) newStockMarketHealth += event.impact.stockMarket / event.duration;
        if (event.impact.realEstate) newRealEstateMarketHealth += event.impact.realEstate / event.duration;
      });
      
      // Ensure values stay within reasonable ranges
      newInflation = Math.max(0, Math.min(15, newInflation));
      newInterestRate = Math.max(0, Math.min(20, newInterestRate));
      newStockMarketHealth = Math.max(10, Math.min(100, newStockMarketHealth));
      newRealEstateMarketHealth = Math.max(10, Math.min(100, newRealEstateMarketHealth));
      
      // Determine economy state
      let newEconomyState: EconomyState = 'stable';
      if (newInflation > 7 || newInterestRate > 10) {
        newEconomyState = 'recession';
      } else if (newInflation < 2 && newStockMarketHealth > 80) {
        newEconomyState = 'boom';
      }
      
      // Determine market trend
      let newMarketTrend: MarketTrend = 'stable';
      if (newStockMarketHealth > 75) {
        newMarketTrend = 'bull';
      } else if (newStockMarketHealth < 40) {
        newMarketTrend = 'bear';
      }
      
      set({
        inflation: parseFloat(newInflation.toFixed(1)),
        interestRate: parseFloat(newInterestRate.toFixed(1)),
        economyState: newEconomyState,
        marketTrend: newMarketTrend,
        stockMarketHealth: Math.round(newStockMarketHealth),
        realEstateMarketHealth: Math.round(newRealEstateMarketHealth),
        activeEvents: remainingEvents
      });
    },
    
    triggerEvent: (event) => {
      const { currentDay } = useTime.getState();
      const newEvent = { ...event, startDay: currentDay };
      
      set((state) => ({
        activeEvents: [...state.activeEvents, newEvent]
      }));
    },
    
    resolveEvent: (eventId) => {
      set((state) => ({
        activeEvents: state.activeEvents.filter(e => e.id !== eventId)
      }));
    }
  }))
);

// Set up a subscription to update the economy on day change
useTime.subscribe(
  state => state.currentDay,
  () => {
    useEconomy.getState().updateEconomy();
  }
);
