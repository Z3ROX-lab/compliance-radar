import { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Security,
  Settings,
  AutoFixHigh,
  Brightness4,
  Brightness7,
  NotificationsNone,
  AccountCircle,
  Logout,
  GitHub,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import AIAssistant from './AIAssistant';

interface AppBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const AppBar = ({ darkMode, onToggleDarkMode }: AppBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <MuiAppBar position="sticky" elevation={0}>
        <Toolbar>
          {/* Logo & Title */}
          <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Security sx={{ fontSize: 32 }} />
            <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
              Compliance Radar
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Dashboard />}
              onClick={() => navigate('/')}
              sx={{
                fontWeight: isActive('/') && location.pathname === '/' ? 700 : 400,
                bgcolor: isActive('/') && location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              startIcon={<Security />}
              onClick={() => navigate('/scans')}
              sx={{
                fontWeight: isActive('/scans') ? 700 : 400,
                bgcolor: isActive('/scans') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Scans
            </Button>
            <Button
              color="inherit"
              startIcon={<Settings />}
              onClick={() => navigate('/environments')}
              sx={{
                fontWeight: isActive('/environments') ? 700 : 400,
                bgcolor: isActive('/environments') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Environments
            </Button>
          </Box>

          {/* Right Side Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* AI Assistant Button */}
            <Tooltip title="AI Assistant">
              <IconButton
                color="inherit"
                onClick={() => setAiAssistantOpen(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <AutoFixHigh />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton color="inherit" onClick={onToggleDarkMode}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* GitHub Link */}
            <Tooltip title="View on GitHub">
              <IconButton
                color="inherit"
                href="https://github.com/Z3ROX-lab/compliance-radar"
                target="_blank"
              >
                <GitHub />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <ListItemText
                  primary="Admin User"
                  secondary="admin@compliance-radar.local"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </MuiAppBar>

      {/* AI Assistant Modal */}
      <AIAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </>
  );
};

export default AppBar;
