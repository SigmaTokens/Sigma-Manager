import { useEffect, useState } from 'react';
import { Card } from './popup';
import { getServerAddress } from '../models/General';
import '../styles/AddAgentPopup.css';

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
): string {
  switch (os) {
    case 'Windows':
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

git clone https://github.com/SigmaTokens/Sigma-Agent.git

Set-Location Sigma-Agent

@"
MANAGER_IP=${manager_ip}
MANAGER_PORT=${manager_port}
"@ | Out-File .env -Encoding utf8

npm install

npm run start-prod`;
    case 'Linux':
      return 'some linux script';
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
      return 'some linux instruction';
    case 'MacOS':
      return 'some macos instruction';
    default:
      return 'os not supported yet';
  }
}

export default function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [os, setOs] = useState<'Windows' | 'Linux' | 'MacOS'>('Windows');
  const [serverAddress, setServerAddress] = useState<ServerAddress>();

  useEffect(() => {
    getServerAddress().then((address) => {
      setServerAddress(address);
    });
  }, []);

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

          <div className="instruction1">
            To connect a new/existing agent to server: {serverAddress?.ip}:
            {serverAddress?.port} please follow the next steps:
          </div>
          <br />

          <div className="instruction2">
            1. Make sure latest{' '}
            <a href="https://nodejs.org/en/download">node.js</a> and{' '}
            <a href="https://git-scm.com/downloads">git</a> versions installed
            on your system.
          </div>
          <br />
          <div className="instruction2">2. {getOsInstructions(os)}</div>

          <div className="script-section">
            <p>
              3. Run the next script (copy and paste it to the powershell cmd):
            </p>
            <textarea
              className="script-box"
              readOnly
              value={generateScript(os, serverAddress?.ip, serverAddress?.port)}
            />
          </div>

          <div className="instruction3">
            4. Go to Agents page and confirm the new agent there
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
