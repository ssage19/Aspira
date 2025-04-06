import React from 'react';
import { useTheme } from '@/lib/ThemeProvider';

/**
 * A component that renders a full-page background with a gradient
 * The gradient colors are based on the current theme
 */
export function AppBackground() {
  const { isDark } = useTheme();
  
  return (
    <div 
      className="fixed inset-0 w-full h-full z-[-1] transition-all duration-700 ease-in-out"
      style={{
        backgroundImage: 'var(--background-image, linear-gradient(to bottom, #254E58, #112D32))',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : '000000'}' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Add a subtle vignette effect */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)' 
            : 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.1) 100%)'
        }}
      />
    </div>
  );
}