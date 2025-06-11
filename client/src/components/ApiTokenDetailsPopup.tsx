import React from 'react';
import '../styles/ApiTokenDetailsPopup.css';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';

interface Props {
  token: IHoneytoken;
  onClose: () => void;
}

const ApiTokenDetailsPopup = ({ token, onClose }: Props) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>
        <h2>Token Group Info</h2>
        <div className="popup-details" onClick={(e) => e.stopPropagation()}>
          <p>
            <strong>Group ID:</strong> {token.group_id}
          </p>
          <p>
            <strong>Creation:</strong> {new Date(token.creation_date).toLocaleString()}
          </p>
          <p>
            <strong>Expire:</strong> {new Date(token.expire_date).toLocaleString()}
          </p>
          <p>
            <strong>Port:</strong> {token.api_port}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={token.isMonitored ? 'monitored' : 'not-monitored'} style={{ fontWeight: 'bold' }}>
              {token.isMonitored ? 'Monitored' : 'Not Monitored'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiTokenDetailsPopup;
