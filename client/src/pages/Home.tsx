import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2'; // Importing Line, Bar, and Pie Chart from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Alerts from './Alerts';
import Honeytokens from './Honeytokens';
import '../styles/Home.css';
import '../styles/Main.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

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
  const [monthlyTrend, setMonthlyTrend] = useState('+14%');
  const [yearlyTrend, setYearlyTrend] = useState('-6%');
  const [alertsTrendData, setAlertsTrendData] = useState<any>([]);
  const [threatDistributionData, setThreatDistributionData] = useState<any>([]);

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
        prepareAlertsTrendData(data); // Added function to handle trend data
        prepareThreatDistributionData(data); // Added function for pie chart
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

  // Prepare alert data for trend visualization (monthly/yearly)
  const prepareAlertsTrendData = (data) => {
    const monthlyData = [];
    const labels = [];
    for (let i = 0; i < 12; i++) {
      labels.push(`Month ${i + 1}`);
      monthlyData.push(data.filter((alert) => new Date(alert.date).getMonth() === i).length);
    }

    setAlertsTrendData({
      labels: labels,
      datasets: [
        {
          label: 'Alerts Over Time (Monthly)',
          data: monthlyData,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
          fill: false,
        },
      ],
    });
  };

  // Prepare data for pie chart - Threat distribution
  const prepareThreatDistributionData = (data) => {
    const threatCounts = data.reduce((acc, alert) => {
      acc[alert.threat] = (acc[alert.threat] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(threatCounts);
    const counts = Object.values(threatCounts);

    setThreatDistributionData({
      labels: labels,
      datasets: [
        {
          label: 'Threat Distribution',
          data: counts,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
          hoverOffset: 4,
        },
      ],
    });
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

      {/* Graphs placed above the Alerts dashboard */}
      <div className="graph-container">
        <div className="graph-card">
          <h3>Monthly Alerts Trend</h3>
          <Line data={alertsTrendData} />
        </div>

        <div className="graph-card">
          <h3>Alerts Stats (Grade Distribution)</h3>
          <Bar
            data={{
              labels: ['Low', 'Medium', 'High'],
              datasets: [
                {
                  label: 'Alert Counts',
                  data: [alertsStats.low, alertsStats.medium, alertsStats.high],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  borderColor: '#fff',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        <div className="graph-card">
          <h3>Threat Distribution</h3>
          <Pie data={threatDistributionData} />
        </div>
      </div>

      {/* Alerts Statistics Section */}
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
