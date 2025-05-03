import { GiCardboardBoxClosed, GiCardboardBox } from 'react-icons/gi';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts, archiveAlert } from '../models/Alerts';
import { Alert } from '../../../server/interfaces/alert';

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<number>(2);
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

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
      if (archiveFilter === 2) return true;
      if (archiveFilter === 1) return !alert.archive;
      return alert.archive;
    });
    setFilteredAlerts(filtered);
  }, [archiveFilter, alerts]);

  const archiveTypes = [
    { id: 2, name: 'All' },
    { id: 1, name: 'Unarchived' },
    { id: 0, name: 'Archive' },
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
        setIsLoading(true);
      }
    } catch (err) {
      console.error('Failed to update archive status:', err);
    }
  };

  const toggleDetails = (alertId: string) => {
    setExpandedDetails(expandedDetails === alertId ? null : alertId);
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
              <th className="filter-header">
                <select
                  value={archiveFilter}
                  onChange={(e) => setArchiveFilter(Number(e.target.value))}
                  className="filter-select"
                >
                  {archiveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </th>
              <th className="details-header">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr key={alert.alert_id}>
                  <td className="truncate-cell">
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {alert.alert_id}
                    </span>
                  </td>
                  <td className="truncate-cell">
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {alert.token_id}
                    </span>
                  </td>
                  <td className="truncate-cell">
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {formatDate(parseInt(alert.alert_epoch))}
                    </span>
                  </td>
                  <td className="truncate-cell" title={alert.accessed_by}>
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {alert.accessed_by}
                    </span>
                  </td>
                  <td
                    className="truncate-cell"
                    title={`${alert.location}\\${alert.file_name}`}
                  >
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {expandedDetails === alert.alert_id
                        ? `${alert.location}\\${alert.file_name}`
                        : alert.file_name}
                    </span>
                  </td>
                  <td className="truncate-cell">
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {`${alert.agent_ip}:${alert.agent_port}`}
                    </span>
                  </td>
                  <td className="truncate-cell">
                    <span
                      className={
                        expandedDetails === alert.alert_id
                          ? 'expanded'
                          : 'truncated'
                      }
                    >
                      {alert.grade}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() =>
                        handleArchiveToggle(alert.alert_id, alert.archive)
                      }
                      title={alert.archive ? 'Unarchive' : 'Archive'}
                    >
                      {alert.archive ? (
                        <GiCardboardBox className="unarchive-icon" />
                      ) : (
                        <GiCardboardBoxClosed className="archive-icon" />
                      )}
                    </button>
                  </td>
                  <td className="details-cell">
                    <button
                      className="details-button"
                      onClick={() => toggleDetails(alert.alert_id)}
                      title={
                        expandedDetails === alert.alert_id
                          ? 'Collapse details'
                          : 'Expand details'
                      }
                    >
                      {expandedDetails === alert.alert_id ? (
                        <FiChevronDown className="details-icon" />
                      ) : (
                        <FiChevronRight className="details-icon" />
                      )}
                    </button>
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
    </div>
  );
}

export default Alerts;
