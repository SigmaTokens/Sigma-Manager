import { useEffect, useState } from 'react';
import '../styles/Agents.css';
import { getAgents, deleteAgent } from '../models/Agents';

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [statusUpdates, setStatusUpdates] = useState({});

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

  const handleDelete = async (agentId) => {
    try {
      await deleteAgent(agentId);
      setRefreshCounter((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const refreshStatuses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agents/status');
      const data = await response.json();

      const newStatuses = {};
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

      <div className="refresh-button-wrapper">
        <button className="refresh-statuses-button" onClick={refreshStatuses}>
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
                  className={`agent-status-${statusUpdates[agent.agent_id] || 'unknown'}`}
                >
                  {statusUpdates[agent.agent_id] || 'unknown'}
                </td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(agent.agent_id)}
                  >
                    Delete
                  </button>
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
