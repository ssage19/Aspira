import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  ChartBar, 
  Building, 
  ShoppingBag, 
  Target, 
  Trophy, 
  Crown, 
  Users,
  Store,
  Dice1
} from 'lucide-react';

// Helper function to debounce navigation calls
function useDebounce(fn: Function, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTime = useRef<number>(0);

  const debouncedFn = useCallback((...args: any[]) => {
    const now = Date.now();
    // If less than the delay has passed since last navigation, debounce
    if (now - lastNavigationTime.current < delay) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        lastNavigationTime.current = Date.now();
        fn(...args);
      }, delay);
    } else {
      // If enough time has passed, execute immediately
      lastNavigationTime.current = now;
      fn(...args);
    }
  }, [fn, delay]);

  return debouncedFn;
}

// Individual navigation item rendered as memo for performance
const NavItem = memo(({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: { icon: JSX.Element; label: string; path: string; }; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
        isActive 
          ? 'text-primary' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
      aria-label={item.label}
    >
      {item.icon}
      <span className="text-[10px] mt-1 font-medium">{item.label}</span>
    </button>
  );
});

NavItem.displayName = 'NavItem';

/**
 * MobileNavigation - A mobile-optimized navigation bar that appears at the bottom of the screen
 * This component is only visible on mobile devices (screen width < 768px)
 * 
 * The navigation is not shown on the character creation screen
 */
export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Don't show navigation on character creation screen
  if (location.pathname === '/create') {
    return null;
  }

  // Define our navigation items - now with useMemo to prevent recreation on each render
  const navItems = useMemo(() => [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'Career', path: '/job' },
    { icon: <ChartBar className="h-5 w-5" />, label: 'Invest', path: '/investments' },
    { icon: <Building className="h-5 w-5" />, label: 'Property', path: '/properties' },
    { icon: <ShoppingBag className="h-5 w-5" />, label: 'Lifestyle', path: '/lifestyle' },
    { icon: <Store className="h-5 w-5" />, label: 'Owner', path: '/business' },
    { icon: <Dice1 className="h-5 w-5" />, label: 'Casino', path: '/casino' },
    { icon: <Target className="h-5 w-5" />, label: 'Challenges', path: '/challenges' },
    { icon: <Trophy className="h-5 w-5" />, label: 'Achieve', path: '/achievements' },
    { icon: <Crown className="h-5 w-5" />, label: 'Prestige', path: '/prestige' },
    { icon: <Users className="h-5 w-5" />, label: 'Network', path: '/networking' },
  ], []);

  // Function to navigate to a path - now debounced to prevent rapid double-clicks
  const handleNavigation = useDebounce((path: string) => {
    // Don't navigate if we're already on this page
    if (location.pathname !== path) {
      navigate(path);
    }
    setIsExpanded(false);
  }, 300); // 300ms debounce delay

  // Show 6 items in the bar, the rest in the expanded drawer - memoized for performance
  const primaryNavItems = useMemo(() => navItems.slice(0, 6), [navItems]);
  const secondaryNavItems = useMemo(() => navItems.slice(6), [navItems]);

  return (
    <>
      {/* Fixed bottom navigation bar - only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/40 z-50">
        {/* Expandable navigation drawer */}
        {isExpanded && (
          <div className="grid grid-cols-4 gap-1 p-2 border-b border-border/40 animate-in slide-in-from-bottom duration-300">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </div>
        )}
        
        {/* Main navigation bar - using memoized NavItem components */}
        <div className="flex items-center justify-between px-2 py-1">
          {primaryNavItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
          
          {/* Toggle button for expanded drawer */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isExpanded ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="More options"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className={`w-4 h-0.5 bg-current rounded-full transition-transform ${isExpanded ? 'rotate-45 translate-y-0.5' : ''}`}></div>
              <div className={`w-4 h-0.5 bg-current rounded-full absolute ${isExpanded ? 'opacity-0' : 'opacity-100'}`}></div>
              <div className={`w-4 h-0.5 bg-current rounded-full transition-transform ${isExpanded ? '-rotate-45 -translate-y-0.5' : ''}`}></div>
            </div>
            <span className="text-[10px] mt-1 font-medium">More</span>
          </button>
        </div>
      </div>
      
      {/* Add padding at the bottom on mobile to account for the navigation bar */}
      <div className="md:hidden h-16"></div>
    </>
  );
}

export default MobileNavigation;