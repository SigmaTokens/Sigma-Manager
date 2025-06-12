import React from 'react';
import '../styles/TextHoneytokenDetailsPopup.css';
import { TextHoneytokenDetailsPopupProps } from '../utilities/props';

const TextHoneytokenDetailsPopup: React.FC<TextHoneytokenDetailsPopupProps> = ({ honeytoken, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>
        <h2>Honeytoken Details</h2>
        <div className="popup-details">
          <p>
            <strong>Honeytoken ID:</strong> {honeytoken.token_id}
          </p>
          <p>
            <strong>Agent ID:</strong> {honeytoken.agent_id}
          </p>
          <p>
            <strong>Group ID:</strong> {honeytoken.group_id}
          </p>
          <p>
            <strong>Creation Date:</strong> {new Date(honeytoken.creation_date).toLocaleString()}
          </p>
          <p>
            <strong>Expire Date:</strong> {new Date(honeytoken.expire_date).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong> {honeytoken.location}
          </p>
          <p>
            <strong>File Name:</strong> {honeytoken.file_name}
          </p>
          <p>
            <strong>Data:</strong> {honeytoken.data}
          </p>
          <p>
            <strong>Notes:</strong> {honeytoken.notes}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextHoneytokenDetailsPopup;
