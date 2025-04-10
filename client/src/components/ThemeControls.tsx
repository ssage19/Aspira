import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ColorThemeSwitcher } from './ColorThemeSwitcher';
import { useTheme } from '@/lib/ThemeProvider';
import { Card, CardContent } from './ui/card';

interface ThemeControlsProps {
  className?: string;
}

export function ThemeControls({ className }: ThemeControlsProps) {
  const { colorTheme } = useTheme();
  
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Display Mode</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Choose between light and dark mode for the game interface.
        </p>
        <ThemeSwitcher />
      </div>
      
      <div className="space-y-2 mt-6">
        <h4 className="text-sm font-medium">Color Theme</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Select a color palette that matches your style.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <Card className={`cursor-pointer bg-background/50 hover:bg-background/60 transition-colors ${colorTheme === 'default' ? 'ring-2 ring-primary/70' : 'ring-1 ring-primary/20'}`}>
            <CardContent className="p-3 flex justify-center">
              <ColorThemeSwitcher />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}