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
    let newInstallScript = '';
    const manager_host = import.meta.env.VITE_MANAGER_HOST;
    setManagerHost(manager_host);
    newInstallScript = generateInstallScript(os, managerHost, currentUser!.id, agentName);

    setInstallScript(newInstallScript);
    setUpdateScript(generateUpdateScript(os));
  }, [os, agentName, managerHost]);

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
          {/* Agent Name */}
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

          {/* Node/Git Instructions */}
          <div className="instruction3">
            Ensure you have the latest <a href="https://nodejs.org/en/download">node.js</a> and{' '}
            <a href="https://git-scm.com/downloads">git</a> installed.
          </div>

          {/* OS Instructions */}
          <div className="instruction4">{getOsInstructions(os)}</div>

          {/* OS Tabs */}
          <div className="tabs">
            {(Object.values(OS) as OS[]).map((tab) => (
              <span key={tab} className={`tab ${os === tab ? 'active' : ''}`} onClick={() => setOs(tab as typeof os)}>
                {tab}
              </span>
            ))}
          </div>

          {/* Script Section */}
          <div className="script-section">
            <p>Run this script:</p>
            <div className="script-with-button">
              <textarea className="install-script-box" readOnly value={installScript} />
              {installToast && <div className="toast">Copied!</div>}
              <FaClipboard className="copy-icon" onClick={() => copyToClipboard(installScript, setInstallToast)} />
            </div>
            <p>To update an existing agent, run:</p>
            <div className="script-with-button">
              <textarea className="update-script-box" readOnly value={updateScript} />
              <FaClipboard onClick={() => copyToClipboard(updateScript, setUpdateToast)} className="copy-icon" />
              {updateToast && <div className="toast">Copied!</div>}
            </div>
          </div>

          {/* Confirmation */}
          <div className="instruction6">Confirm the new agent on the Agents page.</div>

          {/* Close Button */}
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
