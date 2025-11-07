import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  Visibility,
  Delete,
  FilterList,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Scan, Environment, EnvironmentType } from '../types';
import { getStatusColor, getSeverityColor } from '../theme/theme';

const Scans = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<number | 'all'>('all');
  const [newScanDialogOpen, setNewScanDialogOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scansData, environmentsData] = await Promise.all([
        api.getScans(),
        api.getEnvironments(),
      ]);
      setScans(scansData);
      setEnvironments(environmentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateScan = async () => {
    if (!selectedEnvironment) return;

    try {
      setCreating(true);
      const result = await api.createScan({
        environment_id: selectedEnvironment as number,
      });
      setNewScanDialogOpen(false);
      setSelectedEnvironment('');
      // Navigate to scan details to watch progress
      navigate(`/scans/${result.scan_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create scan');
    } finally {
      setCreating(false);
    }
  };

  const filteredScans = scans.filter((scan) => {
    if (filterStatus !== 'all' && scan.status !== filterStatus) return false;
    if (filterEnvironment !== 'all' && scan.environment_id !== filterEnvironment) return false;
    return true;
  });

  const getEnvironmentName = (envId: number) => {
    const env = environments.find(e => e.id === envId);
    return env?.name || `Environment ${envId}`;
  };

  const getEnvironmentType = (envId: number): EnvironmentType | undefined => {
    const env = environments.find(e => e.id === envId);
    return env?.type;
  };

  if (loading && scans.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Security Scans
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewScanDialogOpen(true)}
            size="large"
          >
            New Scan
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FilterList color="action" />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Environment</InputLabel>
              <Select
                value={filterEnvironment}
                label="Environment"
                onChange={(e) => setFilterEnvironment(e.target.value as number | 'all')}
              >
                <MenuItem value="all">All Environments</MenuItem>
                {environments.map((env) => (
                  <MenuItem key={env.id} value={env.id}>
                    {env.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Scans Grid */}
      <Grid container spacing={3}>
        {filteredScans.map((scan) => (
          <Grid item xs={12} md={6} lg={4} key={scan.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {getEnvironmentName(scan.environment_id)}
                    </Typography>
                    <Chip
                      label={getEnvironmentType(scan.environment_id)?.toUpperCase() || 'UNKNOWN'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Chip
                    label={scan.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(scan.status) + '20',
                      color: getStatusColor(scan.status),
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Progress for running scans */}
                {scan.status === 'running' && (
                  <Box mb={2}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Scan in progress...
                    </Typography>
                  </Box>
                )}

                {/* Metrics */}
                {scan.status === 'completed' && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Score
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={
                          (scan.overall_score || 0) >= 0.8 ? 'success.main' :
                          (scan.overall_score || 0) >= 0.6 ? 'warning.main' : 'error.main'
                        }
                      >
                        {scan.overall_score ? Math.round(scan.overall_score * 100) : '-'}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={scan.overall_score ? scan.overall_score * 100 : 0}
                      sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />

                    {/* Findings breakdown */}
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" fontWeight={700} color={getSeverityColor('critical')}>
                            {scan.critical_count || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Critical
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" fontWeight={700} color={getSeverityColor('high')}>
                            {scan.high_count || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            High
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" fontWeight={700} color={getSeverityColor('medium')}>
                            {scan.medium_count || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Medium
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" fontWeight={700} color={getSeverityColor('low')}>
                            {scan.low_count || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Low
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Timestamps */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Started: {new Date(scan.started_at).toLocaleString()}
                  </Typography>
                  {scan.completed_at && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Completed: {new Date(scan.completed_at).toLocaleString()}
                    </Typography>
                  )}
                  {scan.duration && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Duration: {Math.round(scan.duration / 60)}m {scan.duration % 60}s
                    </Typography>
                  )}
                </Box>
              </CardContent>

              {/* Actions */}
              <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/scans/${scan.id}`)}
                  fullWidth
                >
                  View Details
                </Button>
                {scan.status === 'failed' && (
                  <Tooltip title="Retry scan">
                    <IconButton size="small" color="primary">
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredScans.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No scans found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {filterStatus !== 'all' || filterEnvironment !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first scan to get started'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewScanDialogOpen(true)}
          >
            Create New Scan
          </Button>
        </Box>
      )}

      {/* New Scan Dialog */}
      <Dialog open={newScanDialogOpen} onClose={() => !creating && setNewScanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Scan</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Environment</InputLabel>
            <Select
              value={selectedEnvironment}
              label="Select Environment"
              onChange={(e) => setSelectedEnvironment(e.target.value as number)}
              disabled={creating}
            >
              {environments.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                  <Box>
                    <Typography variant="body1">{env.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {env.type?.toUpperCase()} - {env.description || 'No description'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {environments.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No environments configured. Please add an environment first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewScanDialogOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateScan}
            variant="contained"
            disabled={!selectedEnvironment || creating}
            startIcon={creating ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {creating ? 'Starting...' : 'Start Scan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Scans;
