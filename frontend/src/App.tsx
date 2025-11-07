import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createComplianceTheme } from './theme/theme';
import AppBar from './components/AppBar';
import Dashboard from './pages/Dashboard';
import Scans from './pages/Scans';
import ScanDetails from './pages/ScanDetails';
import Environments from './pages/Environments';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = useMemo(
    () => createComplianceTheme(darkMode ? 'dark' : 'light'),
    [darkMode]
  );

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scans" element={<Scans />} />
              <Route path="/scans/:id" element={<ScanDetails />} />
              <Route path="/environments" element={<Environments />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
