import { useEffect, useState } from 'react';
import '../styles/Home.css';
import { IDashboardSummary } from '../../../server/interfaces/summary';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

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

  // Data for the charts
  const agentData = [
    { name: 'Online', value: summary.online_agents },
    { name: 'Offline', value: summary.offline_agents },
  ];

  const alertsData = [
    { name: 'Resolved', value: summary.alerts.resolved },
    { name: 'Unresolved', value: summary.alerts.total - summary.alerts.resolved },
  ];

  const colors = ['#4ade80', '#f87171'];

  const honeytokensData = [
    { name: 'Honeytokens', count: summary.total_honeytokens },
    { name: 'Agents', count: summary.total_agents },
    { name: 'Alerts', count: summary.alerts.total },
  ];

  return (
    <div className="home-container">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Summary</h1>

      <div className="kpi-cards grid grid-cols-3 gap-4 mb-10">
        <div className="kpi-card">👥 Total Agents: {summary.total_agents}</div>
        <div className="kpi-card">🟢 Online Agents: {summary.online_agents}</div>
        <div className="kpi-card">🔴 Offline Agents: {summary.offline_agents}</div>
        <div className="kpi-card">🧪 Deployed Honeytokens: {summary.total_honeytokens}</div>
        <div className="kpi-card">🚨 Total Alerts: {summary.alerts.total}</div>
        <div className="kpi-card">✅ Resolved Alerts: {summary.alerts.resolved}</div>
      </div>

      <div className="charts grid grid-cols-2 gap-6">
        {/* Agents Pie Chart */}
        <div className="chart-container bg-white p-4 shadow rounded-2xl">
          <h2 className="text-lg font-medium mb-2">Agent Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={agentData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60}>
                {agentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Pie Chart */}
        <div className="chart-container bg-white p-4 shadow rounded-2xl">
          <h2 className="text-lg font-medium mb-2">Alerts Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={alertsData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60}>
                {alertsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="chart-container bg-white p-4 shadow rounded-2xl col-span-2">
          <h2 className="text-lg font-medium mb-2">Overall Summary</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={honeytokensData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#60a5fa" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Home;
