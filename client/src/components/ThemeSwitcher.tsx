import React from 'react';
import { useTheme, themeDescriptions } from '../lib/ThemeProvider';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  Monitor, 
  Moon, 
  SunMedium,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

// Theme icons mapped to each theme
const themeIcons = {
  'dark': Moon,
  'light': SunMedium,
  'system': Monitor
};

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes, getThemeDescription } = useTheme();
  
  // Get current theme icon
  const CurrentIcon = themeIcons[theme] || Monitor;

  // Direct theme toggle function
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
          <span 
            className="absolute inset-0 rounded-full animate-glow-pulse-fast opacity-75" 
            style={{ 
              '--glow-color': theme === 'dark' 
                ? 'rgba(37, 78, 88, 0.3)' 
                : 'rgba(136, 189, 188, 0.3)' 
            } as React.CSSProperties}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end">
        <div className="space-y-1">
          <h4 className="font-medium text-sm px-2 py-1.5">Select Theme</h4>
          <div className="space-y-1">
            {availableThemes.map((themeName) => {
              // Get icon for this theme
              const ThemeIcon = themeIcons[themeName] || Monitor;
              const isActive = theme === themeName;
              
              // Use a regular div instead of a Button component
              return (
                <div
                  key={themeName}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded hover:bg-muted cursor-pointer",
                    isActive && "bg-muted/50"
                  )}
                  onClick={() => handleThemeChange(themeName)}
                >
                  <ThemeIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="font-medium capitalize">
                      {themeName === 'dark' ? 'Dark Mode' : 
                       themeName === 'light' ? 'Light Mode' : 
                       'System Preference'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getThemeDescription(themeName)}
                    </div>
                  </div>
                  {isActive && <Check className="h-4 w-4 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}