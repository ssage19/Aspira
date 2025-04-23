import React, { useEffect, useState } from 'react';
import { 
  isMobileDevice, 
  isLowPerformanceDevice, 
  PerformanceSettings, 
  savePerformanceSettings,
  getRecommendedUpdateInterval
} from '../lib/utils/deviceUtils';
import { toast } from 'sonner';

/**
 * Performance Optimizer Component
 * 
 * Adds a performance settings UI and applies optimizations for mobile devices
 */
export const PerformanceOptimizer: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isLowPerformance: false,
    recommendedInterval: 1000 // default 1 second
  });
  const [useOptimized, setUseOptimized] = useState(false);

  useEffect(() => {
    // Check device capabilities
    const isMobile = isMobileDevice();
    const isLowPerformance = isLowPerformanceDevice();
    const recommendedInterval = getRecommendedUpdateInterval();

    // Load preference from localStorage
    const savedPreference = localStorage.getItem('useOptimizedMarketUpdater');
    setUseOptimized(savedPreference === 'true');

    setDeviceInfo({
      isMobile,
      isLowPerformance,
      recommendedInterval
    });

    // Apply automatic optimizations based on device
    if (isMobile) {
      console.log('PerformanceOptimizer: Mobile device detected, applying performance optimizations');
      
      // For very low performance devices, apply more aggressive optimizations
      if (isLowPerformance) {
        console.log('PerformanceOptimizer: Low performance device detected, applying additional optimizations');
        PerformanceSettings.maxAssetsPerBatch = 10; // Reduce the batch size
      }
      
      // Save settings
      savePerformanceSettings();
    }
  }, []);

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // Update a performance setting
  const updateSetting = (key: keyof typeof PerformanceSettings, value: boolean | number) => {
    (PerformanceSettings as any)[key] = value;
    savePerformanceSettings();
    
    // Show confirmation toast
    toast.success('Performance setting updated');
  };
  
  // Toggle between standard and optimized updater
  const toggleOptimizedUpdater = (enabled: boolean) => {
    setUseOptimized(enabled);
    localStorage.setItem('useOptimizedMarketUpdater', String(enabled));
    
    // Show message that changes will take effect after refresh
    toast.info('Optimization setting will take effect after page refresh', {
      duration: 5000,
      action: {
        label: 'Refresh Now',
        onClick: () => window.location.reload()
      }
    });
  };

  // Only render if settings should be shown
  if (!PerformanceSettings.showPerformanceSettings) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleSettings}
        className="bg-primary text-white rounded-full p-2 shadow-lg"
        aria-label="Performance Settings"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {showSettings && (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 mt-2 w-72">
          <h3 className="font-medium mb-2">Performance Settings</h3>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Device Info:</p>
            <ul className="text-xs space-y-1">
              <li>• Device Type: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</li>
              <li>• Performance: {deviceInfo.isLowPerformance ? 'Limited' : 'Standard'}</li>
              <li>• Recommended Update: {deviceInfo.recommendedInterval}ms</li>
            </ul>
          </div>
          
          <div className="space-y-3 py-2 border-y mb-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="use-optimized">
                Use Optimized Market Updater
              </label>
              <input
                id="use-optimized"
                type="checkbox"
                checked={useOptimized}
                onChange={e => toggleOptimizedUpdater(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {useOptimized 
                ? 'Using mobile-optimized updater with reduced CPU usage'
                : 'Using standard updater with 1-second updates'}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm" htmlFor="batch-updates">Batch Updates</label>
              <input
                id="batch-updates"
                type="checkbox"
                checked={PerformanceSettings.batchUpdates}
                onChange={e => updateSetting('batchUpdates', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm" htmlFor="throttle-bg">Throttle Background</label>
              <input
                id="throttle-bg"
                type="checkbox"
                checked={PerformanceSettings.throttleBackgroundAssets}
                onChange={e => updateSetting('throttleBackgroundAssets', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            
            <div>
              <label className="text-sm block mb-1" htmlFor="batch-size">
                Max Assets Per Batch: {PerformanceSettings.maxAssetsPerBatch}
              </label>
              <input
                id="batch-size"
                type="range"
                min="5"
                max="50"
                step="5"
                value={PerformanceSettings.maxAssetsPerBatch}
                onChange={e => updateSetting('maxAssetsPerBatch', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Optimizing for performance may reduce animation smoothness but improve battery life and responsiveness.
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizer;