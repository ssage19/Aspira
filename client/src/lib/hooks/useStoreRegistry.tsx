import { useState, useEffect } from 'react';
import { getStore } from '../utils/storeRegistry';

/**
 * Custom hook for accessing stores from the registry with React state integration
 * 
 * @param storeName The name of the store in the registry
 * @param selector Function to select specific parts of the store state
 * @returns Selected state from the store, updates when store changes
 */
export function useStoreRegistry<T, S>(
  storeName: string,
  selector: (state: any) => T,
  defaultValue: T
): T {
  const [state, setState] = useState<T>(defaultValue);
  
  useEffect(() => {
    const store = getStore(storeName);
    
    if (store) {
      // Get initial state
      const currentState = store.getState();
      setState(selector(currentState));
      
      // Subscribe to changes
      const unsubscribe = store.subscribe(
        (newState: any) => {
          setState(selector(newState));
        }
      );
      
      // Clean up subscription
      return unsubscribe;
    } else {
      console.warn(`Store '${storeName}' not found in registry`);
    }
  }, [storeName]);
  
  return state;
}

/**
 * Helper hook specifically for the character store
 * 
 * @param selector Function to select specific parts of the character state
 * @param defaultValue Default value to use if store isn't available
 * @returns Selected state from the character store
 */
export function useCharacterRegistry<T>(
  selector: (state: any) => T,
  defaultValue: T
): T {
  return useStoreRegistry('character', selector, defaultValue);
}

/**
 * Hook to get a method from a store in the registry
 * 
 * @param storeName The name of the store in the registry
 * @param methodName The name of the method to get
 * @returns The method from the store, or a no-op function if not found
 */
export function useStoreMethod(storeName: string, methodName: string): (...args: any[]) => any {
  const [method, setMethod] = useState<(...args: any[]) => any>(() => (...args: any[]) => {
    console.warn(`Method '${methodName}' from store '${storeName}' not available`);
    return null;
  });
  
  useEffect(() => {
    const store = getStore(storeName);
    if (store) {
      const storeMethod = store.getState()[methodName];
      if (typeof storeMethod === 'function') {
        setMethod(() => (...args: any[]) => store.getState()[methodName](...args));
      } else {
        console.warn(`Method '${methodName}' not found in store '${storeName}'`);
      }
    } else {
      console.warn(`Store '${storeName}' not found in registry`);
    }
  }, [storeName, methodName]);
  
  return method;
}