import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ColorThemeSwitcher } from './ColorThemeSwitcher';
import { useTheme } from '../lib/ThemeProvider';
import { Card, CardContent } from './ui/card';

interface ThemeControlsProps {
  className?: string;
}

export function ThemeControls({ className }: ThemeControlsProps) {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Display Mode</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Choose between light and dark mode for the game interface.
        </p>
        <div className="flex justify-start mt-4">
          <ThemeSwitcher />
        </div>
      </div>
      
      <div className="space-y-2 mt-6">
        <h4 className="text-sm font-medium">Color Theme</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Select a color palette that matches your style.
        </p>
        
        <div className="flex justify-start mt-4">
          <ColorThemeSwitcher />
        </div>
      </div>
    </div>
  );
}