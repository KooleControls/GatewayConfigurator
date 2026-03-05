import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark" : "Switch to light"}
    </Button>
  )
}

export { ThemeSwitcher }