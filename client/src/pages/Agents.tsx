import { useEffect, useState } from 'react';
import '../styles/Agents.css';
import { getAgents } from '../models/Agents';

function AgentsPage() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentData = await getAgents();
        setAgents(agentData);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    const interval = setInterval(() => {
      fetchAgents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="agents-container">
      <h2 className="agents-title">Agent List</h2>

      <div className="table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>IP</th>
              <th>Port</th>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id}>
                <td>{agent.name}</td>
                <td>{agent.ip}</td>
                <td>{agent.port}</td>
                <td>{agent.agent_id}</td>
                <td
                  className={`${
                    agent.status === 'online'
                      ? 'agents-status-online'
                      : agent.status === 'offline'
                        ? 'agents-status-offline'
                        : 'agents-status-unknown'
                  }`}
                >
                  {agent.status}
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
