import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts, archiveAlert } from '../models/Alerts';
import { Alert } from '../../../server/interfaces/alert';
import { Button } from '../components/popup';
import AlertDetailsPopup from '../components/AlertDetailsPopup';

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveFilterBy, setArchive] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

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
    if (archiveFilterBy === '') {
      setFilteredAlerts(alerts);
    } else {
      const filterValue = parseInt(archiveFilterBy);
      setFilteredAlerts(
        alerts.filter((alert) =>
          filterValue === 2
            ? true
            : filterValue === 0
              ? alert.archive
              : !alert.archive,
        ),
      );
    }
  }, [archiveFilterBy, alerts]);

  const archiveTypes = [
    { id: 0, name: 'archive' },
    { id: 1, name: 'active' },
    { id: 2, name: 'all' },
  ];

  const handleMoreDetails = (alert: any) => {
    setSelectedAlert(alert);
  };

  const handleClosePopup = () => {
    setSelectedAlert(null);
  };

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
              <th>Details</th>
              <th>
                <select
                  value={archiveFilterBy}
                  onChange={(e) => setArchive(e.target.value)}
                  style={{ color: archiveFilterBy === '' ? '#888' : 'black' }}
                  className="select-type"
                >
                  <option value="" disabled hidden>
                    Filter by Archive
                  </option>
                  {archiveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </th>
              {/* <th>Log</th> */}
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
                    <Button onClick={() => handleMoreDetails(alert)}>
                      More Details
                    </Button>
                  </td>
                  <td>
                    {alert.archive ? (
                      ''
                    ) : (
                      <button
                        className="button button-primary"
                        onClick={async () => {
                          if (await archiveAlert(alert.alert_id, true)) {
                            setIsLoading(true);
                          }
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-alerts">
                  No alerts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedAlert && (
        <AlertDetailsPopup alert={selectedAlert} onClose={handleClosePopup} />
      )}
    </div>
  );
}

export default Alerts;
