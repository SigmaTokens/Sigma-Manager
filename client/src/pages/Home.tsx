import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/Home.css';
import { IDashboardSummary } from '../../../server/interfaces/summary';
import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement);
ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/home', {
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dashboard data.');
      });
  }, []);

  if (error) return <div>{error}</div>;
  if (!summary) return <div>Loading data...</div>;

  const typeLabels: Record<string, string> = {
    '1': 'Text File',
    '2': 'API Key',
    '3': 'DB Record',
  };

  const pieData = Object.entries(summary.honeytoken_types).map(([typeId, count]) => ({
    name: typeLabels[typeId] || `Type ${typeId}`,
    value: count,
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
  const totalActive = summary.token_status.active + summary.token_status.expiring_soon;

  const statusChartData = {
    labels: ['Active', 'Expiring Soon (within 7 days)', 'Expired'],
    datasets: [
      {
        label: 'Token Count',
        data: [totalActive, summary.token_status.expiring_soon, summary.token_status.expired],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const severityLabels = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const severityValues = Array(10).fill(0);

  if (summary.alert_grades && Array.isArray(summary.alert_grades)) {
    summary.alert_grades.forEach((grade) => {
      if (typeof grade === 'number' && grade >= 1 && grade <= 10) {
        severityValues[grade - 1]++;
      }
    });
  }

  const severityChartData = {
    labels: severityLabels,
    datasets: [
      {
        label: 'Alerts per Grade',
        data: severityValues,
        backgroundColor: '#2196f3',
      },
    ],
  };

  const severityChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...severityValues) + 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieChartData = {
    labels: pieData.map((d) => d.name),
    datasets: [
      {
        data: pieData.map((d) => d.value),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="home-container">
      <div className="kpi-cards">
        <div className="kpi-card">👥 Total Agents: {summary.total_agents}</div>
        <div className="kpi-card">🟢 Online Agents: {summary.online_agents}</div>
        <div className="kpi-card">🔴 Offline Agents: {summary.offline_agents}</div>
        <div className="kpi-card">🧪 Deployed Honeytokens: {summary.total_honeytokens}</div>
        <div className="kpi-card">🚨 Total Alerts: {summary.alerts.total}</div>
        <div className="kpi-card">✅ Resolved Alerts: {summary.alerts.resolved}</div>
      </div>

      <h2 className="section-title">Visual Overview</h2>

      {/*shak6- All charts in the same row */}
      <div className="charts-row">
        <div className="chart-wrapper large">
          <h3 className="chart-title">Token Status</h3>
          <Bar
            data={statusChartData}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="chart-wrapper large">
          <h3 className="chart-title">Alerts by Severity</h3>
          <Bar data={severityChartData} options={severityChartOptions} />
        </div>

        <div className="chart-wrapper large">
          <h3 className="chart-title">Honeytoken Type</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
}

export default Home;
