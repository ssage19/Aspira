import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ColorThemeSwitcher } from './ColorThemeSwitcher';

interface ThemeControlsProps {
  className?: string;
}

export function ThemeControls({ className }: ThemeControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <ThemeSwitcher />
      <ColorThemeSwitcher />
    </div>
  );
}