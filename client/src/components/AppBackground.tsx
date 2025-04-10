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
            ? `linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-secondary-800) 50%, var(--color-primary-800) 100%)`
            : `linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-accent-100) 50%, var(--color-secondary-100) 100%)`
        }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233170be' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235085a5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.1 : 0.08
        }}
      />
      
      {/* Dot pattern overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
          opacity: isDark ? 0.1 : 0.08
        }}
      />
      
      {/* Vignette effect - for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' 
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
          opacity: isDark ? 0.8 : 0.5
        }}
      />
      
      {/* Primary accent glow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 30% 30%, var(--color-primary-600) 0%, transparent 70%)`
            : `radial-gradient(circle at 30% 30%, var(--color-primary-200) 0%, transparent 70%)`,
          opacity: isDark ? 0.2 : 0.3,
          filter: 'blur(90px)',
          animationDuration: '8s'
        }}
      />
      
      {/* Secondary accent glow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 70% 60%, var(--color-accent-600) 0%, transparent 70%)`
            : `radial-gradient(circle at 70% 60%, var(--color-accent-200) 0%, transparent 70%)`,
          opacity: isDark ? 0.15 : 0.2,
          filter: 'blur(90px)',
          animationDuration: '12s',
          animationDelay: '2s'
        }}
      />
      
      {/* Tertiary accent glow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: isDark 
            ? `radial-gradient(circle at 20% 80%, var(--color-secondary-600) 0%, transparent 60%)`
            : `radial-gradient(circle at 20% 80%, var(--color-secondary-200) 0%, transparent 60%)`,
          opacity: isDark ? 0.1 : 0.15,
          filter: 'blur(70px)',
          animationDuration: '15s',
          animationDelay: '1s'
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