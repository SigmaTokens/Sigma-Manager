import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/SigmaTokens.png';
import CreateHoneytokenForm from './HoneyTokenCreation';
import AddAgentPopup from './AddAgentPopup';
import { getAgents } from '../models/Agents';
import { useAuth } from '../contexts/UserContext';
import { Globals } from '../utilities/globals';

import '../styles/Header.css';

function useAgents() {
  const [agents, setAgents] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        setAgents(await getAgents());
      } catch (err) {
        console.error('Failed to fetch agents', err);
      }
    })();
  }, []);
  return agents;
}

export default function Header() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);

  const agents = useAgents();

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="brand">
          <Link to="/">
            <img src={logo} alt="SigmaTokens logo" className="logo" />
          </Link>
        </div>

        <ul className="menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          {/* ---------- logged in ---------- */}
          {currentUser && (
            <li>
              <button onClick={handleLogout} className="link-btn">
                Logout
              </button>
            </li>
          )}

          {/* ---------- not logged in ---------- */}
          {!currentUser && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign&nbsp;Up</Link>
              </li>
            </>
          )}

          {/* ---------- logged in extras ---------- */}
          {currentUser && (
            <>
              <li>
                <Link to="/honeytokens">Honeytokens</Link>
              </li>
              <li>
                <Link to="/alerts">Alerts</Link>
              </li>
              <li>
                <Link to="/agents">Agents</Link>
              </li>
              <li>
                <button onClick={() => setShowCreate(true)}>Create</button>
              </li>
              <li>
                <button onClick={() => setShowAddAgent(true)}>Add Agent</button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* pop-ups only when a user is logged in */}
      {currentUser && showCreate && (
        <CreateHoneytokenForm types={Globals.honeytokenTypes} agents={agents} onClose={() => setShowCreate(false)} />
      )}

      {currentUser && showAddAgent && <AddAgentPopup onClose={() => setShowAddAgent(false)} />}
    </header>
  );
}
