import { useEffect, useState } from 'react';
import '../styles/Home.css';
import { IDashboardSummary } from '../../../server/interfaces/summary';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

function Home() {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/home')
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

  const agentStatusData = {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        label: 'Agent Status',
        data: [summary.online_agents, summary.offline_agents],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const alertStatusData = {
    labels: ['Total', 'Resolved'],
    datasets: [
      {
        label: 'Alert Status',
        data: [summary.alerts.total, summary.alerts.resolved],
        backgroundColor: ['#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const honeytokenData = {
    labels: ['Deployed Honeytokens'],
    datasets: [
      {
        label: 'Total Deployed',
        data: [summary.total_honeytokens],
        backgroundColor: ['#9966FF'],
        hoverBackgroundColor: ['#9966FF'],
      },
    ],
  };

  const agentOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Agent Status',
      },
    },
  };

  const alertOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Alert Status',
      },
    },
  };

  const honeytokenOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Deployed Honeytokens',
      },
    },
  };

  return (
    <div className="home-container">
      <h1>Dashboard Summary</h1>

      <div className="kpi-cards">
        <div className="kpi-card">👥 Total Agents: {summary.total_agents}</div>
        <div className="kpi-card">
          🟢 Online Agents: {summary.online_agents}
        </div>
        <div className="kpi-card">
          🔴 Offline Agents: {summary.offline_agents}
        </div>
        <div className="kpi-card">
          🧪 Deployed Honeytokens: {summary.total_honeytokens}
        </div>
        <div className="kpi-card">🚨 Total Alerts: {summary.alerts.total}</div>
        <div className="kpi-card">
          ✅ Resolved Alerts: {summary.alerts.resolved}
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <Chart
            type="doughnut"
            data={agentStatusData}
            options={agentOptions}
          />
        </div>
        <div className="chart-card">
          <Chart
            type="doughnut"
            data={alertStatusData}
            options={alertOptions}
          />
        </div>
        <div className="chart-card">
          <Chart type="bar" data={honeytokenData} options={honeytokenOptions} />
        </div>
        {/*shak6 ---- add data!!!!!! */}
      </div>
    </div>
  );
}

export default Home;
