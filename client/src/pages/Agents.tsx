import { useEffect, useState } from 'react';
import '../styles/Agents.css';
import {
  getAgents,
  deleteAgent,
  verifyAgent,
  startAgent,
  stopAgent,
  isAgentMonitoring,
  areAgentsConnected,
  fetchAgents,
} from '../models/Agents';
import { IAgent, IAgentStatus } from '../../../server/interfaces/agent';
import { FaTrash, FaPlay, FaStop, FaCheckSquare } from 'react-icons/fa';

function AgentsPage() {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
    {},
  );
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
      setRefreshCounter((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleStart = async (agentId: string) => {
    try {
      await startAgent(agentId);
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.agent_id === agentId ? { ...agent, isMonitoring: true } : agent,
        ),
      );
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStop = async (agentId: string) => {
    try {
      await stopAgent(agentId);
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.agent_id === agentId
            ? { ...agent, isMonitoring: false }
            : agent,
        ),
      );
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  useEffect(() => {
    fetchAgents(setAgents, setStatusUpdates);
  }, [refreshCounter]);

  return (
    <div className="agents-container">
      <h2 className="agents-title">Agent List</h2>

      <div className="agents-refresh-button-wrapper">
        <button
          className="agents-refresh-statuses-button"
          onClick={() => setRefreshCounter((prev) => prev + 1)}
        >
          Refresh Statuses
        </button>
      </div>

      <div className="table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>IP</th>
              <th>Port</th>
              <th>ID</th>
              <th>Validated</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id}>
                <td>{agent.agent_name}</td>
                <td>{agent.agent_ip}</td>
                <td>{agent.agent_port}</td>
                <td>{agent.agent_id}</td>
                <td>{agent.validated == 0 ? 'no' : 'yes'}</td>
                <td
                  className={`agents-status-${statusUpdates[agent.agent_id] || 'unknown'}`}
                >
                  {statusUpdates[agent.agent_id] || 'unknown'}
                </td>
                <td>
                  <div className="action-icons">
                    {statusUpdates[agent.agent_id] !== 'unknown' &&
                      statusUpdates[agent.agent_id] !== 'offline' &&
                      (agent.isMonitoring ? (
                        <FaStop
                          className={`action-icon stop ${hoveredIcon === `stop-${agent.agent_id}` ? 'hovered' : ''}`}
                          onClick={() => handleStop(agent.agent_id)}
                          onMouseEnter={() =>
                            setHoveredIcon(`stop-${agent.agent_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Stop Agent"
                        />
                      ) : (
                        <FaPlay
                          className={`action-icon start ${hoveredIcon === `start-${agent.agent_id}` ? 'hovered' : ''}`}
                          onClick={() => handleStart(agent.agent_id)}
                          onMouseEnter={() =>
                            setHoveredIcon(`start-${agent.agent_id}`)
                          }
                          onMouseLeave={() => setHoveredIcon(null)}
                          title="Start Agent"
                        />
                      ))}
                    <FaTrash
                      className={`action-icon delete ${hoveredIcon === `delete-${agent.agent_id}` ? 'hovered' : ''}`}
                      onClick={() => handleDelete(agent.agent_id)}
                      onMouseEnter={() =>
                        setHoveredIcon(`delete-${agent.agent_id}`)
                      }
                      onMouseLeave={() => setHoveredIcon(null)}
                      title="Delete Agent"
                    />
                    {agent.validated == 0 ? (
                      <FaCheckSquare
                        className={`action-icon verify ${hoveredIcon === `verify-${agent.agent_id}` ? 'hovered' : ''}`}
                        onClick={() =>
                          verifyAgent(
                            agent.agent_id,
                            setAgents,
                            setStatusUpdates,
                          )
                        }
                        onMouseEnter={() =>
                          setHoveredIcon(`verify-${agent.agent_id}`)
                        }
                        onMouseLeave={() => setHoveredIcon(null)}
                        title="Verify Agent"
                      />
                    ) : (
                      <></>
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
