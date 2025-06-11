import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';
import { Globals } from '../utilities/globals';
import { useRef } from 'react';
import logo from '../assets/SigmaTokens.png';
import CreateHoneytokenForm from './HoneyTokenCreation';
import AddAgentPopup from './AddAgentPopup';
import '../styles/Header.css';

export function Header() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const menuRef = useRef<HTMLUListElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

        <button className="hamburger-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} ref={hamburgerRef}>
          ☰
        </button>

        <ul className="menu desktop-only">
          <li>
            <Link to="/">Home</Link>
          </li>

          {currentUser && (
            <li className="logout">
              <button onClick={handleLogout} className="link-btn">
                Logout
              </button>
            </li>
          )}

          {!currentUser && (
            <>
              <li className="login">
                <Link to="/login">Login</Link>
              </li>
              <li className="signup">
                <Link to="/signup">Sign&nbsp;Up</Link>
              </li>
            </>
          )}

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

        {mobileMenuOpen && (
          <ul className="mobile-menu" ref={menuRef}>
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>

            {!currentUser && (
              <>
                <li>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            {currentUser && (
              <>
                <li>
                  <Link to="/honeytokens" onClick={() => setMobileMenuOpen(false)}>
                    Honeytokens
                  </Link>
                </li>
                <li>
                  <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>
                    Alerts
                  </Link>
                </li>
                <li>
                  <Link to="/agents" onClick={() => setMobileMenuOpen(false)}>
                    Agents
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowCreate(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Create
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowAddAgent(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Add Agent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        )}
      </nav>

      {currentUser && showCreate && (
        <CreateHoneytokenForm types={Globals.honeytokenTypes} onClose={() => setShowCreate(false)} />
      )}

      {currentUser && showAddAgent && <AddAgentPopup onClose={() => setShowAddAgent(false)} />}
    </header>
  );
}
