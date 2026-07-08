import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { DEFAULT_THEME, THEME_TOKENS } from '../constants';
import { buildTheme } from '../utils/buildTheme';
import { makeLayer } from '../utils/layerFactory';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [mode, setMode]     = useState(DEFAULT_THEME);
  const [showGrid, setShowGrid] = useState(true);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const tk    = THEME_TOKENS[mode];

  const toggleMode = () => setMode(m => (m === 'dark' ? 'light' : 'dark'));
  const toggleGrid = () => setShowGrid(v => !v);

  return (
    <AppContext.Provider value={{ mode, toggleMode, showGrid, toggleGrid, tk }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  );
};
