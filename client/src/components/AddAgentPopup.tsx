import { useState } from 'react';
import { Card, Input } from './popup';
import '../styles/AddAgentPopup.css';
import { addAgent } from '../models/Agents';

interface AddAgentPopupProps {
  onClose: () => void;
}

function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [agentIP, setAgentIP] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentPort, setAgentPort] = useState<number>();

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Add Agent</h2>

          <div className="popup-content">
            <p>
              <label>Agent IP</label>
              <Input
                type="text"
                placeholder="Enter agent IP"
                value={agentIP}
                onChange={(e) => setAgentIP(e.target.value)}
              />
            </p>

            <p>
              <label>Agent Name</label>
              <Input
                type="text"
                placeholder="Enter agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </p>

            <p>
              <label>Agent Port</label>
              <Input
                type="number"
                placeholder="Enter agent port"
                value={agentPort}
                onChange={(e) => setAgentPort(Number(e.target.value))}
              />
            </p>
          </div>

          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              className="button button-primary"
              onClick={async () => {
                await addAgent(agentIP, agentName, agentPort);
                onClose();
              }}
            >
              Submit
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AddAgentPopup;
