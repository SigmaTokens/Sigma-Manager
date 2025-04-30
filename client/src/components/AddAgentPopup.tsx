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

function generateScript(os: string): string {
  switch (os) {
    case 'Windows':
      return 'some windows script';
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
      return `some windows instruction`;
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
    //Todo: load the ip & port of the running server
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
          <div className="instruction2">1. {getOsInstructions(os)}</div>

          <div className="script-section">
            <label>Script:</label>
            <textarea
              className="script-box"
              readOnly
              value={generateScript(os)}
            />
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
