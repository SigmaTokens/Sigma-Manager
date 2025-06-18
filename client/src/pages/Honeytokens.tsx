import {
  deleteHoneytoken,
  startMonitorOnHoneytoken,
  stopMonitorOnHoneytoken,
  deleteHoneytokensByGroupId,
  startMonitorByGroupId,
  stopMonitorByGroupId,
} from '../models/Honeytoken';
import { useEffect, useState } from 'react';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { FaTrash, FaPlay, FaStop } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FiInfo } from 'react-icons/fi';
import { useHoneytokens } from '../contexts/HoneytokensContext.tsx';
import { useAgents } from '../contexts/AgentsContext.tsx';
import ApiHoneytokenDetailsPopup from '../components/ApiHoneytokenDetailsPopup.tsx';
import TextHoneytokenDetailsPopup from '../components/TextHoneytokenDetailsPopup.tsx';
import '../styles/TextHoneytoken.css';
import '../styles/ApiHoneytoken.css';

function Honeytokens() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'api'>(window.location.hash === '#api' ? 'api' : 'text');
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedToken, setSelectedToken] = useState<IHoneytoken | null>(null);
  const [selectedGroupToken, setSelectedGroupToken] = useState<IHoneytoken | null>(null);
  const [loadingTokenId, setLoadingTokenId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [sortKey, setSortKey] = useState<
    'agent' | 'token' | 'group' | 'created' | 'expire' | 'location' | 'file' | 'data' | 'notes'
  >('agent');
  const [sortDesc, setSortDesc] = useState(false);

  const clickSort = (key: typeof sortKey) => () => {
    if (key === sortKey) setSortDesc((prev) => !prev);
    else {
      setSortKey(key);
      setSortDesc(false);
    }
  };

  const { agents } = useAgents();
  const { honeytokens } = useHoneytokens();

  const agentsTokensMap = new Map<string, IHoneytoken[]>();

  for (const token of honeytokens) {
    let list = agentsTokensMap.get(token.agent_id);
    if (!list) {
      list = [];
      agentsTokensMap.set(token.agent_id, list);
    }
    list.push(token);
  }

  const cmp: Record<typeof sortKey, (a: IHoneytoken, b: IHoneytoken) => number> = {
    agent: (a, b) => a.agent_id.localeCompare(b.agent_id),
    token: (a, b) => a.token_id.localeCompare(b.token_id),
    group: (a, b) => a.group_id.localeCompare(b.group_id),
    created: (a, b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime(),
    expire: (a, b) => new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime(),
    location: (a, b) => a.location.localeCompare(b.location),
    file: (a, b) => a.file_name.localeCompare(b.file_name),
    data: (a, b) => a.data.localeCompare(b.data),
    notes: (a, b) => a.notes!.localeCompare(b.notes!),
  };

  const onlineAgents = new Set(agents.filter((a) => a.status === 'online').map((a) => a.agent_id));

  const statusOf = (t: IHoneytoken) =>
    !onlineAgents.has(t.agent_id) ? 'not-connected' : t.isMonitored ? 'monitored' : 'not-monitored';

  useEffect(() => {
    const onHash = () => setActiveTab(window.location.hash === '#api' ? 'api' : 'text');

    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    window.addEventListener('hashchange', onHash);
    window.addEventListener('resize', handleResize);

    onHash();
    handleResize();

    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const selectTab = (tab: 'text' | 'api') => {
    setActiveTab(tab);
    if (window.location.hash !== `#${tab}`) history.replaceState(null, '', `#${tab}`);
  };

  const handleDeleteHoneytoken = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId);
      await deleteHoneytoken(tokenId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTokenId(null);
    }
  };

  const handleStartMonitoringText = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId);
      await startMonitorOnHoneytoken(tokenId);
    } catch (error) {
      console.error('Failed to start monitoring honeytoken:', error);
    } finally {
      setLoadingTokenId(null);
    }
  };

  const handleStopMonitoring = async (tokenId: string) => {
    try {
      setLoadingTokenId(tokenId);
      await stopMonitorOnHoneytoken(tokenId);
    } catch (error) {
      console.error('Failed to stop monitoring honeytoken:', error);
    } finally {
      setLoadingTokenId(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setLoadingGroupId(groupId);
      await deleteHoneytokensByGroupId(groupId);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupId(null);
    }
  };

  const renderTextTable = () => {
    let textTokens = honeytokens.filter((t) => t.type_id !== 'api');

    if (textTokens.length === 0) {
      return (
        <div className="text-honeytokens-container">
          <div className="text-table-container">
            <table className="text-honeytokens-table">
              <tbody>
                <tr>
                  <td colSpan={12} className="no-honeytokens">
                    No honeytokens found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    textTokens = [...textTokens].sort((a, b) => {
      const diff = cmp[sortKey](a, b);
      return sortDesc ? -diff : diff;
    });

    if (isMobile) {
      return (
        <div className="text-honeytokens-container">
          <div className="text-table-container">
            <table className="text-honeytokens-table">
              <thead>
                <tr>
                  <th>Honeytoken ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {textTokens.map((token) => (
                  <tr key={token.token_id}>
                    <td>{token.token_id}</td>
                    <td>
                      {(() => {
                        const s = statusOf(token);
                        return (
                          <span className={`text-status ${s}`}>
                            {s === 'monitored'
                              ? 'Monitored'
                              : s === 'not-connected'
                                ? 'Not Connected'
                                : 'Not Monitored'}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <div className="action-icons-text">
                        {statusOf(token) === 'monitored' ? (
                          <button onClick={() => handleStopMonitoring(token.token_id)}>
                            <FaStop className="action-icon stop" />
                          </button>
                        ) : statusOf(token) === 'not-connected' ? null : (
                          <button onClick={() => handleStartMonitoringText(token.token_id)}>
                            <FaPlay className="action-icon start" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteHoneytoken(token.token_id)}>
                          <FaTrash className="action-icon delete" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button className="details-icon-button" title="Details" onClick={() => setSelectedToken(token)}>
                        <FiInfo />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedToken && (
            <TextHoneytokenDetailsPopup honeytoken={selectedToken} onClose={() => setSelectedToken(null)} />
          )}
        </div>
      );
    }

    return (
      <div className="text-honeytokens-container">
        <div className="text-table-container">
          <table className="text-honeytokens-table">
            <thead>
              <tr>
                <th onClick={clickSort('agent')} title="Agent ID">
                  Agent ID{' '}
                  {sortKey === 'agent' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('token')} title="Token ID">
                  Token ID{' '}
                  {sortKey === 'token' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('group')} title="Group ID">
                  Group ID{' '}
                  {sortKey === 'group' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('created')} title="Creation Date">
                  Creation Date{' '}
                  {sortKey === 'created' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('expire')} title="Expire Date">
                  Expire Date{' '}
                  {sortKey === 'expire' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('location')} title="Location">
                  Location{' '}
                  {sortKey === 'location' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('file')} title="File Name">
                  File Name{' '}
                  {sortKey === 'file' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('data')} title="Data">
                  Data{' '}
                  {sortKey === 'data' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th onClick={clickSort('notes')} title="Notes">
                  Notes{' '}
                  {sortKey === 'notes' ? (
                    sortDesc ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronUp />
                    )
                  ) : (
                    <FiChevronUp style={{ opacity: 0.3 }} />
                  )}
                </th>

                <th title="Status">Status</th>
                <th title="Actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {textTokens.map((honeytoken) => (
                <tr key={honeytoken.token_id}>
                  <td title={honeytoken.agent_id}>{honeytoken.agent_id}</td>
                  <td title={honeytoken.token_id}>{honeytoken.token_id}</td>
                  <td title={honeytoken.group_id}>{honeytoken.group_id}</td>
                  <td title={new Date(honeytoken.creation_date).toLocaleString()}>
                    {new Date(honeytoken.creation_date).toLocaleString()}
                  </td>
                  <td title={new Date(honeytoken.expire_date).toLocaleString()}>
                    {new Date(honeytoken.expire_date).toLocaleString()}
                  </td>
                  <td title={honeytoken.location}>{honeytoken.location}</td>
                  <td title={honeytoken.file_name}>{honeytoken.file_name}</td>
                  <td title={honeytoken.data}>{honeytoken.data}</td>
                  <td title={honeytoken.notes}>{honeytoken.notes}</td>
                  <td>
                    {(() => {
                      const s = statusOf(honeytoken);
                      return (
                        <span className={`text-status ${s}`}>
                          {s === 'monitored' ? 'Monitored' : s === 'not-connected' ? 'Not Connected' : 'Not Monitored'}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="action-icons-text">
                      {statusOf(honeytoken) === 'monitored' ? (
                        <button
                          onClick={() => handleStopMonitoring(honeytoken.token_id)}
                          onMouseEnter={() => setHoveredIcon(`stop-${honeytoken.token_id}`)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Stop Monitoring"
                          disabled={loadingTokenId === honeytoken.token_id}
                          style={{
                            opacity: loadingTokenId === honeytoken.token_id ? 0.5 : 1,
                            pointerEvents: loadingTokenId === honeytoken.token_id ? 'none' : 'auto',
                          }}
                        >
                          <FaStop
                            className={`action-icon stop ${hoveredIcon === `stop-${honeytoken.token_id}` ? 'hovered' : ''}`}
                          />
                        </button>
                      ) : statusOf(honeytoken) === 'not-connected' ? null : (
                        <button
                          onClick={() => handleStartMonitoringText(honeytoken.token_id)}
                          onMouseEnter={() => setHoveredIcon(`start-${honeytoken.token_id}`)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Start Monitoring"
                          disabled={loadingTokenId === honeytoken.token_id}
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
                        disabled={loadingTokenId === honeytoken.token_id}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderApiTable = () => {
    const apiTokens = honeytokens.filter((t) => t.type_id === 'api');

    if (apiTokens.length === 0) {
      return (
        <div className="api-honeytokens-container">
          <div className="api-table-container">
            <table className="api-honeytokens-table">
              <tbody>
                <tr>
                  <td colSpan={12} className="no-honeytokens">
                    No honeytokens found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const groups = apiTokens.reduce(
      (acc, token) => {
        if (!acc[token.group_id]) acc[token.group_id] = [];
        acc[token.group_id].push(token);
        return acc;
      },
      {} as Record<string, IHoneytoken[]>,
    );

    return (
      <div className="api-honeytokens-container">
        <div className="api-table-container">
          <table className="api-honeytokens-table">
            <tbody>
              {Object.entries(groups).map(([groupId, tokens]) => {
                const first = tokens[0];
                const expanded = expandedGroups[groupId];

                const s = statusOf(first);

                <span className={`text-status ${s}`}>
                  {s === 'monitored' ? 'Monitored' : s === 'not-connected' ? 'Not Connected' : 'Not Monitored'}
                </span>;

                return (
                  <>
                    <tr key={groupId} className="group-row">
                      <td colSpan={12}>
                        <div className="group-header-row">
                          {isMobile ? (
                            <div className="mobile-api-group-box">
                              <div className="mobile-group-id" title={groupId}>
                                <strong>Group:</strong> {groupId}
                              </div>

                              <div className="mobile-api-actions-row">
                                <span
                                  className={`api-status ${s === 'monitored' ? 'monitored' : s === 'not-connected' ? 'not-connected' : 'not-monitored'}`}
                                  style={{ marginRight: '0.5rem' }}
                                >
                                  {s === 'monitored'
                                    ? 'Monitored'
                                    : s === 'not-connected'
                                      ? 'Not Connected'
                                      : 'Not Monitored'}
                                </span>

                                {s === 'monitored' ? (
                                  <button
                                    onClick={() => handleStopGroup(groupId)}
                                    disabled={loadingGroupId === groupId}
                                  >
                                    <FaStop className="action-icon stop" />
                                  </button>
                                ) : s === 'not-connected' ? null : (
                                  <button
                                    onClick={() => handleStartGroup(groupId)}
                                    disabled={loadingGroupId === groupId}
                                  >
                                    <FaPlay className="action-icon start" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteGroup(groupId)}
                                  disabled={loadingGroupId === groupId}
                                >
                                  <FaTrash className="action-icon delete" />
                                </button>

                                <button
                                  className="details-btn"
                                  onClick={() => setSelectedGroupToken(first)}
                                  title="Details"
                                >
                                  <FiInfo />
                                </button>

                                <button
                                  onClick={() => setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))}
                                >
                                  {expanded ? '▲' : '▼'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="group-col">
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
                              <span
                                className={`api-status ${s === 'monitored' ? 'monitored' : s === 'not-connected' ? 'not-connected' : 'not-monitored'}`}
                              >
                                {s === 'monitored'
                                  ? 'Monitored'
                                  : s === 'not-connected'
                                    ? 'Not Connected'
                                    : 'Not Monitored'}
                              </span>
                              <div className="action-icons-api">
                                {s === 'monitored' ? (
                                  <button
                                    onClick={() => handleStopGroup(groupId)}
                                    disabled={loadingGroupId === groupId}
                                  >
                                    <FaStop className="action-icon stop" />
                                  </button>
                                ) : s === 'not-connected' ? null : (
                                  <button
                                    onClick={() => handleStartGroup(groupId)}
                                    disabled={loadingGroupId === groupId}
                                  >
                                    <FaPlay className="action-icon start" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteGroup(groupId)}
                                  disabled={loadingGroupId === groupId}
                                >
                                  <FaTrash className="action-icon delete" />
                                </button>
                              </div>
                              <div className="expand-button-wrapper">
                                <button
                                  className="expand-button"
                                  onClick={() => setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))}
                                >
                                  {expanded ? '▲' : '▼'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <tr className="sub-header">
                        <th colSpan={12}>
                          <table className="sub-token-table">
                            <thead>
                              <tr>
                                <th>Method</th>
                                <th>Route</th>
                                <th>Response</th>
                                <th>Honeytoken ID</th>
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
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {selectedGroupToken && (
          <ApiHoneytokenDetailsPopup honeytoken={selectedGroupToken} onClose={() => setSelectedGroupToken(null)} />
        )}
      </div>
    );
  };
  return (
    <div className="honeytokens-container">
      <h1 className="honeytokens-title">Honeytokens Dashboard</h1>

      <div className="tab-buttons">
        <button className={`tab-button ${activeTab === 'text' ? 'active' : ''}`} onClick={() => selectTab('text')}>
          Text Tokens
        </button>

        <button className={`tab-button ${activeTab === 'api' ? 'active' : ''}`} onClick={() => selectTab('api')}>
          API Tokens
        </button>
      </div>

      {activeTab === 'text' ? renderTextTable() : renderApiTable()}
    </div>
  );
}

export default Honeytokens;
