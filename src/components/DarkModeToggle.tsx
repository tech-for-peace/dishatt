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
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-5 gap-1 bg-white px-1 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl border-gray-300 md:h-7 md:px-2 lg:h-8 lg:px-2.5"
    >
      {isDark ? (
        <Moon className="h-2 w-2 text-gray-700 md:h-3.5 md:w-3.5" />
      ) : (
        <Sun className="h-2 w-2 text-gray-700 md:h-3.5 md:w-3.5" />
      )}
      <span className="hidden font-semibold text-gray-800 md:inline md:text-xs lg:text-sm">
        {isDark ? "DA" : "LI"}
      </span>
    </Button>
  );
}
