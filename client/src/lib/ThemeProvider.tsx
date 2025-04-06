import { createContext, useContext, useEffect, useState } from 'react';

// Expanded theme options to include futuristic variants
type Theme = 'dark' | 'light' | 'system' | 'neon-dark' | 'cyber-light';

// Theme descriptions for UI
export const themeDescriptions = {
  'dark': 'Classic Dark - Teal & Sand tones for a sleek, professional appearance',
  'light': 'Classic Light - Clean, minimal design with contrasting elements',
  'neon-dark': 'Neo Cyberpunk - Electric teal & neon purple with futuristic glow effects',
  'cyber-light': 'Tech Azure - Bright blue & purple accents with a clean, high-tech feel',
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

const availableThemes: Theme[] = ['neon-dark', 'cyber-light', 'dark', 'light', 'system'];

const initialState: ThemeProviderState = {
  theme: 'neon-dark', // Using our futuristic dark theme as default
  setTheme: () => null,
  isDark: true,
  getThemeDescription: () => '',
  availableThemes,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'neon-dark',
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
    return currentTheme === 'dark' || currentTheme === 'neon-dark';
  };

  // Get theme description
  const getThemeDescription = (themeName: Theme): string => {
    return themeDescriptions[themeName] || '';
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'neon-dark', 'cyber-light');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'neon-dark'  // Use futuristic dark theme as default dark
        : 'cyber-light'; // Use futuristic light theme as default light
      
      root.classList.add(systemTheme);
      
      // Also add the base theme class for compatibility
      root.classList.add(systemTheme.includes('dark') ? 'dark' : 'light');
      
      // Apply theme-specific CSS variables
      applyThemeVariables(systemTheme);
      
      return;
    }
    
    // Add the selected theme class
    root.classList.add(theme);
    
    // For compatibility, also add the base theme class
    if (theme === 'neon-dark') {
      root.classList.add('dark');
    } else if (theme === 'cyber-light') {
      root.classList.add('light');
    }
    
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
    
    // Apply theme-specific variables
    switch (currentTheme) {
      case 'neon-dark':
        document.documentElement.style.setProperty('--primary-glow', '0 0 10px rgba(0, 229, 255, 0.7)');
        document.documentElement.style.setProperty('--secondary-glow', '0 0 8px rgba(139, 92, 246, 0.6)');
        document.documentElement.style.setProperty('--border-glow-color', '0, 229, 255');
        document.documentElement.style.setProperty('--text-glow-color', '0, 229, 255');
        document.documentElement.style.setProperty('--glow-color', 'rgba(0, 229, 255, 0.5)');
        break;
        
      case 'cyber-light':
        document.documentElement.style.setProperty('--primary-glow', '0 0 8px rgba(37, 99, 235, 0.5)');
        document.documentElement.style.setProperty('--secondary-glow', '0 0 6px rgba(139, 92, 246, 0.4)');
        document.documentElement.style.setProperty('--border-glow-color', '37, 99, 235');
        document.documentElement.style.setProperty('--text-glow-color', '37, 99, 235');
        document.documentElement.style.setProperty('--glow-color', 'rgba(37, 99, 235, 0.4)');
        break;
        
      case 'dark':
        document.documentElement.style.setProperty('--primary-glow', '0 0 8px rgba(17, 100, 102, 0.5)');
        document.documentElement.style.setProperty('--border-glow-color', '17, 100, 102');
        document.documentElement.style.setProperty('--text-glow-color', '17, 100, 102');
        document.documentElement.style.setProperty('--glow-color', 'rgba(17, 100, 102, 0.4)');
        break;
        
      case 'light':
        document.documentElement.style.setProperty('--primary-glow', '0 0 6px rgba(69, 162, 158, 0.3)');
        document.documentElement.style.setProperty('--border-glow-color', '69, 162, 158');
        document.documentElement.style.setProperty('--text-glow-color', '69, 162, 158');
        document.documentElement.style.setProperty('--glow-color', 'rgba(69, 162, 158, 0.3)');
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