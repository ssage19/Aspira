import React from 'react';
import { useTheme } from '@/lib/ThemeProvider';

/**
 * A component that renders a full-page background with a gradient
 * The gradient colors are based on the current theme and our new design system tokens
 * Now updated with sleek futuristic styling for dark mode
 */
export function AppBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] transition-all duration-700 ease-in-out">
      {/* Main gradient background */}
      <div 
        className={`absolute inset-0 ${isDark ? 'circuit-bg' : ''}`}
        style={{
          background: isDark 
            ? `linear-gradient(135deg, #2C3531 0%, #1d3335 50%, #2C3531 100%)`
            : `linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-accent-100) 50%, var(--color-secondary-100) 100%)`
        }}
      />
      
      {/* Geometric grid overlay - only for dark theme */}
      {isDark && (
        <div className="absolute inset-0 grid-overlay opacity-20" />
      )}
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23116466' stroke-opacity='0.08' stroke-width='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235085a5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.1 : 0.08
        }}
      />
      
      {/* Dot matrix pattern - different styling for dark mode */}
      <div 
        className={`absolute inset-0 ${isDark ? 'dot-matrix-bg' : ''}`}
        style={{
          backgroundImage: !isDark
            ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")` : '',
          backgroundSize: '20px 20px',
          opacity: !isDark ? 0.08 : 1
        }}
      />
      
      {/* Vignette effect - more pronounced for dark futuristic theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' 
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
          opacity: isDark ? 0.9 : 0.5
        }}
      />
      
      {/* Primary accent glow - teal for dark mode */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 30% 25%, rgba(17, 100, 102, 0.4) 0%, transparent 70%)`
            : `radial-gradient(circle at 30% 30%, var(--color-primary-200) 0%, transparent 70%)`,
          opacity: isDark ? 0.3 : 0.3,
          filter: 'blur(90px)',
          animationDuration: '8s'
        }}
      />
      
      {/* Secondary accent glow - beige/gold for dark mode */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 70% 60%, rgba(217, 176, 140, 0.3) 0%, transparent 70%)`
            : `radial-gradient(circle at 70% 60%, var(--color-accent-200) 0%, transparent 70%)`,
          opacity: isDark ? 0.2 : 0.2,
          filter: 'blur(90px)',
          animationDuration: '12s',
          animationDelay: '2s'
        }}
      />
      
      {/* Tertiary accent glow - soft orange for dark mode */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 20% 80%, rgba(255, 203, 154, 0.2) 0%, transparent 60%)`
            : `radial-gradient(circle at 20% 80%, var(--color-secondary-200) 0%, transparent 60%)`,
          opacity: isDark ? 0.15 : 0.15,
          filter: 'blur(70px)',
          animationDuration: '15s',
          animationDelay: '1s'
        }}
      />
      
      {/* Geometric triangle accent - only in dark mode */}
      {isDark && (
        <div className="absolute top-0 right-0 w-[400px] h-[400px] geometric-triangle opacity-60" />
      )}
      
      {/* Hexagon accent - only in dark mode */}
      {isDark && (
        <div className="absolute top-[30%] left-[20%] w-[60px] h-[60px] hex-accent" />
      )}
      
      {/* Hexagon accent 2 - only in dark mode */}
      {isDark && (
        <div className="absolute bottom-[25%] right-[15%] w-[40px] h-[40px] hex-accent opacity-40" />
      )}
      
      {/* Top edge glow for futuristic effect */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: isDark
            ? 'linear-gradient(to right, transparent, rgba(17, 100, 102, 0.5), transparent)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)'
        }}
      />
      
      {/* Scanlines for the cyber look - only in dark mode */}
      {isDark && (
        <div className="absolute inset-0 tech-scanline" />
      )}
    </div>
  );
}