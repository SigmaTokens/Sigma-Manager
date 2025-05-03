import { useEffect, useState } from 'react';
import { Card } from './popup';
import { getServerAddress } from '../models/General';
import '../styles/AddAgentPopup.css';
import { useAsyncError } from 'react-router-dom';
import { FaClipboard } from 'react-icons/fa';

interface AddAgentPopupProps {
  onClose: () => void;
}

interface ServerAddress {
  ip: string;
  port: number;
}

function generateScript(
  os: string,
  manager_ip: string | undefined,
  manager_port: number | undefined,
  agentName: string,
): string {
  switch (os) {
    case 'Windows':
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

git clone https://github.com/SigmaTokens/Sigma-Agent.git

Set-Location Sigma-Agent

git pull
git checkout daniel001

@"
MANAGER_IP=${manager_ip}
MANAGER_PORT=${manager_port}
AGENT_NAME=${agentName ? agentName : 'NEW AGENT'}
"@ | Out-File .env -Encoding utf8

npm run start-prod`;

    case 'Linux':
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \\
cd Sigma-Agent && \\
git pull && \\
git checkout daniel001 && \\
printf "MANAGER_IP=${manager_ip}\\nMANAGER_PORT=${manager_port}\\nAGENT_NAME=${agentName || 'NEW AGENT'}\\n" | tee .env > /dev/null && \\
npm run start-prod-linux`;

    case 'MacOS':
      return 'some macos script';
    default:
      return 'os not supported yet';
  }
}

function getOsInstructions(os: string): string {
  switch (os) {
    case 'Windows':
      return `Please open powershell as administrator and change desired install directory using 'cd'`;
    case 'Linux':
      return `Please open your terminal and change to the desired install directory using 'cd'.`;
    case 'MacOS':
      return `Please open Terminal (Applications → Utilities → Terminal) and change to the desired install directory using 'cd'.`;
    default:
      return 'os not supported yet';
  }
}

function copyToClipboard(script: string, setShowToast: any) {
  navigator.clipboard.writeText(script).then(() => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  });
}

export default function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [os, setOs] = useState<'Windows' | 'Linux' | 'MacOS'>('Windows');
  const [serverAddress, setServerAddress] = useState<ServerAddress>();
  const [agentName, setAgentName] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    getServerAddress().then((address) => {
      setServerAddress(address);
    });
  }, []);

  useEffect(() => {
    const newScript = generateScript(
      os,
      serverAddress?.ip,
      serverAddress?.port,
      agentName,
    );
    setScript(newScript);
  }, [os, agentName, serverAddress]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup-card-agent" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Add Agent</h2>
          <div className="tabs">
            {['Windows', 'Linux', 'MacOS'].map((tab) => (
              <span
                key={tab}
                className={`tab ${os === tab ? 'active' : ''}`}
                onClick={() => setOs(tab as typeof os)}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="instruction0">
            To connect a new/existing agent to server: {serverAddress?.ip}:
            {serverAddress?.port} please follow the next steps:
          </div>
          <br />
          <div className="instruction1">
            1. Please name the new agent:
            <input
              id="agentName"
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
              className="agent-input"
            />
          </div>
          <br />
          <div className="instruction2">
            2. Make sure latest{' '}
            <a href="https://nodejs.org/en/download">node.js</a> and{' '}
            <a href="https://git-scm.com/downloads">git</a> versions installed
            on your system.
          </div>
          <br />
          <div className="instruction3">3. {getOsInstructions(os)}</div>

          <div className="script-section">
            <p>
              4. Run the next script (copy and paste it to the powershell cmd):
            </p>
            <div className="script-with-button">
              <textarea className="script-box" readOnly value={script} />
              {showToast && <div className="toast">Copied!</div>}
              <FaClipboard
                className="copy-icon"
                onClick={() => {
                  copyToClipboard(script, setShowToast);
                }}
              />
            </div>
          </div>
          <br />
          <div className="instruction5">
            5. Go to Agents page and confirm the new agent there
          </div>

          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
