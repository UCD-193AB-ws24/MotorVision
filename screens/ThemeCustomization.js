import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

const defaultTheme = {
  name: 'iOS Default',
  accent: '#0A84FF', // Blue
};


export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
