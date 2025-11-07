import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  TextField,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  AutoFixHigh,
  Code,
  CheckCircle,
  Warning,
  FilterList,
  ContentCopy,
  Download,
} from '@mui/icons-material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import type { Scan, Finding, AIRemediationResponse } from '../types';
import { getSeverityColor, getRegulationColor, getStatusColor } from '../theme/theme';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const ScanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterScanner, setFilterScanner] = useState<string>('all');
  const [filterRegulation, setFilterRegulation] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [remediation, setRemediation] = useState<AIRemediationResponse | null>(null);
  const [generatingRemediation, setGeneratingRemediation] = useState(false);
  const [remediationDialogOpen, setRemediationDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchScanDetails();
    }
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scanData, findingsData] = await Promise.all([
        api.getScan(parseInt(id!)),
        api.getFindings({ scan_id: parseInt(id!) }),
      ]);
      setScan(scanData);
      setFindings(findingsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load scan details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRemediation = async (finding: Finding) => {
    try {
      setGeneratingRemediation(true);
      setSelectedFinding(finding);
      setRemediationDialogOpen(true);

      const response = await api.generateRemediation({
        finding_id: finding.id,
        include_context: true,
      });

      setRemediation(response);
    } catch (err: any) {
      setError(err.message || 'Failed to generate remediation');
    } finally {
      setGeneratingRemediation(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !scan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/scans')} sx={{ mt: 2 }}>
          Back to Scans
        </Button>
      </Container>
    );
  }

  if (!scan) {
    return null;
  }

  const filteredFindings = findings.filter((finding) => {
    if (filterSeverity !== 'all' && finding.severity !== filterSeverity) return false;
    if (filterScanner !== 'all' && finding.scanner !== filterScanner) return false;
    if (filterRegulation !== 'all' && !finding.regulations?.includes(filterRegulation)) return false;
    return true;
  });

  const uniqueScanners = Array.from(new Set(findings.map(f => f.scanner)));
  const uniqueRegulations = Array.from(new Set(findings.flatMap(f => f.regulations || [])));

  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          scan.critical_count || 0,
          scan.high_count || 0,
          scan.medium_count || 0,
          scan.low_count || 0,
        ],
        backgroundColor: [
          getSeverityColor('critical'),
          getSeverityColor('high'),
          getSeverityColor('medium'),
          getSeverityColor('low'),
        ],
      },
    ],
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/scans')}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" fontWeight={700}>
            Scan Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {scan.environment_name} • Started {new Date(scan.started_at).toLocaleString()}
          </Typography>
        </Box>
        <Chip
          label={scan.status}
          sx={{
            bgcolor: getStatusColor(scan.status) + '20',
            color: getStatusColor(scan.status),
            fontWeight: 600,
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Compliance Scores
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(scan.conformity_scores || {}).map(([regulation, score]) => (
                  <Grid item xs={6} sm={3} key={regulation}>
                    <Box textAlign="center">
                      <Chip
                        label={regulation}
                        size="small"
                        sx={{
                          bgcolor: getRegulationColor(regulation) + '20',
                          color: getRegulationColor(regulation),
                          mb: 1,
                        }}
                      />
                      <Typography variant="h4" fontWeight={700} color={
                        score >= 0.8 ? 'success.main' : score >= 0.6 ? 'warning.main' : 'error.main'
                      }>
                        {Math.round((score as number) * 100)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {scan.overall_score !== undefined && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight={600}>
                      Overall Score
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {Math.round(scan.overall_score * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={scan.overall_score * 100}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Findings by Severity
              </Typography>
              <Box height={200} display="flex" alignItems="center" justifyContent="center">
                <Pie data={severityChartData} options={{ maintainAspectRatio: true }} />
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                Total: {scan.total_findings || 0} findings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FilterList color="action" />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filterSeverity}
                label="Severity"
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Scanner</InputLabel>
              <Select
                value={filterScanner}
                label="Scanner"
                onChange={(e) => setFilterScanner(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                {uniqueScanners.map((scanner) => (
                  <MenuItem key={scanner} value={scanner}>
                    {scanner}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Regulation</InputLabel>
              <Select
                value={filterRegulation}
                label="Regulation"
                onChange={(e) => setFilterRegulation(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                {uniqueRegulations.map((reg) => (
                  <MenuItem key={reg} value={reg}>
                    {reg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {filteredFindings.length} finding{filteredFindings.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Findings List */}
      <Box>
        {filteredFindings.map((finding) => (
          <Accordion key={finding.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Chip
                  label={finding.severity}
                  size="small"
                  sx={{
                    bgcolor: getSeverityColor(finding.severity) + '20',
                    color: getSeverityColor(finding.severity),
                    fontWeight: 600,
                    minWidth: 80,
                  }}
                />
                <Box flexGrow={1}>
                  <Typography variant="body1" fontWeight={600}>
                    {finding.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {finding.scanner} • {finding.check_id}
                    {finding.resource_id && ` • ${finding.resource_id}`}
                  </Typography>
                </Box>
                <Box display="flex" gap={0.5}>
                  {finding.regulations?.map((reg) => (
                    <Chip
                      key={reg}
                      label={reg}
                      size="small"
                      sx={{
                        bgcolor: getRegulationColor(reg) + '20',
                        color: getRegulationColor(reg),
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {finding.description}
                </Typography>

                {finding.resource_type && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Resource Type:
                    </Typography>
                    <Typography variant="body2">
                      {finding.resource_type}
                    </Typography>
                  </Box>
                )}

                {finding.remediation && (
                  <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                    <Typography variant="caption" fontWeight={600} color="success.main" display="flex" alignItems="center" gap={0.5} mb={1}>
                      <CheckCircle fontSize="small" />
                      Recommended Remediation
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {finding.remediation}
                    </Typography>
                  </Paper>
                )}

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AutoFixHigh />}
                    onClick={() => handleGenerateRemediation(finding)}
                  >
                    AI Auto-Fix
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CheckCircle />}
                  >
                    Mark Resolved
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {filteredFindings.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No findings match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filter criteria
            </Typography>
          </Box>
        )}
      </Box>

      {/* AI Remediation Dialog */}
      <Dialog
        open={remediationDialogOpen}
        onClose={() => setRemediationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoFixHigh color="primary" />
            AI-Generated Remediation
          </Box>
        </DialogTitle>
        <DialogContent>
          {generatingRemediation ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Analyzing finding and generating remediation plan...
              </Typography>
            </Box>
          ) : remediation && selectedFinding ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedFinding.title}
                </Typography>
                <Typography variant="caption">
                  Severity: {selectedFinding.severity} • Scanner: {selectedFinding.scanner}
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>
                Remediation Plan
              </Typography>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {remediation.remediation_plan}
              </Typography>

              {remediation.terraform_code && (
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Terraform Code
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyCode(remediation.terraform_code!)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                  <Paper sx={{ bgcolor: '#1E1E1E', p: 2, borderRadius: 1 }}>
                    <pre style={{ margin: 0, color: '#D4D4D4', fontSize: '0.875rem', overflow: 'auto' }}>
                      {remediation.terraform_code}
                    </pre>
                  </Paper>
                </Box>
              )}

              {remediation.helm_code && (
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Helm/Kubernetes YAML
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyCode(remediation.helm_code!)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                  <Paper sx={{ bgcolor: '#1E1E1E', p: 2, borderRadius: 1 }}>
                    <pre style={{ margin: 0, color: '#D4D4D4', fontSize: '0.875rem', overflow: 'auto' }}>
                      {remediation.helm_code}
                    </pre>
                  </Paper>
                </Box>
              )}

              {remediation.manual_steps && remediation.manual_steps.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Manual Steps
                  </Typography>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {remediation.manual_steps.map((step, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{step}</Typography>
                      </li>
                    ))}
                  </ol>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Risk Assessment
                  </Typography>
                  <Typography variant="body2">
                    {remediation.risk_assessment}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Effort
                  </Typography>
                  <Typography variant="body2">
                    {remediation.estimated_effort}
                  </Typography>
                </Grid>
              </Grid>

              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  AI Confidence:
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={remediation.ai_confidence * 100}
                  sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" fontWeight={600}>
                  {Math.round(remediation.ai_confidence * 100)}%
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemediationDialogOpen(false)}>
            Close
          </Button>
          {remediation && (
            <Button variant="contained" startIcon={<Download />}>
              Export Remediation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScanDetails;
