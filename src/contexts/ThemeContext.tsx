import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeName = "red" | "blue" | "yellow";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "red", setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem("fitai-theme") as ThemeName) || "red";
  });

  useEffect(() => {
    localStorage.setItem("fitai-theme", theme);
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
