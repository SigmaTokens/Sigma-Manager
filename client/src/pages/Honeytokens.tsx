import { useEffect, useState } from 'react';
import '../styles/Honeytokens.css';
import {
  getHoneytokens,
  deleteHoneytoken,
  startMonitorOnHoneytoken,
  stopMonitorOnHoneytoken,
  isHoneytokenMonitored,
} from '../models/Honeytoken';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { FaTrash, FaPlay, FaStop } from 'react-icons/fa';

function Honeytokens() {
  const [honeytokens, setHoneytokens] = useState<IHoneytoken[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoneytokens = async () => {
      try {
        const tokenData = await getHoneytokens();

        const tokensWithMonitoringStatus = await Promise.all(
          tokenData.map(async (token: IHoneytoken) => {
            try {
              const isMonitored = await isHoneytokenMonitored(token.token_id);
              return { ...token, isMonitored };
            } catch (err) {
              console.error(
                `Failed to check monitoring status for honeytoken ${token.token_id}:`,
                err,
              );
              return { ...token, isMonitored: false };
            }
          }),
        );

        setHoneytokens(tokensWithMonitoringStatus);
      } catch (error) {
        console.error('Failed to fetch honeytokens:', error);
      }
    };

    fetchHoneytokens();
  }, [refreshCounter]);

  const handleDeleteHoneytoken = async (tokenId: string) => {
    try {
      await deleteHoneytoken(tokenId);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartMonitoring = async (tokenId: string) => {
    try {
      await startMonitorOnHoneytoken(tokenId);
      setHoneytokens((prevTokens) =>
        prevTokens.map((token) =>
          token.token_id === tokenId ? { ...token, isMonitored: true } : token,
        ),
      );
    } catch (error) {
      console.error('Failed to start monitoring honeytoken:', error);
    }
  };

  const handleStopMonitoring = async (tokenId: string) => {
    try {
      await stopMonitorOnHoneytoken(tokenId);
      setHoneytokens((prevTokens) =>
        prevTokens.map((token) =>
          token.token_id === tokenId ? { ...token, isMonitored: false } : token,
        ),
      );
    } catch (error) {
      console.error('Failed to stop monitoring honeytoken:', error);
    }
  };

  return (
    <div className="honeytokens-container">
      <h1 className="honeytokens-title">Honeytokens Dashboard</h1>

      <div className="honeytokens-refresh-button-wrapper">
        <button
          className="honeytokens-refresh-button"
          onClick={() => setRefreshCounter((prev) => prev + 1)}
        >
          Refresh Statuses
        </button>
      </div>

      <div className="table-container">
        <table className="honeytokens-table">
          <thead>
            <tr>
              <th>Agent ID</th>
              <th>Token ID</th>
              <th>Group ID</th>
              <th>Type ID</th>
              <th>Creation Date</th>
              <th>Expire Date</th>
              <th>Location</th>
              <th>File Name</th>
              <th>Data</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {honeytokens.length > 0 ? (
              honeytokens.map((honeytoken) => (
                <tr key={honeytoken.token_id}>
                  <td>{honeytoken.agent_id}</td>
                  <td>{honeytoken.token_id}</td>
                  <td>{honeytoken.group_id}</td>
                  <td>{honeytoken.type_id}</td>
                  <td>{new Date(honeytoken.creation_date).toLocaleString()}</td>
                  <td>{new Date(honeytoken.expire_date).toLocaleString()}</td>
                  <td>{honeytoken.location}</td>
                  <td>{honeytoken.file_name}</td>
                  <td>{honeytoken.data}</td>
                  <td>{honeytoken.notes}</td>
                  <td>
                    <span
                      className={`honeytoken-status-${honeytoken.isMonitored ? 'monitored' : 'not-monitored'}`}
                    >
                      {honeytoken.isMonitored ? 'Monitored' : 'Not Monitored'}
                    </span>
                  </td>
                  <td>
                    <div className="action-icons">
                      {honeytoken.isMonitored ? (
                        <FaStop
                          className={`action-icon stop ${hoveredIcon === `stop-${honeytoken.token_id}` ? 'hovered' : ''}`}
                          onClick={() =>
                            handleStopMonitoring(honeytoken.token_id)
                          }
                          onMouseEnter={() =>
                            setHoveredIcon(`stop-${honeytoken.token_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Stop Monitoring"
                        />
                      ) : (
                        <FaPlay
                          className={`action-icon start ${hoveredIcon === `start-${honeytoken.token_id}` ? 'hovered' : ''}`}
                          onClick={() =>
                            handleStartMonitoring(honeytoken.token_id)
                          }
                          onMouseEnter={() =>
                            setHoveredIcon(`start-${honeytoken.token_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Start Monitoring"
                        />
                      )}
                      <FaTrash
                        className={`action-icon delete ${hoveredIcon === `delete-${honeytoken.token_id}` ? 'hovered' : ''}`}
                        onClick={() =>
                          handleDeleteHoneytoken(honeytoken.token_id)
                        }
                        onMouseEnter={() =>
                          setHoveredIcon(`delete-${honeytoken.token_id}`)
                        }
                        onMouseLeave={() => setHoveredIcon(null)}
                        title="Delete Honeytoken"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="no-honeytokens">
                  No honeytokens found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Honeytokens;
