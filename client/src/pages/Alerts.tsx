import { useEffect, useState } from 'react';
import '../styles/Alerts.css';
import { getAlerts, archiveAlert } from '../models/Alerts';
import { Alert } from '../../../server/interfaces/alert';

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveFilterBy, setArchive] = useState<string>('');
  // State to track expanded row IDs
  const [expandedRows, setExpandedRows] = useState<{ [alertId: string]: boolean }>({});

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
        setFilteredAlerts(data);
        // Initialize all rows as collapsed by default
        const initialExpandedState: { [alertId: string]: boolean } = {};
        data.forEach(alert => {
          initialExpandedState[alert.alert_id] = false; // false means collapsed
        });
        setExpandedRows(initialExpandedState);

      } catch (err) {
        setError('Failed to load alerts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // This useEffect dependency on isLoading might cause re-fetching loop.
    // Consider changing this to [] to fetch only on mount, or add a manual refresh mechanism.
    // Keeping it as is for now based on your original code, but be aware.
    if (isLoading) {
       fetchAlerts();
    }

  }, [isLoading]); // Retained original dependency, but advise caution

   useEffect(() => {
    let currentFilteredAlerts: Alert[];
    if (archiveFilterBy === '' || parseInt(archiveFilterBy) === 2) { // Added check for 2 (all)
      currentFilteredAlerts = alerts;
    } else {
      const filterValue = parseInt(archiveFilterBy);
      currentFilteredAlerts = alerts.filter((alert) =>
          filterValue === 0 // 0 is archive
            ? alert.archive
            : !alert.archive, // 1 is active
      );
    }
    setFilteredAlerts(currentFilteredAlerts);

    // Optionally, re-initialize expanded state for *only* the currently filtered alerts
    // to ensure newly visible rows are collapsed by default, without affecting state
    // of rows hidden by filter. Or keep existing state if row is still present.
    // For simplicity here, we'll keep the existing state for rows that remain.
    // If a row is filtered out, its state in expandedRows just becomes irrelevant until it's filtered back in.

  }, [archiveFilterBy, alerts]);


  const archiveTypes = [
    { id: 0, name: 'archive' },
    { id: 1, name: 'active' },
    { id: 2, name: 'all' }, // Added 'all' option
  ];

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleString();
  };

  // Function to toggle the expanded state of a row
  const toggleRow = (alertId: string) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [alertId]: !prevState[alertId] // Toggle the boolean value
    }));
  };


  if (isLoading) return <div className="loading-container"><div className="loading-text">Loading alerts...</div></div>;
  if (error) return <div className="error-container"><div className="error-text">{error}</div></div>;


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
              <th>Archive Status</th> {/* Renamed header for clarity */}
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
               <th>Details</th> {/* New header for expand/collapse button */}
              {/* <th>Log</th> */} {/* Log column remains commented out */}
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const isExpanded = expandedRows[alert.alert_id] || false; // Get the expansion state for this row
                return (
                  <tr key={alert.alert_id}>
                    {/* Apply 'collapsed' class conditionally to data cells */}
                    <td className={isExpanded ? '' : 'collapsed'}>{alert.alert_id}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{alert.token_id}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{formatDate(parseInt(alert.alert_epoch))}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{alert.accessed_by}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{`${alert.location}\\${alert.file_name}`}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{`${alert.agent_ip}:${alert.agent_port}`}</td>
                    <td className={isExpanded ? '' : 'collapsed'}>{alert.grade}</td>
                    {/* Archive Status Cell */}
                    <td className={isExpanded ? '' : 'collapsed'}>{alert.archive ? 'Archived' : 'Active'}</td>
                     {/* Archive Button Cell */}
                    <td>
                        {alert.archive ? (
                           <button
                              className="button button-secondary" // Use a different class for unarchive
                              onClick={async () => {
                                if (await archiveAlert(alert.alert_id, false)) { // Pass false to unarchive
                                  // Instead of setIsLoading(true), update the local state for this alert
                                  setAlerts(prevAlerts =>
                                     prevAlerts.map(a => a.alert_id === alert.alert_id ? { ...a, archive: false } : a)
                                  );
                                  // Re-filter after state update
                                }
                              }}
                           >
                             Unarchive
                           </button>
                        ) : (
                           <button
                             className="button button-primary"
                             onClick={async () => {
                               if (await archiveAlert(alert.alert_id, true)) { // Pass true to archive
                                 // Instead of setIsLoading(true), update the local state for this alert
                                  setAlerts(prevAlerts =>
                                     prevAlerts.map(a => a.alert_id === alert.alert_id ? { ...a, archive: true } : a)
                                  );
                                  // Re-filter after state update
                                }
                             }}
                           >
                             Archive
                           </button>
                        )}
                    </td>
                    {/* New cell for the expand/collapse button */}
                    <td>
                      <button
                        className="button button-outline" // You might want a different button style
                        onClick={() => toggleRow(alert.alert_id)}
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="no-alerts"> {/* Adjusted colspan */}
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