import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./lib/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <App />
  </ThemeProvider>
);
