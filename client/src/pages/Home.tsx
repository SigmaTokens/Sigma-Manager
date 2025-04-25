import { useEffect, useState } from 'react';
import '../styles/Home.css';
import { IDashboardSummary } from '../../../server/interfaces/summary'; // Adjust path as needed

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
    </div>
  );
}

export default Home;
