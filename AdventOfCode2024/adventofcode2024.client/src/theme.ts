import { createTheme, Theme } from '@mui/material/styles';

// Define light theme
export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6200ea', // Purple
    },
    secondary: {
      main: '#03dac6', // Teal
    },
  },
});

// Define dark theme
export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc', // Light purple
    },
    secondary: {
      main: '#03dac6', // Teal
    },
  },
});