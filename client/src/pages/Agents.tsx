import { useEffect, useState } from 'react';
import { deleteAgent, verifyAgent, startAgent, stopAgent } from '../models/Agents';
import { FaTrash, FaPlay, FaStop, FaCheckSquare } from 'react-icons/fa';
import { IAgent } from '../../../server/interfaces/agent';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { FaInfoCircle } from 'react-icons/fa';
import { useAgents } from '../contexts/AgentsContext';
import { useHoneytokens } from '../contexts/HoneytokensContext';
import AgentDetailsPopup from '../components/AgentDetailsPopup';
import '../styles/Agents.css';

function AgentsPage() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = async (agentId: string) => {
    try {
      setLoadingAgentId(agentId);
      await deleteAgent(agentId);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    } finally {
      setLoadingAgentId(null);
    }
  };

  const handleStart = async (agentId: string) => {
    try {
      setLoadingAgentId(agentId);
      await startAgent(agentId);
    } catch (error) {
      console.error('Failed to start agent:', error);
    } finally {
      setLoadingAgentId(null);
    }
  };

  const handleStop = async (agentId: string) => {
    try {
      setLoadingAgentId(agentId);
      await stopAgent(agentId);
    } catch (error) {
      console.error('Failed to stop agent:', error);
    } finally {
      setLoadingAgentId(null);
    }
  };

  if (isMobile) {
    return (
      <div className="agents-container">
        <h2 className="agents-title">Agent List</h2>

        <div className="table-container">
          <table className="agents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.agent_id}>
                  <td>{agent.agent_name}</td>
                  <td className={`agents-status-${agent.status}`}>{agent.status}</td>
                  <td>
                    <div className="action-icons">
                      <button
                        onClick={() => handleDelete(agent.agent_id)}
                        disabled={loadingAgentId === agent.agent_id}
                        title="Delete Agent"
                      >
                        <FaTrash className="action-icon delete" />
                      </button>
                      {agent.validated === 0 && (
                        <button
                          onClick={() => verifyAgent(agent.agent_id)}
                          disabled={loadingAgentId === agent.agent_id}
                          title="Verify Agent"
                        >
                          <FaCheckSquare className="action-icon verify" />
                        </button>
                      )}
                      {(agentsTokensMap.get(agent.agent_id)?.length ?? 0) > 0 &&
                        agent.validated === 1 &&
                        agent.status !== 'unknown' &&
                        agent.status !== 'offline' &&
                        (agent.isMonitoring ? (
                          <button
                            onClick={() => handleStop(agent.agent_id)}
                            disabled={loadingAgentId === agent.agent_id}
                            title="Stop Agent"
                          >
                            <FaStop className="action-icon stop" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStart(agent.agent_id)}
                            disabled={loadingAgentId === agent.agent_id}
                            title="Start Agent"
                          >
                            <FaPlay className="action-icon start" />
                          </button>
                        ))}
                    </div>
                  </td>
                  <td>
                    <button className="details-icon-button" onClick={() => setSelectedAgent(agent)} title="Details">
                      <FaInfoCircle className="details-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedAgent && (
          <AgentDetailsPopup
            agent={selectedAgent}
            status={selectedAgent.status}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="agents-container">
      <h2 className="agents-title">Agent List</h2>

      <div className="table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th title="Agent Name">Name</th>
              <th title="Agent ID">ID</th>
              <th title="Validation Status">Validated</th>
              <th title="Agent Status">Is Alive?</th>
              <th title="Agent Monitor">Is Monitoring?</th>
              <th title="Actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id}>
                <td title={agent.agent_name}>{agent.agent_name}</td>

                <td title={agent.agent_id}>{agent.agent_id}</td>

                <td title={agent.validated == 0 ? 'no' : 'yes'}>{agent.validated == 0 ? 'no' : 'yes'}</td>

                <td className={`agents-status-${agent.status}`} title={agent.status}>
                  {agent.status}
                </td>

                <td className={`agents-status-${agent.isMonitoring ? 'online' : 'offline'}`}>
                  {agent.isMonitoring ? 'yes' : 'no'}
                </td>

                <td>
                  <div className="action-icons">
                    {(agentsTokensMap.get(agent.agent_id)?.length ?? 0) > 0 &&
                      agent.validated == 1 &&
                      agent.status !== 'unknown' &&
                      agent.status !== 'offline' &&
                      (agent.isMonitoring ? (
                        <button
                          onClick={() => handleStop(agent.agent_id)}
                          disabled={loadingAgentId === agent.agent_id}
                          style={{
                            opacity: loadingAgentId === agent.agent_id ? 0.5 : 1,
                            pointerEvents: loadingAgentId === agent.agent_id ? 'none' : 'auto',
                          }}
                          onMouseEnter={() => setHoveredIcon(`stop-${agent.agent_id}`)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Stop Agent"
                        >
                          <FaStop
                            className={`action-icon stop ${hoveredIcon === `stop-${agent.agent_id}` ? 'hovered' : ''}`}
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(agent.agent_id)}
                          disabled={loadingAgentId === agent.agent_id}
                          style={{
                            opacity: loadingAgentId === agent.agent_id ? 0.5 : 1,
                            pointerEvents: loadingAgentId === agent.agent_id ? 'none' : 'auto',
                          }}
                          onMouseEnter={() => setHoveredIcon(`start-${agent.agent_id}`)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Start Agent"
                        >
                          <FaPlay
                            className={`action-icon start ${hoveredIcon === `start-${agent.agent_id}` ? 'hovered' : ''}`}
                          />
                        </button>
                      ))}

                    <button
                      onClick={() => handleDelete(agent.agent_id)}
                      disabled={loadingAgentId === agent.agent_id}
                      style={{
                        opacity: loadingAgentId === agent.agent_id ? 0.5 : 1,
                        pointerEvents: loadingAgentId === agent.agent_id ? 'none' : 'auto',
                      }}
                      onMouseEnter={() => setHoveredIcon(`delete-${agent.agent_id}`)}
                      onMouseLeave={() => setHoveredIcon(null)}
                      title="Delete Agent"
                    >
                      <FaTrash
                        className={`action-icon delete ${hoveredIcon === `delete-${agent.agent_id}` ? 'hovered' : ''}`}
                      />
                    </button>

                    {agent.validated == 0 && (
                      <button
                        onClick={() => verifyAgent(agent.agent_id)}
                        disabled={loadingAgentId === agent.agent_id}
                        style={{
                          opacity: loadingAgentId === agent.agent_id ? 0.5 : 1,
                          pointerEvents: loadingAgentId === agent.agent_id ? 'none' : 'auto',
                        }}
                        onMouseEnter={() => setHoveredIcon(`verify-${agent.agent_id}`)}
                        onMouseLeave={() => setHoveredIcon(null)}
                        title="Verify Agent"
                      >
                        <FaCheckSquare
                          className={`action-icon verify ${hoveredIcon === `verify-${agent.agent_id}` ? 'hovered' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgentsPage;
