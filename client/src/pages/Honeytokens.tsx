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
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function Honeytokens() {
  const [honeytokens, setHoneytokens] = useState<IHoneytoken[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);

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

  const handleReverseClick = () => {
    setHoneytokens((prev) => [...prev].reverse());
    setIsReversed((prev) => !prev);
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
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Agent ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Token ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Group ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Type ID {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Creation Date {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Expire Date {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Location {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                File Name {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Data {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
              <th onClick={handleReverseClick} style={{ cursor: 'pointer' }}>
                Notes {isReversed ? <FiChevronUp /> : <FiChevronDown />}
              </th>
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
