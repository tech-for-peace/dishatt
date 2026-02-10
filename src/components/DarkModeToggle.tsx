import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/useTheme";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const getCurrentIcon = () => {
    if (theme === "light") {
      return <Sun className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />;
    }
    if (theme === "dark") {
      return <Moon className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />;
    }
    // System theme - check current system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? (
      <Moon className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
    ) : (
      <Sun className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
    );
  };

  const getCurrentLabel = () => {
    if (theme === "light") return "LI";
    if (theme === "dark") return "DA";
    return "SY";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-5 md:h-10 gap-1 px-1 md:px-3 bg-white border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200`}
        >
          {getCurrentIcon()}
          <span className="font-semibold text-xs md:text-sm text-gray-800 hidden md:inline">
            {getCurrentLabel()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`min-w-[140px] bg-white border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-600`}
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
            theme === "light" ? "bg-accent" : ""
          }`}
        >
          <span className="dark:text-white">Light</span>
          <span className="text-muted-foreground text-xs dark:text-gray-300">
            LI
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
            theme === "dark" ? "bg-accent" : ""
          }`}
        >
          <span className="dark:text-white">Dark</span>
          <span className="text-muted-foreground text-xs dark:text-gray-300">
            DA
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
            theme === "system" ? "bg-accent" : ""
          }`}
        >
          <span className="dark:text-white">System</span>
          <span className="text-muted-foreground text-xs dark:text-gray-300">
            SY
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
