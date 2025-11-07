import { createTheme, ThemeOptions } from '@mui/material/styles';

// Compliance Radar Design System
export const getSeverityColor = (severity: string): string => {
  const severityColors: Record<string, string> = {
    critical: '#D32F2F',
    high: '#F44336',
    medium: '#FF9800',
    low: '#FFC107',
    info: '#2196F3',
  };
  return severityColors[severity.toLowerCase()] || '#757575';
};

export const getRegulationColor = (regulation: string): string => {
  const regulationColors: Record<string, string> = {
    NIS2: '#1976D2',
    ISO27001: '#7B1FA2',
    DORA: '#00897B',
    RGPD: '#5E35B1',
    HDS: '#E64A19',
    SecNumCloud: '#0277BD',
    NIST: '#6A1B9A',
    TOGAF: '#00796B',
  };
  return regulationColors[regulation] || '#616161';
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: '#FFA726',
    running: '#42A5F5',
    completed: '#66BB6A',
    failed: '#EF5350',
  };
  return statusColors[status.toLowerCase()] || '#757575';
};

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#1976D2',
            light: '#42A5F5',
            dark: '#1565C0',
          },
          secondary: {
            main: '#7B1FA2',
            light: '#BA68C8',
            dark: '#6A1B9A',
          },
          error: {
            main: '#D32F2F',
            light: '#EF5350',
            dark: '#C62828',
          },
          warning: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
          },
          success: {
            main: '#388E3C',
            light: '#66BB6A',
            dark: '#2E7D32',
          },
          info: {
            main: '#0288D1',
            light: '#03A9F4',
            dark: '#01579B',
          },
          background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#42A5F5',
            light: '#64B5F6',
            dark: '#1976D2',
          },
          secondary: {
            main: '#BA68C8',
            light: '#CE93D8',
            dark: '#7B1FA2',
          },
          error: {
            main: '#EF5350',
            light: '#E57373',
            dark: '#D32F2F',
          },
          warning: {
            main: '#FFB74D',
            light: '#FFCC80',
            dark: '#FF9800',
          },
          success: {
            main: '#66BB6A',
            light: '#81C784',
            dark: '#388E3C',
          },
          info: {
            main: '#29B6F6',
            light: '#4FC3F7',
            dark: '#0288D1',
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 2px 8px rgba(0,0,0,0.1)'
            : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light'
              ? '0 4px 16px rgba(0,0,0,0.15)'
              : '0 4px 16px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 2px 4px rgba(0,0,0,0.1)'
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

export const createComplianceTheme = (mode: 'light' | 'dark') => {
  return createTheme(getDesignTokens(mode));
};
