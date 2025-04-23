import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts } from '../models/Alerts';

interface Alert {
  alert_id: string;
  token_id: string;
  alert_epoch: number;
  accessed_by: string;
  log: string;
  location: string;
  file_name: string;
  agent_ip: string;
  agent_port: string;
  grade: number;
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        setError('Failed to load alerts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleString();
  };

  if (isLoading) return <div className="loading">Loading alerts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="alerts-container">
      <h1 className="alerts-title">Alerts Dashboard</h1>
      <div className="table-container">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Token ID</th>
              <th>Date</th>
              <th>Accessed By</th>
              <th>File</th>
              <th>Agent</th>
              <th>Grade</th>
              {/* <th>Log</th> */}
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                console.log(alert);
                return (
                  <tr key={alert.alert_id}>
                    <td>{alert.alert_id}</td>
                    <td>{alert.token_id}</td>
                    <td>{formatDate(parseInt(alert.alert_epoch))}</td>
                    <td>{alert.accessed_by}</td>
                    <td>{`${alert.location}\\${alert.file_name}`}</td>
                    <td>{`${alert.agent_ip}:${alert.agent_port}`}</td>
                    <td>{alert.grade}</td>

                    {/* <td>{alert.log}</td> */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="no-alerts">
                  No alerts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Alerts;
