import React from 'react';
import { IAgent } from '../../../server/interfaces/agent';
import '../styles/AgentDetailsPopup.css';

interface Props {
  agent: IAgent;
  status: string;
  onClose: () => void;
}

const AgentDetailsPopup: React.FC<Props> = ({ agent, status, onClose }) => {
  return (
    <div className="agent-popup-overlay" onClick={onClose}>
      <div className="agent-popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="agent-popup-close" onClick={onClose}>
          ✕
        </button>
        <h2>Agent Details</h2>
        <div className="agent-popup-content">
          <p>
            <strong>Name:</strong> {agent.agent_name}
          </p>
          <p>
            <strong>Agent ID:</strong> {agent.agent_id}
          </p>
          <p>
            <strong>Validated:</strong> {agent.validated === 1 ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPopup;
