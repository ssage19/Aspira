import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));
  
/**
 * Complete game reset function that ensures all game state is properly reset
 * This includes clearing localStorage, resetting all stores, and forcing a page reload
 */
export const performCompleteGameReset = () => {
  // 1. List of all known localStorage keys used in the game
  const allGameStorageKeys = [
    'business-empire-game',
    'business-empire-character',
    'business-empire-events',
    'luxury_lifestyle_time',
    'business-empire-economy',
    'business-empire-claimed-rewards',
    'auto-maintain-needs'
  ];
  
  // 2. Clear each specific key to ensure nothing is missed
  allGameStorageKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // 3. Also do a complete localStorage.clear() for any keys we might have missed
  localStorage.clear();
  
  // 4. Add a flag to indicate we're in the process of resetting
  // This can be checked on character creation page to ensure proper initialization
  sessionStorage.setItem('game_reset_in_progress', 'true');
  
  // 5. Force navigation to character creation page
  window.location.href = '/create';
  
  // 6. After a short delay, do a complete page reload
  // This is necessary to fully reinitialize all JavaScript state
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

/**
 * Format a number as currency with no decimal places
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string with no decimal places
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

/**
 * Format a stock price with exactly 2 decimal places
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string with 2 decimal places
 */
export const formatStockPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as an integer (no decimal places)
 * @param num The number to format
 * @returns Formatted integer string
 */
export const formatInteger = (num: number): string => {
  return Math.round(num).toString();
};

/**
 * Format a number as a percentage with specified decimal places
 * @param value The number to format (e.g., 0.1234 for 12.34%)
 * @param fixed The number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "12.3%")
 */
export const formatPercentage = (value: number, fixed: number = 1): string => {
  return (value * 100).toFixed(fixed) + '%';
};

export { getLocalStorage, setLocalStorage };
