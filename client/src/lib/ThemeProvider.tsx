import { createContext, useContext, useEffect, useState } from 'react';

// Simplified theme options
type Theme = 'dark' | 'light' | 'system';

// Theme descriptions for UI
export const themeDescriptions = {
  'dark': 'Dark Mode - Deep navy with cool blue tones for a modern look',
  'light': 'Light Mode - Soft blue and olive green tones for a natural feel',
  'system': 'System Default - Follows your device theme preferences'
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean; // Helper to determine if current theme is a dark variant
  getThemeDescription: (themeName: Theme) => string;
  availableThemes: Theme[];
};

const availableThemes: Theme[] = ['dark', 'light', 'system'];

const initialState: ThemeProviderState = {
  theme: 'dark', // Using dark theme as default
  setTheme: () => null,
  isDark: true,
  getThemeDescription: () => '',
  availableThemes,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'business-empire-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Determine if the current theme is a dark variant
  const isDarkTheme = (currentTheme: Theme): boolean => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return currentTheme === 'dark';
  };

  // Get theme description
  const getThemeDescription = (themeName: Theme): string => {
    return themeDescriptions[themeName] || '';
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Determine the active theme (considering system preference if needed)
    let activeTheme = theme;
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    
    // Add the active theme class
    root.classList.add(activeTheme);
    
    // Set data-theme attribute for CSS selector support
    root.setAttribute('data-theme', activeTheme);
    
    // Set color-scheme for browser UI elements
    root.style.colorScheme = activeTheme;
    
    // Apply theme-specific CSS variables
    applyThemeVariables(activeTheme);
    
    // Setup listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newSystemTheme);
        root.setAttribute('data-theme', newSystemTheme);
        root.style.colorScheme = newSystemTheme;
        applyThemeVariables(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);
  
  // Function to apply theme-specific CSS variables
  const applyThemeVariables = (currentTheme: Theme) => {
    // Set CSS variable for checking theme in JavaScript
    document.documentElement.style.setProperty('--is-dark-theme', 
      currentTheme === 'dark' ? '1' : '0');
    
    // Apply theme-specific variables for backward compatibility
    switch (currentTheme) {
      case 'dark':
        // Colors from our design system
        document.documentElement.style.setProperty('--primary-color', 'var(--color-primary-500)');
        document.documentElement.style.setProperty('--secondary-color', 'var(--color-secondary-600)');
        document.documentElement.style.setProperty('--accent-color', 'var(--color-accent-400)');
        document.documentElement.style.setProperty('--background-color', 'var(--color-dark-background)');
        document.documentElement.style.setProperty('--text-color', 'var(--color-dark-text-primary)');
        
        // Glow effects
        document.documentElement.style.setProperty('--glow-color', 'var(--color-primary-600)');
        document.documentElement.style.setProperty('--primary-glow', 'var(--glow-primary-md)');
        document.documentElement.style.setProperty('--border-glow-color', '49, 112, 190');
        document.documentElement.style.setProperty('--text-glow-color', '49, 112, 190');
        break;
        
      case 'light':
        // Colors from our design system
        document.documentElement.style.setProperty('--primary-color', 'var(--color-primary-600)');
        document.documentElement.style.setProperty('--secondary-color', 'var(--color-secondary-500)');
        document.documentElement.style.setProperty('--accent-color', 'var(--color-accent-500)');
        document.documentElement.style.setProperty('--background-color', 'var(--color-light-background)');
        document.documentElement.style.setProperty('--text-color', 'var(--color-light-text-primary)');
        
        // Glow effects
        document.documentElement.style.setProperty('--glow-color', 'var(--color-primary-400)');
        document.documentElement.style.setProperty('--primary-glow', 'var(--glow-primary-sm)');
        document.documentElement.style.setProperty('--border-glow-color', '49, 112, 190');
        document.documentElement.style.setProperty('--text-glow-color', '49, 112, 190');
        break;
        
      default:
        break;
    }
  };

  const value = {
    theme,
    isDark: isDarkTheme(theme),
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    getThemeDescription,
    availableThemes,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  
  return context;
}