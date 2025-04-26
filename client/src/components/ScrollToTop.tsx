import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls the window to the top
 * whenever the route/location changes.
 * 
 * This component doesn't render anything - it just performs the side effect
 * of scrolling the window to the top when route changes.
 * 
 * Performance optimizations:
 * - Debounces scroll operations to prevent rapid consecutive calls
 * - Prevents unnecessary scrolling if already at top
 * - Uses requestAnimationFrame for smoother scrolling
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const lastPathRef = useRef(pathname);
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Debounced scroll function to avoid performance issues on rapid navigation
  const scrollToTop = useCallback(() => {
    // Cancel any pending scroll operations
    if (scrollTimeoutRef.current !== null) {
      window.cancelAnimationFrame(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    // Only scroll if we're not already at the top
    if (window.scrollY > 0) {
      scrollTimeoutRef.current = window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' // Use 'auto' for immediate scrolling (vs 'smooth')
        });
        scrollTimeoutRef.current = null;
      });
    }
  }, []);
  
  useEffect(() => {
    // Skip initial render
    if (lastPathRef.current === pathname) {
      return;
    }
    
    // Update last path and scroll to top
    lastPathRef.current = pathname;
    scrollToTop();
    
    // Less verbose logging in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Scrolled to top after navigating to: ${pathname}`);
    }
    
    // Cleanup any pending animation frame on unmount
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [pathname, scrollToTop]);
  
  return null; // This component doesn't render anything
}