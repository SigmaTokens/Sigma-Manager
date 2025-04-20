import { useEffect, useState } from 'react';
import '../styles/Header.css';
import logo from '../assets/logo.png';
import CreateHoneytokenForm from './HoneyTokenCreation';
import AddAgentPopup from '../components/AddAgentPopup';
import { getAgents } from '../models/Agents';

function useAgents() {
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
    fetchAgents();
  }, []);

  return agents;
}

function Header() {
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showAddAgentPopup, setShowAddAgentPopup] = useState(false);

  const honeytokenTypes = [{ id: '1', name: 'text file' }];
  const agents = useAgents();

  return (
    <header className="header">
      <nav>
        <div>
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/honeytokens">Honeytokens</a>
          </li>
          <li>
            <a href="/alerts">Alerts</a>
          </li>
          <li>
            <a href="/agents">Agents</a>
          </li>
          <li>
            <a onClick={() => setShowCreatePopup(true)}>Create</a>
          </li>
          <li>
            <a onClick={() => setShowAddAgentPopup(true)}>Add Agent</a>
          </li>
        </ul>
      </nav>

      {showCreatePopup && (
        <CreateHoneytokenForm
          types={honeytokenTypes}
          agents={agents}
          onClose={() => setShowCreatePopup(false)}
        />
      )}

      {showAddAgentPopup && (
        <AddAgentPopup onClose={() => setShowAddAgentPopup(false)} />
      )}
    </header>
  );
}

export default Header;
