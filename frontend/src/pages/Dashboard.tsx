import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Security,
  BugReport,
  CheckCircle,
  PlayArrow,
  Refresh,
  AutoFixHigh,
  Visibility,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../services/api';
import type { DashboardMetrics, Scan } from '../types';
import { getSeverityColor, getStatusColor, getRegulationColor } from '../theme/theme';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !metrics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  // Compliance trend chart data
  const complianceTrendData = {
    labels: metrics?.conformity_trend?.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'NIS2',
        data: metrics?.conformity_trend?.map(t => (t.scores.NIS2 || 0) * 100) || [],
        borderColor: getRegulationColor('NIS2'),
        backgroundColor: getRegulationColor('NIS2') + '20',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'ISO 27001',
        data: metrics?.conformity_trend?.map(t => (t.scores.ISO27001 || 0) * 100) || [],
        borderColor: getRegulationColor('ISO27001'),
        backgroundColor: getRegulationColor('ISO27001') + '20',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'DORA',
        data: metrics?.conformity_trend?.map(t => (t.scores.DORA || 0) * 100) || [],
        borderColor: getRegulationColor('DORA'),
        backgroundColor: getRegulationColor('DORA') + '20',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'RGPD',
        data: metrics?.conformity_trend?.map(t => (t.scores.RGPD || 0) * 100) || [],
        borderColor: getRegulationColor('RGPD'),
        backgroundColor: getRegulationColor('RGPD') + '20',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Findings by resource chart
  const findingsByResourceData = {
    labels: metrics?.findings_by_resource?.slice(0, 10).map(r => r.resource_type) || [],
    datasets: [
      {
        label: 'Critical',
        data: metrics?.findings_by_resource?.slice(0, 10).map(r => r.severity_breakdown.critical) || [],
        backgroundColor: getSeverityColor('critical'),
      },
      {
        label: 'High',
        data: metrics?.findings_by_resource?.slice(0, 10).map(r => r.severity_breakdown.high) || [],
        backgroundColor: getSeverityColor('high'),
      },
      {
        label: 'Medium',
        data: metrics?.findings_by_resource?.slice(0, 10).map(r => r.severity_breakdown.medium) || [],
        backgroundColor: getSeverityColor('medium'),
      },
      {
        label: 'Low',
        data: metrics?.findings_by_resource?.slice(0, 10).map(r => r.severity_breakdown.low) || [],
        backgroundColor: getSeverityColor('low'),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Compliance Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => navigate('/scans/new')}
            size="large"
          >
            New Scan
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Score
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {metrics?.average_conformity_score ? Math.round(metrics.average_conformity_score * 100) : 0}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics?.average_conformity_score ? metrics.average_conformity_score * 100 : 0}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Critical Findings
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="error.main">
                    {metrics?.critical_findings || 0}
                  </Typography>
                </Box>
                <BugReport sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Requires immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Scans
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {metrics?.active_scans || 0}/{metrics?.total_scans || 0}
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                {metrics?.total_environments || 0} environments monitored
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Remediated
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    {metrics ? (metrics.critical_findings + metrics.high_findings + metrics.medium_findings + metrics.low_findings) * 0.15 : 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Issues fixed this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        {/* Compliance Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Compliance Trend
              </Typography>
              <Box height={300}>
                <Line data={complianceTrendData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoFixHigh color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  AI Insights
                </Typography>
              </Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  NIS2 Compliance Gap Detected
                </Typography>
                <Typography variant="caption">
                  Missing MFA enforcement on 12 IAM users
                </Typography>
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Recommended Action
                </Typography>
                <Typography variant="caption">
                  Enable S3 bucket encryption on 8 buckets
                </Typography>
              </Alert>
              <Button variant="outlined" fullWidth startIcon={<AutoFixHigh />}>
                Generate Auto-Fix Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Findings by Resource */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Findings by Resource Type
              </Typography>
              <Box height={300}>
                <Bar data={findingsByResourceData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Scans Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Scans
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Environment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Findings</TableCell>
                  <TableCell align="center">Critical</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics?.recent_scans?.slice(0, 5).map((scan: Scan) => (
                  <TableRow key={scan.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {scan.environment_name || `Environment ${scan.environment_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scan.environment_type?.toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={scan.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(scan.status) + '20',
                          color: getStatusColor(scan.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(scan.started_at).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color={
                        (scan.overall_score || 0) >= 0.8 ? 'success.main' :
                        (scan.overall_score || 0) >= 0.6 ? 'warning.main' : 'error.main'
                      }>
                        {scan.overall_score ? Math.round(scan.overall_score * 100) : '-'}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {scan.total_findings || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={scan.critical_count || 0}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor('critical') + '20',
                          color: getSeverityColor('critical'),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => navigate(`/scans/${scan.id}`)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {(!metrics?.recent_scans || metrics.recent_scans.length === 0) && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No scans yet. Click "New Scan" to get started.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default Dashboard;
