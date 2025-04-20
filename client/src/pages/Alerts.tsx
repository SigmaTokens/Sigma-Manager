import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts } from '../models/Alerts';

//second push

function Alerts() {
  const [alerts, setAlerts] = useState<[]>([]);

  useEffect(() => {
    getAlerts().then((data) => {
      setAlerts(data);
    });
  }, []);

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
              <th>Log</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                console.log(alert.alert_epoch);
                return (
                  <tr key={alert.alert_id}>
                    <td>{alert.alert_id}</td>
                    <td>{alert.token_id}</td>
                    <td>{new Date(Number(alert.alert_epoch)).toString()}</td>
                    <td>{alert.accessed_by}</td>
                    <td>{alert.log}</td>
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
