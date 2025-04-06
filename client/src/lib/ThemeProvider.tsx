import { createContext, useContext, useEffect, useState } from 'react';

// Simplified theme options
type Theme = 'dark' | 'light' | 'system';

// Theme descriptions for UI
export const themeDescriptions = {
  'dark': 'Dark Mode - Deep teal and sand tones with a calm aesthetic',
  'light': 'Light Mode - Soft mint and neutral tones for a clean appearance',
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
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
      
      // Apply theme-specific CSS variables
      applyThemeVariables(systemTheme);
      
      return;
    }
    
    // Add the selected theme class
    root.classList.add(theme);
    
    // Apply theme-specific CSS variables
    applyThemeVariables(theme);
    
  }, [theme]);
  
  // Function to apply theme-specific CSS variables
  const applyThemeVariables = (currentTheme: Theme) => {
    // Reset all theme-specific variables first
    document.documentElement.style.removeProperty('--primary-glow');
    document.documentElement.style.removeProperty('--secondary-glow');
    document.documentElement.style.removeProperty('--border-glow-color');
    document.documentElement.style.removeProperty('--text-glow-color');
    document.documentElement.style.removeProperty('--glow-color');
    document.documentElement.style.removeProperty('--background-image');
    
    // Apply theme-specific variables
    switch (currentTheme) {
      case 'dark':
        // Colors from the image: #254E58 (teal), #112D32 (dark green), #4F4A41 (brown)
        document.documentElement.style.setProperty('--primary-glow', '0 0 8px rgba(37, 78, 88, 0.5)');
        document.documentElement.style.setProperty('--border-glow-color', '37, 78, 88');
        document.documentElement.style.setProperty('--text-glow-color', '37, 78, 88');
        document.documentElement.style.setProperty('--glow-color', 'rgba(37, 78, 88, 0.4)');
        document.documentElement.style.setProperty('--background-image', 'linear-gradient(to bottom, #254E58, #112D32)');
        break;
        
      case 'light':
        // Colors from the image: #88BDBC (mint), #6E8659 (sage)
        document.documentElement.style.setProperty('--primary-glow', '0 0 6px rgba(136, 189, 188, 0.3)');
        document.documentElement.style.setProperty('--border-glow-color', '136, 189, 188');
        document.documentElement.style.setProperty('--text-glow-color', '136, 189, 188');
        document.documentElement.style.setProperty('--glow-color', 'rgba(136, 189, 188, 0.3)');
        document.documentElement.style.setProperty('--background-image', 'linear-gradient(to bottom, #88BDBC, #6E8659)');
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