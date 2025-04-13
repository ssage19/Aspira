import React, { useState } from 'react';
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
  Users
} from 'lucide-react';

/**
 * MobileNavigation - A mobile-optimized navigation bar that appears at the bottom of the screen
 * This component is only visible on mobile devices (screen width < 768px)
 */
export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Define our navigation items
  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'Career', path: '/job' },
    { icon: <ChartBar className="h-5 w-5" />, label: 'Invest', path: '/investments' },
    { icon: <Building className="h-5 w-5" />, label: 'Property', path: '/properties' },
    { icon: <ShoppingBag className="h-5 w-5" />, label: 'Lifestyle', path: '/lifestyle' },
    { icon: <Target className="h-5 w-5" />, label: 'Challenges', path: '/challenges' },
    { icon: <Trophy className="h-5 w-5" />, label: 'Achieve', path: '/achievements' },
    { icon: <Crown className="h-5 w-5" />, label: 'Prestige', path: '/prestige' },
    { icon: <Users className="h-5 w-5" />, label: 'Network', path: '/networking' },
  ];

  // Function to navigate to a path
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  // Only show 5 items in the bar, the rest in the expanded drawer
  const primaryNavItems = navItems.slice(0, 5);
  const secondaryNavItems = navItems.slice(5);

  return (
    <>
      {/* Fixed bottom navigation bar - only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/40 z-50">
        {/* Expandable navigation drawer */}
        {isExpanded && (
          <div className="grid grid-cols-4 gap-1 p-2 border-b border-border/40 animate-in slide-in-from-bottom duration-300">
            {secondaryNavItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Main navigation bar */}
        <div className="flex items-center justify-between px-2 py-1">
          {primaryNavItems.map((item) => (
            <button 
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
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