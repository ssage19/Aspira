/**
 * StoreRegistry - Global Registry for Store Management
 * 
 * This utility provides a centralized registry for all application stores,
 * enabling cross-module store access without circular dependencies.
 * 
 * It uses a global window-based approach to ensure stores are accessible
 * across the entire application, even when imported from different modules.
 */

// Registry interface
export interface StoreRegistry {
  [key: string]: any;
}

// Get or create the global registry
function getRegistry(): StoreRegistry {
  if (typeof window === 'undefined') {
    // For SSR or non-browser environments, return an empty object
    return {};
  }
  
  // Create the registry if it doesn't exist
  if (!(window as any).__GLOBAL_STORE_REGISTRY) {
    (window as any).__GLOBAL_STORE_REGISTRY = {};
  }
  
  return (window as any).__GLOBAL_STORE_REGISTRY;
}

/**
 * Initialize the global store registry
 * This ensures we have a place to register stores even in SSR environments
 */
export function initializeStoreRegistry(): void {
  getRegistry();
  console.log('✅ StoreRegistry: Initialized global registry');
}

/**
 * Register a store instance in the global registry
 * 
 * @param name The name/key under which to register the store
 * @param store The store instance to register
 * @returns boolean indicating success
 */
export function registerStore(name: string, store: any): boolean {
  try {
    const registry = getRegistry();
    registry[name] = store;
    console.log(`✅ StoreRegistry: Registered store '${name}'`);
    return true;
  } catch (error) {
    console.error(`❌ StoreRegistry: Failed to register store '${name}':`, error);
    return false;
  }
}

/**
 * Get a store instance from the global registry
 * 
 * @param name The name/key of the store to retrieve
 * @returns The store instance or null if not found
 */
export function getStore(name: string): any {
  try {
    const registry = getRegistry();
    const store = registry[name];
    
    if (!store) {
      console.warn(`⚠️ StoreRegistry: Store '${name}' not found in registry`);
      return null;
    }
    
    return store;
  } catch (error) {
    console.error(`❌ StoreRegistry: Error getting store '${name}':`, error);
    return null;
  }
}

/**
 * Check if a store exists in the registry
 * 
 * @param name The name/key of the store to check
 * @returns boolean indicating if the store exists
 */
export function hasStore(name: string): boolean {
  try {
    const registry = getRegistry();
    return !!registry[name];
  } catch (error) {
    console.error(`❌ StoreRegistry: Error checking store '${name}':`, error);
    return false;
  }
}

/**
 * Get all registered store names
 * 
 * @returns Array of store names or empty array if none found
 */
export function getAllStoreNames(): string[] {
  try {
    const registry = getRegistry();
    return Object.keys(registry);
  } catch (error) {
    console.error('❌ StoreRegistry: Error getting all store names:', error);
    return [];
  }
}

// Initialize the registry on module load
initializeStoreRegistry();