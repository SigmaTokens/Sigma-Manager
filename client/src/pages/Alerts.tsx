import { GiCardboardBoxClosed, GiCardboardBox } from 'react-icons/gi';
import { FiChevronDown, FiChevronUp, FiChevronRight, FiInfo } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useAlerts } from '../contexts/AlertsContext.tsx';
import { archiveAlert } from '../models/Alerts';
import { IAlert } from '../../../server/interfaces/alert';
import AlertDetailsPopup from '../components/AlertDetailsPopup';
import VolumeBar from '../components/VolumeBar';
import '../styles/Alerts.css';

function Alerts() {
  const [filteredAlerts, setFilteredAlerts] = useState<IAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [archiveFilter, setArchiveFilter] = useState<number>(2);
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<IAlert | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { alerts } = useAlerts();

  const archiveTypes = [
    { id: 2, name: 'All' },
    { id: 1, name: 'Unarchived' },
    { id: 0, name: 'Archive' },
  ];

  useEffect(() => {
    const base = alerts.filter((a) => (archiveFilter === 2 ? true : archiveFilter === 1 ? !a.archive : a.archive));
    setFilteredAlerts(isReversed ? [...base].reverse() : base);
    setIsLoading(false);
  }, [alerts, archiveFilter, isReversed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReverseClick = () => setIsReversed((prev) => !prev);

  const handleArchiveToggle = async (tokId: string, id: string, curr: boolean) => {
    try {
      await archiveAlert(tokId, id, !curr);
      setFilteredAlerts((prev) => prev.map((a) => (a.alert_id === id ? { ...a, archive: !curr } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (sec: number) => new Date(sec * 1000).toLocaleString();

  const toggleDetails = (alertId: string) => {
    setExpandedDetails(expandedDetails === alertId ? null : alertId);
  };

  const handleMoreDetails = (alert: IAlert) => {
    setSelectedAlert(alert);
  };

  const handleClosePopup = () => {
    setSelectedAlert(null);
  };

  if (isLoading) return <div className="loading">Loading alerts...</div>;

  if (isMobile) {
    return (
      <div className="alerts-container">
        <h1 className="alerts-title">Alerts Dashboard</h1>
        <div className="table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Accessed By</th>

                <th>
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
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <tr key={alert.alert_id}>
                    <td>{alert.alert_id}</td>
                    <td>{alert.accessed_by}</td>

                    <td>
                      <button
                        className="icon-button"
                        onClick={() => handleArchiveToggle(alert.token_id, alert.alert_id, alert.archive)}
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
                      <div className="details-actions">
                        <button className="details-button" onClick={() => toggleDetails(alert.alert_id)}>
                          {expandedDetails === alert.alert_id ? (
                            <FiChevronDown className="details-icon" />
                          ) : (
                            <FiChevronRight className="details-icon" />
                          )}
                        </button>
                        <button className="details-button" onClick={() => handleMoreDetails(alert)}>
                          <FiInfo className="details-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-alerts">
                    No alerts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedAlert && <AlertDetailsPopup alert={selectedAlert} onClose={handleClosePopup} />}
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
              <th title="Alert ID" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Alert ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="Token ID" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Token ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="Date" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Date {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="Accessed By" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Accessed By {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="File" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                File {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="Agent" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Agent {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th title="Grade" onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Grade {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>

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
                  <td className="truncate-cell" title={alert.alert_id}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {alert.alert_id}
                    </span>
                  </td>
                  <td className="truncate-cell" title={alert.token_id}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {alert.token_id}
                    </span>
                  </td>
                  <td className="truncate-cell" title={formatDate(parseInt(alert.alert_epoch))}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {formatDate(parseInt(alert.alert_epoch))}
                    </span>
                  </td>
                  <td className="truncate-cell" title={alert.accessed_by}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {alert.accessed_by}
                    </span>
                  </td>
                  <td className="truncate-cell" title={`${alert.location}\\${alert.file_name}`}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {expandedDetails === alert.alert_id ? `${alert.location}\\${alert.file_name}` : alert.file_name}
                    </span>
                  </td>
                  <td className="truncate-cell" title={`${alert.agent_id} ${alert.agent_name}`}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      {`${alert.agent_id} ${alert.agent_name}`}
                    </span>
                  </td>
                  <td className="truncate-cell" title={`Grade: ${alert.grade}`}>
                    <span className={expandedDetails === alert.alert_id ? 'expanded' : 'truncated'}>
                      <VolumeBar grade={alert.grade} />
                    </span>
                  </td>

                  <td>
                    <button
                      className="icon-button"
                      onClick={() => handleArchiveToggle(alert.token_id, alert.alert_id, alert.archive)}
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
                    <div className="details-actions">
                      <button
                        className="details-button"
                        onClick={() => toggleDetails(alert.alert_id)}
                        title={expandedDetails === alert.alert_id ? 'Collapse details' : 'Expand details'}
                      >
                        {expandedDetails === alert.alert_id ? (
                          <FiChevronDown className="details-icon" />
                        ) : (
                          <FiChevronRight className="details-icon" />
                        )}
                      </button>
                      <button className="details-button" onClick={() => handleMoreDetails(alert)} title="More details">
                        <FiInfo className="details-icon" />
                      </button>
                    </div>
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
      {selectedAlert && <AlertDetailsPopup alert={selectedAlert} onClose={handleClosePopup} />}
    </div>
  );
}

export default Alerts;
