import { useEffect, useState } from 'react';
import { Card, Input } from './popup';
import '../styles/AddAgentPopup.css';
import { addAgent } from '../models/Agents';

interface AddAgentPopupProps {
  onClose: () => void;
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
      return 'some windows instruction';
    case 'Linux':
      return 'some linux instruction';
    case 'MacOS':
      return 'some macos instruction';
    default:
      return 'os not supported yet';
  }
}

function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [os, setOs] = useState<'Windows' | 'Linux' | 'MacOS'>('Windows');

  useEffect(() => {
    //Todo: load the ip & port of the running server
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

          <div className="instruction">{getOsInstructions(os)}</div>

          <div className="script-section">
            <label>Script:</label>
            <textarea
              className="script-box"
              readOnly
              value={generateScript(os)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AddAgentPopup;
