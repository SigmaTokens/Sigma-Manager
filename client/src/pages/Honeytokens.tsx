import { useEffect, useState } from 'react';
import '../styles/Honeytokens.css';
import {
  getHoneytokens,
  deleteHoneytoken,
  startMonitorOnHoneytoken,
  stopMonitorOnHoneytoken,
  getHoneytokensMonitorStatusesText,
  deleteHoneytokensByGroupId,
  startMonitorByGroupId,
  stopMonitorByGroupId,
  getHoneytokensMonitorStatusesAPI,
} from '../models/Honeytoken';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { FaTrash, FaPlay, FaStop } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { HoneytokenType } from '../utilities/typing';

function Honeytokens() {
  const [honeytokens, setHoneytokens] = useState<IHoneytoken[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'api'>('text');
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // 👇 NEW STATE
  const [loadingTokenId, setLoadingTokenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoneytokens = async () => {
      try {
        const tokenData = await getHoneytokens();

        const monitoringStatuses_text = await getHoneytokensMonitorStatusesText();
        const monitoringStatuses_api = await getHoneytokensMonitorStatusesAPI();

        const tokensWithMonitoringStatus = tokenData.map((token: IHoneytoken) => {
          if (token.type_id === HoneytokenType.Text)
            return {
              ...token,
              isMonitored: monitoringStatuses_text[token.token_id] ?? false,
            };
          if (token.type_id === HoneytokenType.API)
            return {
              ...token,
              isMonitored: monitoringStatuses_api[token.group_id] ?? false,
            };
        });

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

  const handleStartMonitoringText = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId); // 👈
      await startMonitorOnHoneytoken(tokenId);
      setHoneytokens((prevTokens) =>
        prevTokens.map((token) => (token.token_id === tokenId ? { ...token, isMonitored: true } : token)),
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
        prevTokens.map((token) => (token.token_id === tokenId ? { ...token, isMonitored: false } : token)),
      );
    } catch (error) {
      console.error('Failed to stop monitoring honeytoken:', error);
    } finally {
      setLoadingTokenId(null); // 👈
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setLoadingGroupId(groupId);
      await deleteHoneytokensByGroupId(groupId);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupId(null);
    }
  };

  const handleStartGroup = async (groupId: string) => {
    try {
      setLoadingGroupId(groupId);
      await startMonitorByGroupId(groupId);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupId(null);
    }
  };

  const handleStopGroup = async (groupId: string) => {
    try {
      setLoadingGroupId(groupId);
      await stopMonitorByGroupId(groupId);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupId(null);
    }
  };

  const handleReverseClick = () => {
    setHoneytokens((prev) => [...prev].reverse());
    setIsReversed((prev) => !prev);
  };

  const renderTextTable = () => {
    const textTokens = honeytokens.filter((t) => t.type_id !== 'api');
    return (
      <div className="honeytokens-container">
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
              {textTokens.length > 0 ? (
                textTokens.map((honeytoken) => (
                  <tr key={honeytoken.token_id}>
                    <td>{honeytoken.agent_id}</td>
                    <td>{honeytoken.token_id}</td>
                    <td>{honeytoken.group_id}</td>
                    <td>{new Date(honeytoken.creation_date).toLocaleString()}</td>
                    <td>{new Date(honeytoken.expire_date).toLocaleString()}</td>
                    <td>{honeytoken.location}</td>
                    <td>{honeytoken.file_name}</td>
                    <td>{honeytoken.data}</td>
                    <td>{honeytoken.notes}</td>
                    <td>
                      <span className={`honeytoken-status-${honeytoken.isMonitored ? 'monitored' : 'not-monitored'}`}>
                        {honeytoken.isMonitored ? 'Monitored' : 'Not Monitored'}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons-text">
                        {honeytoken.isMonitored ? (
                          <button
                            onClick={() => handleStopMonitoring(honeytoken.token_id)}
                            onMouseEnter={() => setHoveredIcon(`stop-${honeytoken.token_id}`)}
                            onMouseLeave={() => setHoveredIcon(null)}
                            title="Stop Monitoring"
                            disabled={loadingTokenId === honeytoken.token_id} // 👈
                            style={{
                              opacity: loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                              pointerEvents: loadingTokenId === honeytoken.token_id ? 'none' : 'auto',
                            }}
                          >
                            <FaStop
                              className={`action-icon stop ${hoveredIcon === `stop-${honeytoken.token_id}` ? 'hovered' : ''}`}
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartMonitoringText(honeytoken.token_id)}
                            onMouseEnter={() => setHoveredIcon(`start-${honeytoken.token_id}`)}
                            onMouseLeave={() => setHoveredIcon(null)}
                            title="Start Monitoring"
                            disabled={loadingTokenId === honeytoken.token_id} // 👈
                            style={{
                              opacity: loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                              pointerEvents: loadingTokenId === honeytoken.token_id ? 'none' : 'auto',
                            }}
                          >
                            <FaPlay
                              className={`action-icon start ${hoveredIcon === `start-${honeytoken.token_id}` ? 'hovered' : ''}`}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteHoneytoken(honeytoken.token_id)}
                          onMouseEnter={() => setHoveredIcon(`delete-${honeytoken.token_id}`)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Delete Honeytoken"
                          disabled={loadingTokenId === honeytoken.token_id} // 👈
                          style={{
                            opacity: loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                            pointerEvents: loadingTokenId === honeytoken.token_id ? 'none' : 'auto',
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
  };

  const renderApiTable = () => {
    const apiTokens = honeytokens.filter((t) => t.type_id === 'api');

    const groups = apiTokens.reduce(
      (acc, token) => {
        if (!acc[token.group_id]) acc[token.group_id] = [];
        acc[token.group_id].push(token);
        return acc;
      },
      {} as Record<string, IHoneytoken[]>,
    );

    return (
      <div className="honeytokens-container">
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
            <tbody>
              {Object.entries(groups).map(([groupId, tokens]) => {
                const first = tokens[0];
                const expanded = expandedGroups[groupId];
                return (
                  <>
                    <tr key={groupId} className="group-row">
                      <td colSpan={12}>
                        <div className="group-header-row">
                          <span>
                            <strong>Group:</strong> {groupId}
                          </span>
                          <span>
                            <strong>Creation:</strong> {new Date(first.creation_date).toLocaleString()}
                          </span>
                          <span>
                            <strong>Expire:</strong> {new Date(first.expire_date).toLocaleString()}
                          </span>
                          <span>
                            <strong>Port:</strong> {first.api_port}
                          </span>
                          <span className={`honeytoken-status-${first.isMonitored ? 'monitored' : 'not-monitored'}`}>
                            {first.isMonitored ? 'Monitored' : 'Not Monitored'}
                          </span>
                          <div className="action-icons-api">
                            {first.isMonitored ? (
                              <button
                                onClick={() => handleStopGroup(groupId)}
                                onMouseEnter={() => setHoveredIcon(`stop-${groupId}`)}
                                onMouseLeave={() => setHoveredIcon(null)}
                                title="Stop Monitoring"
                                disabled={loadingGroupId === groupId}
                                style={{
                                  opacity: loadingGroupId === groupId ? 0.5 : 1,
                                  pointerEvents: loadingGroupId === groupId ? 'none' : 'auto',
                                }}
                              >
                                <FaStop
                                  className={`action-icon stop ${hoveredIcon === `stop-${groupId}` ? 'hovered' : ''}`}
                                />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartGroup(groupId)}
                                onMouseEnter={() => setHoveredIcon(`start-${groupId}`)}
                                onMouseLeave={() => setHoveredIcon(null)}
                                title="Start Monitoring"
                                disabled={loadingGroupId === groupId}
                                style={{
                                  opacity: loadingGroupId === groupId ? 0.5 : 1,
                                  pointerEvents: loadingGroupId === groupId ? 'none' : 'auto',
                                }}
                              >
                                <FaPlay
                                  className={`action-icon start ${hoveredIcon === `start-${groupId}` ? 'hovered' : ''}`}
                                />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteGroup(groupId)}
                              onMouseEnter={() => setHoveredIcon(`delete-${groupId}`)}
                              onMouseLeave={() => setHoveredIcon(null)}
                              title="Delete Group"
                              disabled={loadingGroupId === groupId}
                              style={{
                                opacity: loadingGroupId === groupId ? 0.5 : 1,
                                pointerEvents: loadingGroupId === groupId ? 'none' : 'auto',
                              }}
                            >
                              <FaTrash
                                className={`action-icon delete ${hoveredIcon === `delete-${groupId}` ? 'hovered' : ''}`}
                              />
                            </button>
                          </div>

                          <button
                            onClick={() => setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))}
                            className="expand-button"
                            title="Expand/Collapse"
                          >
                            {expanded ? '▲' : '▼'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <>
                        <tr className="sub-header">
                          <th colSpan={12}>
                            <table className="sub-token-table">
                              <thead>
                                <tr>
                                  <th>Method</th>
                                  <th>Route</th>
                                  <th>Response</th>
                                  <th>Token ID</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tokens.map((token) => (
                                  <tr key={token.token_id}>
                                    <td>{token.http_method}</td>
                                    <td>{token.route}</td>
                                    <td>{token.response}</td>
                                    <td>{token.token_id}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  return (
    <div className="honeytokens-container">
      <h1 className="honeytokens-title">Honeytokens Dashboard</h1>

      <div className="tab-buttons">
        <button className={`tab-button ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
          Text Tokens
        </button>
        <button className={`tab-button ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
          API Tokens
        </button>
      </div>

      {activeTab === 'text' ? renderTextTable() : renderApiTable()}
    </div>
  );
}

export default Honeytokens;
