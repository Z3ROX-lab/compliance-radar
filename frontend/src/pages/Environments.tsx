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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Cloud,
  Refresh,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Environment, EnvironmentType } from '../types';

const Environments = () => {
  const navigate = useNavigate();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'kubernetes' as EnvironmentType,
    description: '',
  });

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEnvironments();
      setEnvironments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load environments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const handleOpenDialog = (env?: Environment) => {
    if (env) {
      setEditingEnv(env);
      setFormData({
        name: env.name,
        type: env.type,
        description: env.description || '',
      });
    } else {
      setEditingEnv(null);
      setFormData({
        name: '',
        type: 'kubernetes',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingEnv) {
        await api.updateEnvironment(editingEnv.id, formData);
      } else {
        await api.createEnvironment(formData);
      }
      setDialogOpen(false);
      fetchEnvironments();
    } catch (err: any) {
      setError(err.message || 'Failed to save environment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;

    try {
      await api.deleteEnvironment(id);
      fetchEnvironments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete environment');
    }
  };

  const handleScan = async (envId: number) => {
    try {
      const result = await api.createScan({ environment_id: envId });
      navigate(`/scans/${result.scan_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
    }
  };

  const getEnvironmentIcon = (type: EnvironmentType) => {
    return <Cloud />;
  };

  const getEnvironmentColor = (type: EnvironmentType) => {
    const colors: Record<EnvironmentType, string> = {
      kubernetes: '#326CE5',
      aws: '#FF9900',
      azure: '#0078D4',
      gcp: '#4285F4',
    };
    return colors[type] || '#757575';
  };

  if (loading && environments.length === 0) {
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
          Environments
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEnvironments}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Environment
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Environments Grid */}
      <Grid container spacing={3}>
        {environments.map((env) => (
          <Grid item xs={12} md={6} lg={4} key={env.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getEnvironmentIcon(env.type)}
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {env.name}
                      </Typography>
                      <Chip
                        label={env.type.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getEnvironmentColor(env.type) + '20',
                          color: getEnvironmentColor(env.type),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(env)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(env.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {env.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {env.description}
                  </Typography>
                )}

                {env.last_scan && (
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Last scan: {new Date(env.last_scan).toLocaleString()}
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrow />}
                  onClick={() => handleScan(env.id)}
                  fullWidth
                >
                  Run Scan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {environments.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No environments configured
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add your first environment to start scanning
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Environment
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEnv ? 'Edit Environment' : 'Add Environment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EnvironmentType })}
            margin="normal"
          >
            <MenuItem value="kubernetes">Kubernetes</MenuItem>
            <MenuItem value="aws">AWS</MenuItem>
            <MenuItem value="azure">Azure</MenuItem>
            <MenuItem value="gcp">GCP</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Environments;
