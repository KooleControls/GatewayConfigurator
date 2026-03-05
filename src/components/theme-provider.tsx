import * as React from "react"

import { cn } from "@/lib/utils"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = React.ComponentProps<"div"> & {
  defaultTheme?: Theme
}

function ThemeProvider({
  defaultTheme = "light",
  className,
  children,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  const toggleTheme = React.useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    )
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <div
        data-theme={theme}
        className={cn(theme === "dark" && "dark", className)}
        {...props}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

export { ThemeProvider, useTheme }