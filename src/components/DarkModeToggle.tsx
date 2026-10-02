import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/useTheme";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button variant="header" onClick={toggleTheme}>
      {isDark ? (
        <Moon className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
      ) : (
        <Sun className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
      )}
      <span className="font-semibold text-xs md:text-sm text-gray-800 hidden md:inline">
        {isDark ? "DA" : "LI"}
      </span>
    </Button>
  );
}
