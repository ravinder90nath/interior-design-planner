import { createTheme } from '@mui/material/styles';
import { THEME_TOKENS } from '../constants';

/**
 * Builds a MUI theme from 'dark' | 'light' mode string.
 */
export const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#00D4FF' : '#0099BB' },
      background: {
        default: THEME_TOKENS[mode].appBg,
        paper:   THEME_TOKENS[mode].panelBg,
      },
    },
    typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  });
