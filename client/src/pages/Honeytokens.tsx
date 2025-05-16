import { useEffect, useState } from 'react';
import '../styles/Honeytokens.css';
import {
  getHoneytokens,
  deleteHoneytoken,
  startMonitorOnHoneytoken,
  stopMonitorOnHoneytoken,
  getHoneytokensMonitorStatuses,
} from '../models/Honeytoken';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { FaTrash, FaPlay, FaStop } from 'react-icons/fa';

function Honeytokens() {
  const [honeytokens, setHoneytokens] = useState<IHoneytoken[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // 👇 NEW STATE
  const [loadingTokenId, setLoadingTokenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoneytokens = async () => {
      try {
        const tokenData = await getHoneytokens();

        const monitoringStatuses = await getHoneytokensMonitorStatuses();

        const tokensWithMonitoringStatus = tokenData.map(
          (token: IHoneytoken) => ({
            ...token,
            isMonitored: monitoringStatuses[token.token_id] ?? false,
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
      setLoadingTokenId(tokenId); // 👈
      await deleteHoneytoken(tokenId);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTokenId(null); // 👈
    }
  };

  const handleStartMonitoring = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId); // 👈
      await startMonitorOnHoneytoken(tokenId);
      setHoneytokens((prevTokens) =>
        prevTokens.map((token) =>
          token.token_id === tokenId ? { ...token, isMonitored: true } : token,
        ),
      );
    } catch (error) {
      console.error('Failed to start monitoring honeytoken:', error);
    } finally {
      setLoadingTokenId(null); // 👈
    }
  };

  const handleStopMonitoring = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId); // 👈
      await stopMonitorOnHoneytoken(tokenId);
      setHoneytokens((prevTokens) =>
        prevTokens.map((token) =>
          token.token_id === tokenId ? { ...token, isMonitored: false } : token,
        ),
      );
    } catch (error) {
      console.error('Failed to stop monitoring honeytoken:', error);
    } finally {
      setLoadingTokenId(null); // 👈
    }
  };

  return (
    <div className="honeytokens-container">
      <h1 className="honeytokens-title">Honeytokens Dashboard</h1>

      <div className="honeytokens-refresh-button-wrapper">
        <button
          className="honeytokens-refresh-button"
          onClick={() => setRefreshCounter((prev) => prev + 1)}
          disabled={loadingTokenId !== null} // 👈 Prevent refresh during actions
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
                        <button
                          onClick={() =>
                            handleStopMonitoring(honeytoken.token_id)
                          }
                          onMouseEnter={() =>
                            setHoveredIcon(`stop-${honeytoken.token_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Stop Monitoring"
                          disabled={loadingTokenId === honeytoken.token_id} // 👈
                          style={{
                            opacity:
                              loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                            pointerEvents:
                              loadingTokenId === honeytoken.token_id
                                ? 'none'
                                : 'auto',
                          }}
                        >
                          <FaStop
                            className={`action-icon stop ${hoveredIcon === `stop-${honeytoken.token_id}` ? 'hovered' : ''}`}
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStartMonitoring(honeytoken.token_id)
                          }
                          onMouseEnter={() =>
                            setHoveredIcon(`start-${honeytoken.token_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Start Monitoring"
                          disabled={loadingTokenId === honeytoken.token_id} // 👈
                          style={{
                            opacity:
                              loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                            pointerEvents:
                              loadingTokenId === honeytoken.token_id
                                ? 'none'
                                : 'auto',
                          }}
                        >
                          <FaPlay
                            className={`action-icon start ${hoveredIcon === `start-${honeytoken.token_id}` ? 'hovered' : ''}`}
                          />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteHoneytoken(honeytoken.token_id)
                        }
                        onMouseEnter={() =>
                          setHoveredIcon(`delete-${honeytoken.token_id}`)
                        }
                        onMouseLeave={() => setHoveredIcon(null)}
                        title="Delete Honeytoken"
                        disabled={loadingTokenId === honeytoken.token_id} // 👈
                        style={{
                          opacity:
                            loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                          pointerEvents:
                            loadingTokenId === honeytoken.token_id
                              ? 'none'
                              : 'auto',
                        }}
                      >
                        <FaTrash
                          className={`action-icon delete ${hoveredIcon === `delete-${honeytoken.token_id}` ? 'hovered' : ''}`}
                        />
                      </button>
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
