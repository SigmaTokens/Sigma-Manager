import React from 'react';
import '../styles/TextTokenDetailsPopup.css';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';

interface Props {
  token: IHoneytoken;
  onClose: () => void;
}

const TextTokenDetailsPopup: React.FC<Props> = ({ token, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>
        <h2>Token Details</h2>
        <div className="popup-details">
          <p>
            <strong>Token ID:</strong> {token.token_id}
          </p>
          <p>
            <strong>Agent ID:</strong> {token.agent_id}
          </p>
          <p>
            <strong>Group ID:</strong> {token.group_id}
          </p>
          <p>
            <strong>Creation Date:</strong> {new Date(token.creation_date).toLocaleString()}
          </p>
          <p>
            <strong>Expire Date:</strong> {new Date(token.expire_date).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong> {token.location}
          </p>
          <p>
            <strong>File Name:</strong> {token.file_name}
          </p>
          <p>
            <strong>Data:</strong> {token.data}
          </p>
          <p>
            <strong>Notes:</strong> {token.notes}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextTokenDetailsPopup;
