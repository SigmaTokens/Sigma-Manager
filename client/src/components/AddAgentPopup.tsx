import { useEffect, useState } from 'react';
import { Card } from './Popup';
import { FaClipboard } from 'react-icons/fa';
import { generateInstallScript, generateUpdateScript, getOsInstructions } from '../utilities/agent_install_scripts';
import { OS } from '../utilities/typing';
import '../styles/AddAgentPopup.css';
import { useAuth } from '../contexts/UserContext';
import { copyToClipboard } from '../utilities/helpers';
import { AddAgentPopupProps } from '../utilities/props';

const AddAgentPopup = ({ onClose }: AddAgentPopupProps) => {
  const [os, setOs] = useState<OS>(OS.Windows);
  const [managerHost, setManagerHost] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [installToast, setInstallToast] = useState(false);
  const [updateToast, setUpdateToast] = useState(false);
  const [installScript, setInstallScript] = useState('');
  const [updateScript, setUpdateScript] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const manager_host = import.meta.env.VITE_MANAGER_HOST;
    setManagerHost(manager_host);
    setInstallScript(generateInstallScript(os, manager_host, currentUser!.id, agentName));
    setUpdateScript(generateUpdateScript(os));
    // eslint-disable-next-line
  }, [os, agentName, managerHost]);

  // Optionally: Click textarea to copy
  const handleCopyInstall = () => {
    copyToClipboard(installScript, setInstallToast);
  };
  const handleCopyUpdate = () => {
    copyToClipboard(updateScript, setUpdateToast);
  };

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="popup-card-agent">
        <Card>
          <h2 className="popup-title">Add Agent</h2>

          <div className="instruction2">
            Name the new agent:
            <input
              className="agent-input"
              type="text"
              placeholder="Enter agent name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </div>

          <div className="instruction3">
            Ensure you have the latest{' '}
            <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">
              node.js
            </a>{' '}
            and{' '}
            <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer">
              git
            </a>{' '}
            installed.
          </div>

          <div className="instruction4">{getOsInstructions(os)}</div>

          <div className="tabs">
            {(Object.values(OS) as OS[]).map((tab) => (
              <span key={tab} className={`tab ${os === tab ? 'active' : ''}`} onClick={() => setOs(tab as typeof os)}>
                {tab}
              </span>
            ))}
          </div>

          <div className="script-section">
            <p className="script-label">Run this script:</p>
            <div className="script-box-wrapper">
              <textarea
                className="install-script-box"
                readOnly
                value={installScript}
                onClick={handleCopyInstall}
                title="Click to copy"
              />
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopyInstall}
                aria-label="Copy script"
                tabIndex={0}
              >
                <FaClipboard />
              </button>
              {installToast && <div className="toast-local">Copied!</div>}
            </div>

            <p className="script-label">To update an existing agent, run:</p>
            <div className="script-box-wrapper">
              <textarea
                className="update-script-box"
                readOnly
                value={updateScript}
                onClick={handleCopyUpdate}
                title="Click to copy"
              />
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopyUpdate}
                aria-label="Copy update command"
                tabIndex={0}
              >
                <FaClipboard />
              </button>
              {updateToast && <div className="toast-local">Copied!</div>}
            </div>
          </div>

          <div className="instruction6">Confirm the new agent on the Agents page.</div>
          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddAgentPopup;
