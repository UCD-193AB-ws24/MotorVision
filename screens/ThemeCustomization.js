import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

const defaultTheme = {
  accent: '#ff4081', // default button color
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const updateTheme = (newTheme) => {
    setTheme({ accent: newTheme.accent });
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
