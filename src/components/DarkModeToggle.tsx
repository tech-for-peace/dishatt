import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/useTheme";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-5 md:h-10 gap-1 px-1 md:px-3 bg-white border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
    >
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
