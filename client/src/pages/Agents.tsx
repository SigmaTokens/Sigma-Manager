import { useEffect, useState } from 'react';
import '../styles/Agents.css';
import {
  getAgents,
  deleteAgent,
  startAgent,
  stopAgent,
} from '../models/Agents';
import { IAgent, IAgentStatus } from '../../../server/interfaces/agent';
import { FaTrash } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { FaStop } from 'react-icons/fa';

function AgentsPage() {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
    {},
  );
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentData = await getAgents();
        setAgents(agentData);
        refreshStatuses();
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    fetchAgents();
  }, [refreshCounter]);

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
      refreshStatuses();
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStop = async (agentId: string) => {
    try {
      await stopAgent(agentId);
      refreshStatuses();
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const refreshStatuses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agents/status');
      const data: IAgentStatus[] = await response.json();

      const newStatuses: Record<string, string> = {};
      data.forEach(({ agent_id, status }) => {
        newStatuses[agent_id] = status;
      });

      setStatusUpdates((prev) => ({ ...prev, ...newStatuses }));
    } catch (error) {
      console.error('Failed to refresh statuses:', error);
    }
  };

  return (
    <div className="agents-container">
      <h2 className="agents-title">Agent List</h2>

      <div className="agents-refresh-button-wrapper">
        <button
          className="agents-refresh-statuses-button"
          onClick={refreshStatuses}
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
                <td
                  className={`agents-status-${statusUpdates[agent.agent_id] || 'unknown'}`}
                >
                  {statusUpdates[agent.agent_id] || 'unknown'}
                </td>
                <td>
                  <div className="action-icons">
                    <FaPlay
                      className={`action-icon ${hoveredIcon === `start-${agent.agent_id}` ? 'hovered' : ''}`}
                      onClick={() => handleStart(agent.agent_id)}
                      onMouseEnter={() =>
                        setHoveredIcon(`start-${agent.agent_id}`)
                      }
                      onMouseLeave={() => setHoveredIcon(null)}
                      title="Start Agent"
                    />
                    <FaStop
                      className={`action-icon ${hoveredIcon === `stop-${agent.agent_id}` ? 'hovered' : ''}`}
                      onClick={() => handleStop(agent.agent_id)}
                      onMouseEnter={() =>
                        setHoveredIcon(`stop-${agent.agent_id}`)
                      }
                      onMouseLeave={() => setHoveredIcon(null)}
                      title="Stop Agent"
                    />
                    <FaTrash
                      className={`action-icon ${hoveredIcon === `delete-${agent.agent_id}` ? 'hovered' : ''}`}
                      onClick={() => handleDelete(agent.agent_id)}
                      onMouseEnter={() =>
                        setHoveredIcon(`delete-${agent.agent_id}`)
                      }
                      onMouseLeave={() => setHoveredIcon(null)}
                      title="Delete Agent"
                    />
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
