import React from 'react';
import { useTheme } from '@/lib/ThemeProvider';

/**
 * A component that renders a full-page background with a gradient
 * The gradient colors are based on the current theme and our new design system tokens
 */
export function AppBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] transition-all duration-700 ease-in-out">
      {/* Main gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? `linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-primary-900) 100%)`
            : `linear-gradient(135deg, var(--color-primary-200) 0%, var(--color-secondary-200) 100%)`
        }}
      />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          opacity: isDark ? 0.05 : 0.07
        }}
      />
      
      {/* Vignette effect - for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.6) 100%)' 
            : 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.15) 100%)',
          opacity: isDark ? 0.6 : 0.3
        }}
      />
      
      {/* Primary accent glow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 30% 30%, var(--color-primary-700) 0%, transparent 60%)`
            : `radial-gradient(circle at 30% 30%, var(--color-primary-300) 0%, transparent 60%)`,
          opacity: isDark ? 0.15 : 0.25,
          filter: 'blur(80px)',
          animationDuration: '8s'
        }}
      />
      
      {/* Secondary accent glow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 70% 60%, var(--color-secondary-700) 0%, transparent 60%)`
            : `radial-gradient(circle at 70% 60%, var(--color-accent-300) 0%, transparent 60%)`,
          opacity: isDark ? 0.1 : 0.15,
          filter: 'blur(80px)',
          animationDuration: '12s',
          animationDelay: '2s'
        }}
      />
      
      {/* Top highlight for depth */}
      <div
        className="absolute top-0 left-0 right-0 h-[150px]"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)'
        }}
      />
    </div>
  );
}