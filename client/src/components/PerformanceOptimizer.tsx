import React, { useState, useEffect } from 'react';
import { 
  PerformanceSettings, 
  getDeviceType, 
  isLowPerformanceDevice,
  applyLowPerformanceMode,
  applyHighPerformanceMode,
  resetPerformanceSettings,
  updatePerformanceSetting,
  togglePerformanceSetting
} from '../lib/utils/deviceUtils';

/**
 * Performance Optimizer Component
 * 
 * Adds a performance settings UI and applies optimizations for mobile devices
 */
export const PerformanceOptimizer: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'unknown',
    needsOptimization: false
  });
  
  // Initialize optimization detection on component mount
  useEffect(() => {
    // Detect device type and optimization needs
    const deviceType = getDeviceType();
    const needsOptimization = isLowPerformanceDevice();
    
    setDeviceInfo({
      type: deviceType,
      needsOptimization
    });
    
    // Auto-apply low performance mode for mobile devices
    if (needsOptimization) {
      console.log('PerformanceOptimizer: Automatically applying low performance mode for mobile device');
      applyLowPerformanceMode();
    }
    
    // Store device type in localStorage for other components
    localStorage.setItem('device_type', deviceType);
    localStorage.setItem('needs_optimization', String(needsOptimization));
  }, []);
  
  // Toggle settings visibility
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  // Apply a preset configuration
  const applyPreset = (preset: 'low' | 'medium' | 'high') => {
    switch (preset) {
      case 'low':
        applyLowPerformanceMode();
        break;
      case 'medium':
        resetPerformanceSettings();
        break;
      case 'high':
        applyHighPerformanceMode();
        break;
    }
  };
  
  // Helper to toggle a boolean setting
  const handleToggle = (setting: 'prioritizeVisibleAssets' | 'throttleBackgroundAssets' | 'batchUpdates' | 'useProgressiveLoading') => {
    togglePerformanceSetting(setting);
    // Force re-render
    setShowSettings(prev => !prev);
    setShowSettings(prev => !prev);
  };
  
  // Helper to update a number setting
  const handleNumberChange = (setting: 'maxAssetsPerBatch' | 'baseUpdateInterval', value: number) => {
    updatePerformanceSetting(setting, value);
    // Force re-render
    setShowSettings(prev => !prev);
    setShowSettings(prev => !prev);
  };
  
  // The component is hidden unless the settings UI is activated
  if (!showSettings) {
    return (
      <button 
        onClick={toggleSettings}
        className="fixed bottom-16 right-2 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg text-xs"
        aria-label="Performance Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Settings</h2>
          <button 
            onClick={toggleSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Device detected:</strong> {deviceInfo.type.charAt(0).toUpperCase() + deviceInfo.type.slice(1)}
            {deviceInfo.needsOptimization && (
              <span className="block mt-1">
                ⚠️ Performance optimizations are recommended for this device.
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quick Presets</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => applyPreset('low')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
              >
                Power Saving
              </button>
              <button 
                onClick={() => applyPreset('medium')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
              >
                Balanced
              </button>
              <button 
                onClick={() => applyPreset('high')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Performance
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Detailed Settings</h3>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Batch Processing Size
              </label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleNumberChange('maxAssetsPerBatch', Math.max(5, PerformanceSettings.maxAssetsPerBatch - 5))}
                  className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  -
                </button>
                <span className="text-sm w-8 text-center">{PerformanceSettings.maxAssetsPerBatch}</span>
                <button 
                  onClick={() => handleNumberChange('maxAssetsPerBatch', PerformanceSettings.maxAssetsPerBatch + 5)}
                  className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Update Interval (ms)
              </label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleNumberChange('baseUpdateInterval', Math.max(500, PerformanceSettings.baseUpdateInterval - 500))}
                  className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  -
                </button>
                <span className="text-sm w-14 text-center">{PerformanceSettings.baseUpdateInterval}</span>
                <button 
                  onClick={() => handleNumberChange('baseUpdateInterval', PerformanceSettings.baseUpdateInterval + 500)}
                  className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Prioritize Visible Assets
              </label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={PerformanceSettings.prioritizeVisibleAssets}
                  onChange={() => handleToggle('prioritizeVisibleAssets')}
                />
                <div 
                  className={`block h-6 rounded-full w-10 cursor-pointer ${PerformanceSettings.prioritizeVisibleAssets ? 'bg-green-400' : 'bg-gray-400'}`}
                  onClick={() => handleToggle('prioritizeVisibleAssets')}
                >
                  <div 
                    className={`absolute left-1 top-1 bg-white rounded-full h-4 w-4 transition-transform ${PerformanceSettings.prioritizeVisibleAssets ? 'transform translate-x-4' : ''}`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Throttle Background Updates
              </label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={PerformanceSettings.throttleBackgroundAssets}
                  onChange={() => handleToggle('throttleBackgroundAssets')}
                />
                <div 
                  className={`block h-6 rounded-full w-10 cursor-pointer ${PerformanceSettings.throttleBackgroundAssets ? 'bg-green-400' : 'bg-gray-400'}`}
                  onClick={() => handleToggle('throttleBackgroundAssets')}
                >
                  <div 
                    className={`absolute left-1 top-1 bg-white rounded-full h-4 w-4 transition-transform ${PerformanceSettings.throttleBackgroundAssets ? 'transform translate-x-4' : ''}`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Batch UI Updates
              </label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={PerformanceSettings.batchUpdates}
                  onChange={() => handleToggle('batchUpdates')}
                />
                <div 
                  className={`block h-6 rounded-full w-10 cursor-pointer ${PerformanceSettings.batchUpdates ? 'bg-green-400' : 'bg-gray-400'}`}
                  onClick={() => handleToggle('batchUpdates')}
                >
                  <div 
                    className={`absolute left-1 top-1 bg-white rounded-full h-4 w-4 transition-transform ${PerformanceSettings.batchUpdates ? 'transform translate-x-4' : ''}`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Progressive Loading
              </label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={PerformanceSettings.useProgressiveLoading}
                  onChange={() => handleToggle('useProgressiveLoading')}
                />
                <div 
                  className={`block h-6 rounded-full w-10 cursor-pointer ${PerformanceSettings.useProgressiveLoading ? 'bg-green-400' : 'bg-gray-400'}`}
                  onClick={() => handleToggle('useProgressiveLoading')}
                >
                  <div 
                    className={`absolute left-1 top-1 bg-white rounded-full h-4 w-4 transition-transform ${PerformanceSettings.useProgressiveLoading ? 'transform translate-x-4' : ''}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            onClick={toggleSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded"
          >
            Close
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            <div>Changes apply immediately</div>
            <div>Settings are preserved across sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};