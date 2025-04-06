import React from 'react';
import { useTheme, themeDescriptions } from '@/lib/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Monitor, 
  Moon, 
  SunMedium, 
  Zap,
  CircuitBoard,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Theme icons mapped to each theme
const themeIcons = {
  'dark': Moon,
  'light': SunMedium,
  'system': Monitor,
  'neon-dark': Zap,
  'cyber-light': CircuitBoard
};

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes, getThemeDescription } = useTheme();
  
  // Get current theme icon
  const CurrentIcon = themeIcons[theme] || Monitor;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
          {theme === 'neon-dark' && (
            <span className="absolute inset-0 rounded-full animate-glow-pulse-fast opacity-75" 
              style={{ '--glow-color': 'rgba(0, 229, 255, 0.3)' } as React.CSSProperties}
            />
          )}
          {theme === 'cyber-light' && (
            <span className="absolute inset-0 rounded-full animate-glow-pulse-fast opacity-75" 
              style={{ '--glow-color': 'rgba(37, 99, 235, 0.3)' } as React.CSSProperties}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="end">
        <div className="space-y-1">
          <h4 className="font-medium text-sm px-2 py-1.5">Interface Theme</h4>
          <div className="space-y-1">
            {availableThemes.map((themeName) => {
              // Get icon for this theme
              const ThemeIcon = themeIcons[themeName] || Monitor;
              
              return (
                <Button
                  key={themeName}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    theme === themeName && "bg-muted/50"
                  )}
                  onClick={() => setTheme(themeName)}
                >
                  <ThemeIcon className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium capitalize">
                      {themeName.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getThemeDescription(themeName)}
                    </div>
                  </div>
                  {theme === themeName && <Check className="h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}