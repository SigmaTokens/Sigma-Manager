import React, { useEffect, useState } from 'react';
import { Card } from './popup';
import { getServerAddress, getAddresses } from '../models/General';
import '../styles/AddAgentPopup.css';
import { FaClipboard } from 'react-icons/fa';

interface AddAgentPopupProps {
  onClose: () => void;
}

interface ServerAddress {
  port: number;
}

export default function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [os, setOs] = useState<'Windows' | 'Linux' | 'MacOS'>('Windows');
  const [availableIps, setAvailableIps] = useState<string[]>([]);
  const [selectedIp, setSelectedIp] = useState<string>('');
  const [serverAddress, setServerAddress] = useState<ServerAddress>();
  const [agentName, setAgentName] = useState('');
  const [script, setScript] = useState('');
  const [showToast, setShowToast] = useState(false);

  // New states for connection mode
  const [connectionMode, setConnectionMode] = useState<'ip' | 'domain'>('ip');
  const [domainName, setDomainName] = useState<string>('');

  // 1) Load local IPs once on mount
  useEffect(() => {
    getAddresses()
      .then((ips) => {
        setAvailableIps(ips);
        if (ips.length > 0) setSelectedIp(ips[0]);
      })
      .catch(console.error);
  }, []);

  // 2) Fetch server address when in IP mode and selectedIp changes
  useEffect(() => {
    if (connectionMode === 'ip' && selectedIp) {
      getServerAddress()
        .then((addr) => setServerAddress(addr))
        .catch(console.error);
    }
  }, [connectionMode, selectedIp]);

  // 3) Build the install script whenever dependencies change
  useEffect(() => {
    let newScript = '';
    if (connectionMode === 'ip') {
      if (!serverAddress) return;
      newScript = generateScript(
        os,
        selectedIp,
        serverAddress.port,
        agentName,
        undefined,
      );
    } else {
      if (!domainName) return;
      newScript = generateScript(
        os,
        undefined,
        undefined,
        agentName,
        domainName,
      );
    }
    setScript(newScript);
  }, [os, serverAddress, agentName, connectionMode, domainName]);

  function copyToClipboard() {
    navigator.clipboard.writeText(script).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1000);
    });
  }

  return (
    <div className="overlay">
      <div className="popup-card-agent" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Add Agent</h2>

          {/* Connection Mode Selection */}
          <div className="instruction0">
            Add agent via:&nbsp;
            <label>
              <input
                type="radio"
                name="connectionMode"
                value="ip"
                checked={connectionMode === 'ip'}
                onChange={() => setConnectionMode('ip')}
              />{' '}
              IP & Port
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="connectionMode"
                value="domain"
                checked={connectionMode === 'domain'}
                onChange={() => setConnectionMode('domain')}
              />{' '}
              Domain
            </label>
          </div>

          {/* Domain Input */}
          {connectionMode === 'domain' && (
            <div className="instruction1">
              Enter domain:
              <input
                className="agent-input"
                type="text"
                placeholder="example.com:8080"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
            </div>
          )}

          {/* IP & Port Selection */}
          {connectionMode === 'ip' && (
            <div className="instruction1">
              Select your manager IP:
              <select
                className="agent-input"
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
              >
                {availableIps.map((ip) => (
                  <option key={ip} value={ip}>
                    {ip}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            Ensure you have the latest{' '}
            <a href="https://nodejs.org/en/download">node.js</a> and{' '}
            <a href="https://git-scm.com/downloads">git</a> installed.
          </div>

          {/* OS Instructions */}
          <div className="instruction4">{getOsInstructions(os)}</div>

          {/* OS Tabs */}
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

          {/* Script Section */}
          <div className="script-section">
            <p>Run this script:</p>
            <div className="script-with-button">
              <textarea className="script-box" readOnly value={script} />
              {showToast && <div className="toast">Copied!</div>}
              <FaClipboard className="copy-icon" onClick={copyToClipboard} />
            </div>
          </div>

          {/* Confirmation */}
          <div className="instruction6">
            Confirm the new agent on the Agents page.
          </div>

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
}

// Updated generateScript to handle domain or IP/port
function generateScript(
  os: string,
  manager_ip?: string,
  manager_port?: number,
  agentName?: string,
  manager_domain?: string,
): string {
  const header = `AGENT_NAME=${agentName || 'NEW AGENT'}`;
  switch (os) {
    case 'Windows':
      if (manager_domain) {
        return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
git clone https://github.com/SigmaTokens/Sigma-Agent.git
Set-Location Sigma-Agent
@"
MANAGER_DOMAIN=${manager_domain}
${header}
"@ | Out-File .env -Encoding utf8
npm run start-prod`;
      }
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
git clone https://github.com/SigmaTokens/Sigma-Agent.git
Set-Location Sigma-Agent
@"
MANAGER_IP=${manager_ip}
MANAGER_PORT=${manager_port}
${header}
"@ | Out-File .env -Encoding utf8
npm run start-prod`;
    case 'Linux':
      if (manager_domain) {
        return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_DOMAIN=${manager_domain}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-linux`;
      }
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_IP=${manager_ip}\nMANAGER_PORT=${manager_port}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-linux`;
    case 'MacOS':
      if (manager_domain) {
        return `echo "MANAGER_DOMAIN=${manager_domain}\n${header}" > .env && ./start-mac.sh`;
      }
      return `echo "MANAGER_IP=${manager_ip}\nMANAGER_PORT=${manager_port}\n${header}" > .env && ./start-mac.sh`;
    default:
      return 'OS not supported yet';
  }
}

function getOsInstructions(os: string): string {
  switch (os) {
    case 'Windows':
      return "Please open PowerShell as administrator and change to your install directory using 'cd'.";
    case 'Linux':
      return "Please open your terminal and change to your install directory using 'cd'.";
    case 'MacOS':
      return "Please open Terminal (Applications → Utilities → Terminal) and change to your install directory using 'cd'.";
    default:
      return 'OS not supported yet.';
  }
}
