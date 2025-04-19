import { useState } from 'react';
import { Card, Input } from './popup';
import '../styles/AddAgentPopup.css';

interface AddAgentPopupProps {
  onClose: () => void;
}

function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  const [agentIP, setAgentIP] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentPort, setAgentPort] = useState<number>();

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agents/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: agentIP,
          name: agentName,
          port: agentPort,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error:', errorText);
        alert('Failed to add agent.');
      } else {
        console.log('Agent added successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Request failed:', err);
      alert('Something went wrong while adding the agent.');
    }
  };

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

            <button className="button button-primary" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AddAgentPopup;
