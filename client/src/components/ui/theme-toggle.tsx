import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../lib/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-tertiary" />
      ) : (
        <Moon className="h-5 w-5 text-quaternary" />
      )}
    </Button>
  );
}