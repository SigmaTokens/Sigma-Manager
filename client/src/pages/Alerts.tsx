import { useEffect, useState } from "react";
import "../styles/Alerts.css";

interface Alert {
  alert_id: string;
  token_id: string;
  alert_grade: number;
  alert_date: string;
  alert_time: string;
  access_ip: string;
  log: string;
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/alerts");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Alert[] = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to fetch alerts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading alerts...</div>
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
    <div className="alerts-container">
      <h1 className="alerts-title">Alerts Dashboard</h1>
      <div className="table-container">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Token ID</th>
              <th>Grade</th>
              <th>Date</th>
              <th>Time</th>
              <th>Access IP</th>
              <th>Log</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <tr key={alert.alert_id}>
                  <td>{alert.alert_id}</td>
                  <td>{alert.token_id}</td>
                  <td>{alert.alert_grade}</td>
                  <td>{alert.alert_date}</td>
                  <td>{alert.alert_time}</td>
                  <td>{alert.access_ip}</td>
                  <td>{alert.log}</td>
                </tr>
              ))
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
