import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/Home.css';
import { IDashboardSummary } from '../../../server/interfaces/summary';
import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useAlerts } from '../contexts/AlertsContext';
import { useHoneytokens } from '../contexts/HoneytokensContext';
import { useAgents } from '../contexts/AgentsContext';
import { IAlert } from '../../../server/interfaces/alert';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';

ChartJS.register(CategoryScale, LinearScale, BarElement);
ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const [summary, setSummary] = useState<IDashboardSummary>({
    total_agents: 0,
    online_agents: 0,
    offline_agents: 0,
    total_honeytokens: 0,
    alerts: { total: 0, resolved: 0 },
    alert_grades: [],
    token_status: {
      active: 0,
      expired: 0,
      expiring_soon: 0,
    },
    top_threats: [],
    honeytoken_types: {},
  });

  const { alerts } = useAlerts();
  const { honeytokens } = useHoneytokens();
  const { agents } = useAgents();

  useEffect(() => {
    const newSummary: IDashboardSummary = { ...summary };
    const now = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    newSummary.total_agents = agents.length;
    newSummary.online_agents = agents.filter((agent) => agent.status === 'online').length;
    newSummary.offline_agents = agents.filter((agent) => agent.status === 'offline').length;
    newSummary.total_honeytokens = honeytokens.length;
    newSummary.alerts = {
      total: alerts.length,
      resolved: alerts.filter((alert: IAlert) => alert.archive).length,
    };
    newSummary.alert_grades = alerts.map((alert: IAlert) => alert.grade);
    newSummary.token_status = {
      active: honeytokens.filter((honeytoken: IHoneytoken) => {
        const expire_date = new Date(honeytoken.expire_date);
        if (expire_date.getTime() - now.getTime() >= sevenDays) return true;
        return false;
      }).length,
      expiring_soon: honeytokens.filter((honeytoken: IHoneytoken) => {
        const expire_date = new Date(honeytoken.expire_date);
        const diff = expire_date.getTime() - now.getTime();
        if (diff < sevenDays && diff > 0) return true;
        return false;
      }).length,
      expired: honeytokens.filter((honeytoken: IHoneytoken) => {
        const expire_date = new Date(honeytoken.expire_date);
        return expire_date < now;
      }).length,
    };

    const honeytokensTypesMap: Record<string, number> = {};
    for (const honeytoken of honeytokens) {
      const type = honeytoken.type_id || 'unknown';
      honeytokensTypesMap[type] = (honeytokensTypesMap[type] || 0) + 1;
    }

    newSummary.honeytoken_types = honeytokensTypesMap;

    setSummary(newSummary);
  }, [alerts, honeytokens, agents]);

  const totalActive = summary.token_status.active + summary.token_status.expiring_soon;
  const statusChartData = {
    labels: ['Active', 'Expiring Soon (within 7 days)', 'Expired'],
    datasets: [
      {
        label: 'Honeytoken Count',
        data: [totalActive, summary.token_status.expiring_soon, summary.token_status.expired],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const maxSeverity = 10;
  const severityLabels = Array.from({ length: maxSeverity }, (_, i) => `${i + 1}`);
  const severityValues = Array(maxSeverity).fill(0);

  if (summary.alert_grades && Array.isArray(summary.alert_grades)) {
    summary.alert_grades.forEach((grade) => {
      if (typeof grade === 'number' && grade >= 1 && grade <= maxSeverity) {
        severityValues[grade - 1]++;
      }
    });
  }

  summary.alert_grades.forEach((grades_group) => {
    severityValues[grades_group];
  });

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

  const typeLabels: Record<string, string> = {
    '1': 'Text File',
    '2': 'API Key',
    '3': 'DB Record',
  };

  const pieData = Object.entries(summary.honeytoken_types).map(([typeId, count]) => ({
    name: typeLabels[typeId] || `Type ${typeId}`,
    value: count,
  }));

  const pieChartData = {
    labels: pieData.map((d) => d.name),
    datasets: [
      {
        data: pieData.map((d) => d.value),
        backgroundColor: ['#8884d8', '#82ca9d', '#ffc658'],
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

      <div className="charts-row">
        <div className="chart-wrapper large">
          <h3 className="chart-title">Honeytoken Status</h3>
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
