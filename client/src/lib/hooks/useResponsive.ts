import { useState, useEffect } from 'react';

/**
 * A custom hook for responsive design
 * Provides information about the current screen size and device type
 */
export function useResponsive() {
  // Define breakpoints
  const breakpoints = {
    sm: 640,   // Small mobile devices
    md: 768,   // Medium-sized tablets/large phones
    lg: 1024,  // Laptops and small desktops
    xl: 1280,  // Larger desktops and monitors
  };

  // Initialize state
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : breakpoints.lg,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Update window size when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to initialize properly
    handleResize();
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Computed properties for easier device-type checks
  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;
  const isPortrait = windowSize.height > windowSize.width;

  // Return all useful values
  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    breakpoints,
  };
}

export default useResponsive;