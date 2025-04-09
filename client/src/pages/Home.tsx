// Home.tsx
import React, { useState, useEffect } from 'react';
import Alerts from './Alerts';
import Honeytokens from './Honeytokens';
import '../styles/Home.css'; // Corrected path for OverviewCard.css
import '../styles/Main.css';       

interface OverviewCardProps {
  title: string;
  value: string | number;
  trend?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, trend }) => {
  return (
    <div className="overview-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {trend && <div className="trend">{trend}</div>}
    </div>
  );
};

function Home() {
  const [alertsData, setAlertsData] = useState([]);
  const [honeytokensData, setHoneytokensData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertsStats, setAlertsStats] = useState({
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
  });
  const [topThreats, setTopThreats] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState('+14%'); // Placeholder
  const [yearlyTrend, setYearlyTrend] = useState('-6%');   // Placeholder

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/alerts');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAlertsData(data);
        calculateAlertsStats(data);
        calculateTopThreats(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to fetch alerts. Please try again later.');
      }
    };

    const fetchHoneytokens = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/honeytokens');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setHoneytokensData(data);
      } catch (err) {
        console.error('Error fetching honeytokens:', err);
        setError('Failed to fetch honeytokens. Please try again later.');
      }
    };

    Promise.all([fetchAlerts(), fetchHoneytokens()]).then(() => {
      setLoading(false);
    });
  }, []);

  const calculateAlertsStats = (data) => {
    const stats = {
      total: 0,
      low: 0,
      medium: 0,
      high: 0,
    };
    data.forEach((alert) => {
      stats.total++;
      if (alert.grade === 'low') {
        stats.low++;
      } else if (alert.grade === 'medium') {
        stats.medium++;
      } else if (alert.grade === 'high') {
        stats.high++;
      }
    });
    setAlertsStats(stats);
  };

  const calculateTopThreats = (data) => {
    const threats = {};
    data.forEach((alert) => {
      if (threats[alert.threat]) {
        threats[alert.threat]++;
      } else {
        threats[alert.threat] = 1;
      }
    });
    const sortedThreats = Object.keys(threats).sort((a, b) => threats[b] - threats[a]);
    const top5Threats = sortedThreats.slice(0, 5).map((threat) => ({ threat, count: threats[threat] }));
    setTopThreats(top5Threats);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <OverviewCard title="All Alarms - Quarter to Quarter" value={alertsStats.total} trend={monthlyTrend} />
      <OverviewCard title="Product Team - Year over Year" value={`${yearlyTrend} (QTD)`} />
      <div className="card">
        <h3>Top and Bottom 3 Items - Percentage of Goals (YTD)</h3>
        {/* You'll need to structure this data and potentially use a chart */}
      </div>
      <div className="card">
        <h3>Quarterly Alarm Performance - Last 2 Years (Percentage of Goal)</h3>
        {/* This will likely involve a line or bar chart */}
      </div>
      <div className="card">
        <h3>Meetings Attended by Team (QTD)</h3>
        {/* This could be a donut chart or a simple percentage */}
      </div>
      <div className="card">
        <h3>Engineering Performance (QTD)</h3>
        {/* Another percentage or metric */}
      </div>
      <div className="card">
        <h3>Alerts Statistics</h3>
        <ul>
          <li>Total Alerts: <strong>{alertsStats.total}</strong></li>
          <li>Low Grade Alerts: <strong>{alertsStats.low}</strong></li>
          <li>Medium Grade Alerts: <strong>{alertsStats.medium}</strong></li>
          <li>High Grade Alerts: <strong>{alertsStats.high}</strong></li>
        </ul>
        <h4>Top 5 Threats</h4>
        <ul>
          {topThreats.map((threat, index) => (
            <li key={index}>{threat.threat}: <strong>{threat.count}</strong></li>
          ))}
        </ul>
      </div>
      <div className="full-width-card">
        <h3>Alerts Data</h3>
        <Alerts data={alertsData} />
      </div>
      <div className="full-width-card">
        <h3>Honeytokens Data</h3>
        <Honeytokens data={honeytokensData} />
      </div>
    </div>
  );
}

export default Home;