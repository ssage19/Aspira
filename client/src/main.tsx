import { createRoot } from "react-dom/client";
import App from "./App";
import SimplifiedApp from "./SimplifiedApp";
import "./index.css";
import { ThemeProvider } from "./lib/ThemeProvider";
import React from "react";

// Error boundary to catch render errors at the app root
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("Global error caught by error boundary:", error, errorInfo);
    
    // Clear any problematic local storage that might be causing issues
    try {
      // Remove specific localStorage items that might be causing issues
      localStorage.removeItem('business-empire-game');
      localStorage.removeItem('business-empire-character');
      localStorage.removeItem('business-empire-time');
      localStorage.removeItem('business-empire-economy');
      localStorage.removeItem('business-empire-audio');
      localStorage.removeItem('emergency-mode');
    } catch (err) {
      console.error("Failed to clean localStorage:", err);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for when the app crashes
      return (
        <div style={{ 
          padding: "20px", 
          margin: "30px auto",
          maxWidth: "600px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24",
          border: "1px solid #f5c6cb", 
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "15px" }}>Business Empire Game</h2>
          <h3 style={{ marginBottom: "15px" }}>Something went wrong</h3>
          <p style={{ marginBottom: "15px" }}>
            We're experiencing some technical difficulties. Please try reloading the page.
          </p>
          <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "20px" }}>
            Error: {this.state.errorMessage}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 15px",
              backgroundColor: "#721c24",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Function to clean up NaNm buttons from the UI
const cleanupNaNElements = () => {
  // Run periodically to catch dynamically added elements
  setInterval(() => {
    try {
      // Find all buttons, divs, and spans
      const elements = document.querySelectorAll('button, div, span');
      
      // Check each element for 'NaNm' text
      elements.forEach(element => {
        if (element.textContent && element.textContent.includes('NaNm')) {
          // Hide the element
          (element as HTMLElement).style.display = 'none';
        }
      });
    } catch (error) {
      console.log("Error in cleanup function:", error);
    }
  }, 1000); // Check every second
};

// Global unhandled error listener
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Don't show the browser's error dialog
  event.preventDefault();
});

// Global unhandled promise rejection listener
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't show the browser's error dialog
  event.preventDefault();
});

// Find the root element
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    // Initialize the app with the error boundary
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <GlobalErrorBoundary>
          <ThemeProvider defaultTheme="dark">
            {/* Use the simplified app when ?simplified=true is in the URL */}
            {window.location.search.includes('simplified=true') ? (
              <SimplifiedApp />
            ) : (
              <App />
            )}
          </ThemeProvider>
        </GlobalErrorBoundary>
      </React.StrictMode>
    );

    // Start the cleanup process after the app has loaded
    window.addEventListener('load', cleanupNaNElements);
    
    // Add a utility function to reset the game state
    // This will be available in the browser console via window.resetGame()
    (window as any).resetGame = () => {
      try {
        console.log("Attempting to reset game state...");
        localStorage.removeItem('business-empire-game');
        localStorage.removeItem('business-empire-character');
        localStorage.removeItem('business-empire-time');
        localStorage.removeItem('business-empire-economy');
        localStorage.removeItem('business-empire-audio');
        localStorage.removeItem('emergency-mode');
        console.log("Game state reset successful. Reloading page...");
        window.location.reload();
      } catch (err) {
        console.error("Failed to reset game state:", err);
      }
    };
  } catch (error) {
    console.error("Error during initial render:", error);
    // Fallback if React fails to start
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 30px auto; max-width: 600px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 8px; font-family: Arial, sans-serif; text-align: center">
        <h2 style="margin-bottom: 15px">Business Empire Game</h2>
        <h3 style="margin-bottom: 15px">Failed to Start</h3>
        <p style="margin-bottom: 15px">The game couldn't be initialized. Please try reloading the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 15px; background-color: #721c24; color: white; border: none; border-radius: 4px; cursor: pointer">
          Reload Game
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
}
