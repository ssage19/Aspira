import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./lib/ThemeProvider";

// Function to clean up NaNm buttons from the UI
const cleanupNaNElements = () => {
  // Run periodically to catch dynamically added elements
  setInterval(() => {
    // Find all buttons, divs, and spans
    const elements = document.querySelectorAll('button, div, span');
    
    // Check each element for 'NaNm' text
    elements.forEach(element => {
      if (element.textContent && element.textContent.includes('NaNm')) {
        // Hide the element
        (element as HTMLElement).style.display = 'none';
      }
    });
  }, 1000); // Check every second
};

// Initialize the app and start the cleanup function
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>
);

// Start the cleanup process after the app has loaded
window.addEventListener('load', cleanupNaNElements);
