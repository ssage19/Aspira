import { createContext, useContext, useEffect, useState } from 'react';

// Theme options
export type Theme = 'dark' | 'light' | 'system';
export type ColorTheme = 'default' | 'emerald' | 'royal' | 'sunset' | 'ocean' | 'violet';

// Theme descriptions for UI
export const themeDescriptions: Record<Theme, string> = {
  'dark': 'Dark Mode - Deep background with vibrant accent colors',
  'light': 'Light Mode - Bright background with rich accent colors',
  'system': 'System Default - Follows your device theme preferences'
};

// Color theme descriptions
export const colorThemeDescriptions: Record<ColorTheme, string> = {
  'default': 'Default - Royal blue and olive green tones',
  'emerald': 'Emerald - Vibrant green with teal accents',
  'royal': 'Royal - Deep purple with gold accents',
  'sunset': 'Sunset - Warm orange and red tones',
  'ocean': 'Ocean - Calming blues and aqua tones',
  'violet': 'Violet - Rich purple with pink accents'
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorTheme?: ColorTheme;
  storageKey?: string;
  colorStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  isDark: boolean; // Helper to determine if current theme is a dark variant
  getThemeDescription: (themeName: Theme) => string;
  getColorThemeDescription: (colorTheme: ColorTheme) => string;
  availableThemes: Theme[];
  availableColorThemes: ColorTheme[];
};

const availableThemes: Theme[] = ['dark', 'light', 'system'];
const availableColorThemes: ColorTheme[] = ['default', 'emerald', 'royal', 'sunset', 'ocean', 'violet'];

const initialState: ThemeProviderState = {
  theme: 'dark', // Using dark theme as default
  setTheme: () => null,
  colorTheme: 'default', // Default color scheme
  setColorTheme: () => null,
  isDark: true,
  getThemeDescription: () => '',
  getColorThemeDescription: () => '',
  availableThemes,
  availableColorThemes,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultColorTheme = 'default',
  storageKey = 'business-empire-ui-theme',
  colorStorageKey = 'business-empire-color-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [colorTheme, setColorTheme] = useState<ColorTheme>(
    () => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme
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
  
  // Get color theme description
  const getColorThemeDescription = (colorThemeName: ColorTheme): string => {
    return colorThemeDescriptions[colorThemeName] || '';
  };

  // Effect for base theme (light/dark)
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
  
  // Effect for color theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all color theme classes
    availableColorThemes.forEach(theme => {
      root.classList.remove(`theme-${theme}`);
    });
    
    // Add the active color theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Set data-color-theme attribute for CSS selector support
    root.setAttribute('data-color-theme', colorTheme);
    
    // Apply color theme specific variables
    applyColorThemeVariables(colorTheme);
  }, [colorTheme]);
  
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

  // Function to apply color theme variables
  const applyColorThemeVariables = (currentColorTheme: ColorTheme) => {
    const root = window.document.documentElement;
    
    // Apply color theme specific variables
    switch (currentColorTheme) {
      case 'default':
        // Default royal blue theme - already set in CSS
        root.style.setProperty('--primary', '215 60% 45%');
        root.style.setProperty('--secondary', '90 20% 40%');
        root.style.setProperty('--accent', '200 30% 50%');
        break;
        
      case 'emerald':
        // Emerald theme with teal accents
        root.style.setProperty('--primary', '160 84% 39%');
        root.style.setProperty('--secondary', '168 76% 42%');
        root.style.setProperty('--accent', '172 66% 50%');
        break;
        
      case 'royal':
        // Royal purple with gold accents
        root.style.setProperty('--primary', '273 68% 59%');
        root.style.setProperty('--secondary', '43 74% 66%');
        root.style.setProperty('--accent', '291 46% 52%');
        break;
        
      case 'sunset':
        // Sunset theme with warm colors
        root.style.setProperty('--primary', '21 83% 61%');
        root.style.setProperty('--secondary', '14 89% 55%');
        root.style.setProperty('--accent', '36 100% 50%');
        break;
        
      case 'ocean':
        // Ocean theme with blue tones
        root.style.setProperty('--primary', '199 89% 48%');
        root.style.setProperty('--secondary', '187 92% 42%');
        root.style.setProperty('--accent', '174 62% 47%');
        break;
        
      case 'violet':
        // Violet theme with pink accents
        root.style.setProperty('--primary', '262 80% 65%');
        root.style.setProperty('--secondary', '292 91% 73%');
        root.style.setProperty('--accent', '326 78% 60%');
        break;
        
      default:
        break;
    }
  };

  const value = {
    theme,
    colorTheme,
    isDark: isDarkTheme(theme),
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, colorTheme);
      setColorTheme(colorTheme);
    },
    getThemeDescription,
    getColorThemeDescription,
    availableThemes,
    availableColorThemes,
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