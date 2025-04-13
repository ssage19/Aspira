import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls the window to the top
 * whenever the route/location changes.
 * 
 * This component doesn't render anything - it just performs the side effect
 * of scrolling the window to the top when route changes.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll to top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' for immediate scrolling (vs 'smooth')
    });
    
    // Log for debugging
    console.log(`Scrolled to top after navigating to: ${pathname}`);
  }, [pathname]);
  
  return null; // This component doesn't render anything
}