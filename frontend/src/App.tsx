import { useState } from 'react';
import { Button, Container, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Enregistre les composants nécessaires de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const App = () => {
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>(null);

  const checkBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setBackendStatus(`Backend OK : ${data.status}`);
    } catch (error) {
      setBackendStatus("Backend non accessible");
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/audit');
      const data = await response.json();
      setAuditData(data);
    } catch (error) {
      setBackendStatus("Erreur lors de l'audit");
    } finally {
      setLoading(false);
    }
  };

  const barChartData = {
    labels: auditData?.data.misconfigurations.map((item: any) => item.id) || [],
    datasets: [
      {
        label: 'Sévérité',
        data: auditData?.data.misconfigurations.map((item: any) => (item.severity === 'high' ? 2 : item.severity === 'medium' ? 1 : 0)) || [],
        backgroundColor: (context: any) => {
          const severity = auditData?.data.misconfigurations[context.dataIndex].severity;
          return severity === 'high' ? '#F44336' : severity === 'medium' ? '#FF9800' : '#4CAF50';
        },
      },
    ],
  };

  const pieChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Sévérité des Non-Conformités',
        data: [
          auditData?.data.misconfigurations.filter((item: any) => item.severity === 'high').length || 0,
          auditData?.data.misconfigurations.filter((item: any) => item.severity === 'medium').length || 0,
          auditData?.data.misconfigurations.filter((item: any) => item.severity === 'low').length || 0,
        ],
        backgroundColor: ['#F44336', '#FF9800', '#4CAF50'],
      },
    ],
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Compliance Radar
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Statut du Backend</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Button variant="contained" onClick={checkBackend}>Tester le Backend</Button>
          )}
          {backendStatus && <Alert severity={backendStatus.includes("OK") ? "success" : "error"}>{backendStatus}</Alert>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Lancer un Audit</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Button variant="contained" color="primary" onClick={runAudit}>Lancer l'Audit</Button>
          )}
          {auditData && (
            <div>
              <Alert severity="info">Audit terminé (Score: {auditData.data.conformity_score})</Alert>
              <Typography variant="h6" sx={{ mt: 2 }}>Graphique en Barres</Typography>
              <Bar data={barChartData} />
              <Typography variant="h6" sx={{ mt: 4 }}>Répartition par Sévérité</Typography>
              <Pie data={pieChartData} />
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default App;
