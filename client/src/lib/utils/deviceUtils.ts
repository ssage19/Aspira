/**
 * Device utilities for optimizing performance based on device capabilities
 * 
 * This module provides functions to detect device type, adjust settings
 * for performance optimization, and help with prioritizing visible content.
 */

// Standard performance settings that can be adjusted
export interface PerformanceSettingsType {
  // How many assets to process in a single batch
  maxAssetsPerBatch: number;
  
  // Whether to prioritize visible assets over background ones
  prioritizeVisibleAssets: boolean;
  
  // Whether to throttle updates for non-visible assets
  throttleBackgroundAssets: boolean;
  
  // Whether to batch updates to reduce UI redraws
  batchUpdates: boolean;
  
  // Base update interval in ms (will be modified based on device)
  baseUpdateInterval: number;
  
  // Whether to use progressive loading (load in stages)
  useProgressiveLoading: boolean;
  
  // Allow dynamic properties for type safety
  [key: string]: boolean | number;
}

// Default performance settings
export const PerformanceSettings: PerformanceSettingsType = {
  maxAssetsPerBatch: 15,
  prioritizeVisibleAssets: true,
  throttleBackgroundAssets: true,
  batchUpdates: true,
  baseUpdateInterval: 2000,
  useProgressiveLoading: true
};

/**
 * Device type detection
 * @returns The detected device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipod|android|blackberry|opera mini|windows phone|iemobile|mobile/i.test(userAgent);
  const isTablet = /ipad|android|kindle(?!.*(mobile))/i.test(userAgent) || 
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /macintosh/.test(userAgent));
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Determine if device is likely to need performance optimizations
 * @returns True if device needs optimizations
 */
export function isLowPerformanceDevice(): boolean {
  const deviceType = getDeviceType();
  
  // Basic check based on device type
  if (deviceType === 'mobile') return true;
  
  // Additional checks for older devices
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isOldEdge = /edge/i.test(navigator.userAgent) && !/edg/i.test(navigator.userAgent);
  
  // Check device memory if available
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) return true;
  }
  
  // Check for hardware concurrency
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores < 4) return true;
  }
  
  return false;
}

/**
 * Get the recommended update interval based on device capabilities
 * @returns The recommended update interval in milliseconds
 */
export function getRecommendedUpdateInterval(): number {
  const baseInterval = PerformanceSettings.baseUpdateInterval;
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile') return baseInterval * 3; // 3x longer intervals for mobile
  if (deviceType === 'tablet') return baseInterval * 1.5; // 1.5x longer intervals for tablets
  
  return baseInterval; // Default for desktop
}

/**
 * Gets a set of asset IDs that should be considered visible
 * (prioritized for updates)
 */
export function getVisibleAssets(assetTracker: any): string[] {
  try {
    // Get owned assets - these are always high priority
    const ownedAssets = assetTracker.getAllAssetsWithQuantities();
    const ownedAssetIds = Object.keys(ownedAssets).filter(id => ownedAssets[id] > 0);
    
    // Get recently viewed assets from localStorage
    const recentlyViewed: string[] = [];
    try {
      const stored = localStorage.getItem('recently_viewed_assets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          recentlyViewed.push(...parsed);
        }
      }
    } catch (e) {
      console.error('Error getting recently viewed assets:', e);
    }
    
    // Combine owned and recently viewed (using Array.from to support older browsers)
    const combined = [...ownedAssetIds, ...recentlyViewed];
    return Array.from(new Set(combined));
  } catch (e) {
    console.error('Error getting visible assets:', e);
    return [];
  }
}

/**
 * Toggles a performance setting
 */
export function togglePerformanceSetting(setting: keyof PerformanceSettingsType): void {
  // Type guard to ensure we're only toggling boolean settings
  if (typeof PerformanceSettings[setting] === 'boolean') {
    // Use type assertion to handle the toggle
    const currentValue = PerformanceSettings[setting] as boolean;
    (PerformanceSettings[setting] as boolean) = !currentValue;
  }
}

/**
 * Updates a numeric performance setting
 */
export function updatePerformanceSetting(setting: keyof PerformanceSettingsType, value: number): void {
  // Type guard to ensure we're only updating numeric settings
  if (typeof PerformanceSettings[setting] === 'number') {
    // Use type assertion to assign the new value
    (PerformanceSettings[setting] as number) = value;
  }
}

/**
 * Reset all performance settings to defaults
 */
export function resetPerformanceSettings(): void {
  PerformanceSettings.maxAssetsPerBatch = 15;
  PerformanceSettings.prioritizeVisibleAssets = true;
  PerformanceSettings.throttleBackgroundAssets = true;
  PerformanceSettings.batchUpdates = true;
  PerformanceSettings.baseUpdateInterval = 2000;
  PerformanceSettings.useProgressiveLoading = true;
}

/**
 * Apply optimized settings for very low-end devices
 */
export function applyLowPerformanceMode(): void {
  PerformanceSettings.maxAssetsPerBatch = 5;
  PerformanceSettings.prioritizeVisibleAssets = true;
  PerformanceSettings.throttleBackgroundAssets = true;
  PerformanceSettings.batchUpdates = true;
  PerformanceSettings.baseUpdateInterval = 5000;
  PerformanceSettings.useProgressiveLoading = true;
}

/**
 * Apply maximum performance settings for high-end devices
 */
export function applyHighPerformanceMode(): void {
  PerformanceSettings.maxAssetsPerBatch = 50;
  PerformanceSettings.prioritizeVisibleAssets = true;
  PerformanceSettings.throttleBackgroundAssets = false;
  PerformanceSettings.batchUpdates = false;
  PerformanceSettings.baseUpdateInterval = 1000;
  PerformanceSettings.useProgressiveLoading = false;
}