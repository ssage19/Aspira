import React from 'react';
import { useTheme, ColorTheme, colorThemeDescriptions } from '../lib/ThemeProvider';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { Check, Palette } from 'lucide-react';

// Color theme icons/previews mapped to each theme
const themeColors: Record<ColorTheme, { primary: string, secondary: string, accent: string }> = {
  'default': { 
    primary: 'bg-[hsl(215,60%,45%)]',
    secondary: 'bg-[hsl(90,20%,40%)]',
    accent: 'bg-[hsl(200,30%,50%)]'
  },
  'emerald': { 
    primary: 'bg-[hsl(160,84%,39%)]',
    secondary: 'bg-[hsl(168,76%,42%)]',
    accent: 'bg-[hsl(172,66%,50%)]'
  },
  'royal': { 
    primary: 'bg-[hsl(273,68%,59%)]',
    secondary: 'bg-[hsl(43,74%,66%)]',
    accent: 'bg-[hsl(291,46%,52%)]'
  },
  'sunset': { 
    primary: 'bg-[hsl(21,83%,61%)]',
    secondary: 'bg-[hsl(14,89%,55%)]',
    accent: 'bg-[hsl(36,100%,50%)]'
  },
  'ocean': { 
    primary: 'bg-[hsl(199,89%,48%)]',
    secondary: 'bg-[hsl(187,92%,42%)]',
    accent: 'bg-[hsl(174,62%,47%)]'
  },
  'violet': { 
    primary: 'bg-[hsl(262,80%,65%)]',
    secondary: 'bg-[hsl(292,91%,73%)]',
    accent: 'bg-[hsl(326,78%,60%)]'
  }
};

export function ColorThemeSwitcher() {
  const { colorTheme, setColorTheme, availableColorThemes, getColorThemeDescription } = useTheme();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Change color theme</span>
          <span 
            className="absolute inset-0 rounded-full animate-glow-pulse-fast opacity-75" 
            style={{ 
              '--glow-color': 'rgba(100, 100, 220, 0.3)' 
            } as React.CSSProperties}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <div className="space-y-1">
          <h4 className="font-medium text-sm px-2 py-1.5">Select Color Theme</h4>
          <div className="space-y-1">
            {availableColorThemes.map((themeName) => {
              const colors = themeColors[themeName];
              
              return (
                <Button
                  key={themeName}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 p-2 h-auto",
                    colorTheme === themeName && "bg-muted/50"
                  )}
                  onClick={() => setColorTheme(themeName)}
                >
                  <div className="flex space-x-1 h-4 w-10 flex-shrink-0">
                    <div className={cn("h-4 w-4 rounded-full", colors.primary)} />
                    <div className={cn("h-4 w-3 rounded-full", colors.secondary)} />
                    <div className={cn("h-4 w-3 rounded-full", colors.accent)} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="font-medium capitalize">
                      {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getColorThemeDescription(themeName)}
                    </div>
                  </div>
                  {colorTheme === themeName && <Check className="h-4 w-4 flex-shrink-0" />}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}