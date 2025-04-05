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
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Check if the game is running in emergency mode
 * Emergency mode is a simplified version of the game that works
 * without 3D/WebGL to prevent crashes
 * @returns Boolean indicating if emergency mode is active
 */
export const isEmergencyMode = (): boolean => {
  const emergencyMode = getLocalStorage('emergency-mode');
  return emergencyMode === true;
};

/**
 * Set the emergency mode state in local storage
 * @param enabled Whether emergency mode should be enabled
 */
export const setEmergencyMode = (enabled: boolean): void => {
  setLocalStorage('emergency-mode', enabled);
};

export { getLocalStorage, setLocalStorage };
