import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts, archiveAlert } from '../models/Alerts';
import { Alert } from '../../../server/interfaces/alert';

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<number>(2); // Default to 'all'

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
        setFilteredAlerts(data);
      } catch (err) {
        setError('Failed to load alerts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [isLoading]);

  useEffect(() => {
    const filtered = alerts.filter((alert) => {
      if (archiveFilter === 2) return true; // 'all'
      if (archiveFilter === 1) return !alert.archive; // 'active'
      return alert.archive; // 'archived'
    });
    setFilteredAlerts(filtered);
  }, [archiveFilter, alerts]);

  const archiveTypes = [
    { id: 2, name: 'all' },
    { id: 1, name: 'active' },
    { id: 0, name: 'archive' },
  ];

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleString();
  };

  const handleArchiveToggle = async (
    alertId: string,
    currentArchiveStatus: boolean,
  ) => {
    try {
      if (await archiveAlert(alertId, !currentArchiveStatus)) {
        setIsLoading(true); // Trigger refresh
      }
    } catch (err) {
      console.error('Failed to update archive status:', err);
    }
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
              <th>
                <select
                  value={archiveFilter}
                  onChange={(e) => setArchiveFilter(Number(e.target.value))}
                  className="select-type"
                >
                  {archiveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr key={alert.alert_id}>
                  <td>{alert.alert_id}</td>
                  <td>{alert.token_id}</td>
                  <td>{formatDate(parseInt(alert.alert_epoch))}</td>
                  <td>{alert.accessed_by}</td>
                  <td>{`${alert.location}\\${alert.file_name}`}</td>
                  <td>{`${alert.agent_ip}:${alert.agent_port}`}</td>
                  <td>{alert.grade}</td>
                  <td>
                    <button
                      className={`button ${alert.archive ? 'button-primary' : 'button-primary'}`}
                      onClick={() =>
                        handleArchiveToggle(alert.alert_id, alert.archive)
                      }
                    >
                      {alert.archive ? 'Unarchive' : 'Archive'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-alerts">
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
