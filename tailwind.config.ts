import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Accessibility-focused colors (colorblind-friendly)
        'accessible-green': '#00C853', // Distinct from red for colorblind users
        'accessible-red': '#D50000',    // Distinct from green for colorblind users
        'accessible-blue': '#2962FF',   // High contrast blue
        'accessible-orange': '#FF6D00', // High contrast orange
        'accessible-purple': '#AA00FF', // High contrast purple
        'accessible-yellow': '#FFD600', // High contrast yellow
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // Futuristic theme specific colors
      futuristicTheme: {
        'neon': {
          blue: '#00E5FF',   // Electric teal
          purple: '#8B5CF6',  // Vivid purple
          red: '#EF4444',     // Bright red
          green: '#10B981',   // Vibrant green
          amber: '#F59E0B',   // Warm amber
          yellow: '#EAB308',  // Rich yellow
          teal: '#14B8A6',    // Oceanic teal
          indigo: '#6366F1',  // Deep indigo
        },
        'cyber': {
          blue: '#2563EB',    // Strong blue
          purple: '#9333EA',  // Royal purple
          red: '#DC2626',     // Bold red
          green: '#059669',   // Forest green
          amber: '#D97706',   // Deep amber
          yellow: '#CA8A04',  // Mustard yellow
          teal: '#0D9488',    // Dark teal
          indigo: '#4F46E5',  // Royal indigo
        }
      },
      boxShadow: {
        'glow-sm': 'var(--shadow-glow-sm)',
        'glow': 'var(--shadow-glow)',
        'glow-lg': 'var(--shadow-glow-lg)',
        'blue-glow': '0 0 15px rgba(0, 229, 255, 0.5)',
        'purple-glow': '0 0 15px rgba(139, 92, 246, 0.5)',
        'red-glow': '0 0 15px rgba(239, 68, 68, 0.5)',
        'green-glow': '0 0 15px rgba(16, 185, 129, 0.5)',
        'amber-glow': '0 0 15px rgba(245, 158, 11, 0.5)',
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { 
            opacity: "0.9",
            transform: "scale(1)"
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.05)"
          }
        },
        "gradient-x": {
          "0%, 100%": {
            "background-position": "0% 50%"
          },
          "50%": {
            "background-position": "100% 50%"
          }
        },
        "glow-pulse": {
          "0%, 100%": { 
            opacity: "0.8",
            filter: "brightness(1)",
            boxShadow: "0 0 15px var(--glow-color, rgba(0, 229, 255, 0.5))"
          },
          "50%": { 
            opacity: "1",
            filter: "brightness(1.2)",
            boxShadow: "0 0 20px var(--glow-color, rgba(0, 229, 255, 0.7))"
          }
        },
        "border-glow": {
          "0%, 100%": { 
            borderColor: "rgba(var(--border-glow-color, 0, 229, 255), 0.3)" 
          },
          "50%": { 
            borderColor: "rgba(var(--border-glow-color, 0, 229, 255), 0.6)" 
          }
        },
        "background-glow": {
          "0%, 100%": { 
            backgroundColor: "rgba(var(--bg-glow-color, 0, 229, 255), 0.05)" 
          },
          "50%": { 
            backgroundColor: "rgba(var(--bg-glow-color, 0, 229, 255), 0.1)" 
          }
        },
        "text-glow": {
          "0%, 100%": { 
            textShadow: "0 0 5px rgba(var(--text-glow-color, 0, 229, 255), 0.5)" 
          },
          "50%": { 
            textShadow: "0 0 10px rgba(var(--text-glow-color, 0, 229, 255), 0.8)" 
          }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "border-flow": {
          "0%": { 
            backgroundPosition: "0% 50%"
          },
          "50%": { 
            backgroundPosition: "100% 50%"
          },
          "100%": { 
            backgroundPosition: "0% 50%"
          }
        },
        "cyber-scan": {
          "0%": { 
            backgroundPosition: "-100% 0%",
            opacity: "0.1"
          },
          "50%": { 
            opacity: "0.3"
          },
          "100%": { 
            backgroundPosition: "200% 0%",
            opacity: "0.1"
          }
        },
        "neon-flicker": {
          "0%, 100%": { 
            opacity: "1"
          },
          "33%": { 
            opacity: "0.9"
          },
          "66%": { 
            opacity: "0.95"
          },
          "92%": { 
            opacity: "0.85"
          }
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "fade-out": {
          from: {
            opacity: "1",
          },
          to: {
            opacity: "0",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "scale-out": {
          from: {
            opacity: "1",
            transform: "scale(1)",
          },
          to: {
            opacity: "0",
            transform: "scale(0.95)",
          },
        },
        "slide-in-right": {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-left": {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        // Futuristic animations
        "glow-pulse": "glow-pulse 3s infinite ease-in-out",
        "glow-pulse-fast": "glow-pulse 1.5s infinite ease-in-out",
        "border-glow": "border-glow 2s infinite ease-in-out",
        "background-glow": "background-glow 3s infinite ease-in-out",
        "text-glow": "text-glow 2s infinite ease-in-out",
        "float": "float 3s infinite ease-in-out",
        "border-flow": "border-flow 6s infinite linear",
        "cyber-scan": "cyber-scan 3s infinite ease-in-out",
        "neon-flicker": "neon-flicker 2s infinite ease-in-out",
        // Original animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-in-out",
        "fade-out": "fade-out 0.2s ease-in-out",
        "scale-in": "scale-in 0.2s ease-in-out",
        "scale-out": "scale-out 0.2s ease-in-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")
  ],
} satisfies Config;
