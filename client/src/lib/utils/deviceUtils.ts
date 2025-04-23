/**
 * Utility functions for device detection and performance optimization
 */

/**
 * Detects if the current device is likely a mobile device
 * @returns {boolean} True if the device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent) || 
    (window.innerWidth <= 768 && 'ontouchstart' in window);
};

/**
 * Detects if the device likely has low performance capabilities
 * @returns {boolean} True if the device is likely a low-performance device
 */
export const isLowPerformanceDevice = (): boolean => {
  // Check if mobile first, which is a starting indicator
  const isMobile = isMobileDevice();
  
  // Additional checks for low performance
  // 1. Low memory (some browsers expose this)
  const hasLowMemory = (navigator as any).deviceMemory !== undefined && 
    (navigator as any).deviceMemory < 4;
    
  // 2. Limited CPU cores (some browsers expose this)
  const hasLimitedCores = (navigator as any).hardwareConcurrency !== undefined && 
    (navigator as any).hardwareConcurrency <= 4;
    
  // 3. Frame rate check (simplified - just check if there's a possible throttling)
  let hasLowFrameRate = false;
  if (window.requestAnimationFrame) {
    let frameCount = 0;
    let lastTime = 0;
    
    // Only do a quick sample to avoid performance impact
    const checkFrameRate = (timestamp: number) => {
      if (lastTime) {
        frameCount++;
        
        // Don't check for too long - just a quick sample
        if (frameCount > 10) {
          // If the average frame time is more than 20ms (less than 50fps),
          // it might indicate a low-performance device
          hasLowFrameRate = (timestamp - lastTime) / frameCount > 20;
        } else if (frameCount <= 10) {
          window.requestAnimationFrame(checkFrameRate);
        }
      }
      
      lastTime = timestamp;
      if (frameCount === 0) window.requestAnimationFrame(checkFrameRate);
    };
    
    window.requestAnimationFrame(checkFrameRate);
  }
  
  // Consider a device low-performance if it's mobile AND has at least one 
  // additional low-performance indicator
  return isMobile && (hasLowMemory || hasLimitedCores || hasLowFrameRate);
};

/**
 * Gets the recommended update interval for market prices based on device capability
 * @returns {number} The recommended interval in milliseconds
 */
export const getRecommendedUpdateInterval = (): number => {
  // Default update frequency for desktop: every second (1000ms)
  const standardInterval = 1000;
  
  // For low-performance devices, update less frequently: every 2-3 seconds
  const lowPerformanceInterval = 2500;
  
  // Mobile devices but not necessarily low performance: every 1.5 seconds
  const mobileInterval = 1500;
  
  if (isLowPerformanceDevice()) {
    return lowPerformanceInterval;
  } else if (isMobileDevice()) {
    return mobileInterval;
  }
  
  return standardInterval;
};

/**
 * Performance settings object to control various optimization features
 */
export const PerformanceSettings = {
  // Controls if asset updates should be batched to reduce render updates
  batchUpdates: true,
  
  // Controls if assets not in view should be updated less frequently
  throttleBackgroundAssets: true,
  
  // Maximum number of assets to update in a single batch
  maxAssetsPerBatch: 20,
  
  // Controls if settings UI should be shown to user
  showPerformanceSettings: true
};

/**
 * Gets visible assets from the current application state
 * Used to prioritize updates for assets the user is looking at
 * @param {any} assetTracker - The asset tracker instance
 * @returns {string[]} Array of asset IDs that are currently visible
 */
export const getVisibleAssets = (assetTracker: any): string[] => {
  // This implementation would depend on how the UI state is tracked
  // For now, we'll use a simplistic approach based on the current route
  
  // Get current route from window location
  const currentPath = window.location.pathname;
  
  // If on the investments page, all assets are potentially visible
  if (currentPath.includes('/investments')) {
    return assetTracker.getAllAssetIds();
  }
  
  // If on a specific asset detail page, only that asset is visible
  const assetMatch = currentPath.match(/\/asset\/([a-zA-Z0-9_-]+)/);
  if (assetMatch && assetMatch[1]) {
    return [assetMatch[1]];
  }
  
  // On dashboard, we might show top assets
  if (currentPath.includes('/dashboard')) {
    return assetTracker.getTopAssetsByValue(5).map((asset: any) => asset.id);
  }
  
  // Default: return a limited set of assets if we can't determine context
  return assetTracker.getAllAssetIds().slice(0, 10);
};

/**
 * Save performance settings to localStorage
 */
export const savePerformanceSettings = (): void => {
  try {
    localStorage.setItem('performanceSettings', JSON.stringify(PerformanceSettings));
  } catch (e) {
    console.error('Failed to save performance settings', e);
  }
};

/**
 * Load performance settings from localStorage
 */
export const loadPerformanceSettings = (): void => {
  try {
    const storedSettings = localStorage.getItem('performanceSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      
      // Apply stored settings to our PerformanceSettings object
      Object.assign(PerformanceSettings, parsedSettings);
    }
  } catch (e) {
    console.error('Failed to load performance settings', e);
  }
};

// Initialize settings when this module is loaded
loadPerformanceSettings();