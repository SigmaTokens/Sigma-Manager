import React from 'react';
import { Button } from './popup';
import '../styles/AlertDetailsPopup.css';

interface AlertDetailsPopupProps {
  alert: any;
  onClose: () => void;
}

const AlertDetailsPopup: React.FC<AlertDetailsPopupProps> = ({
  alert,
  onClose,
}) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h2>Alert Details</h2>
        <div className="popup-content">
          <p>
            <strong>Alert ID:</strong> {alert.alert_id}
          </p>
          <p>
            <strong>Token ID:</strong> {alert.token_id}
          </p>
          <p>
            <strong>Accessed By:</strong> {alert.accessed_by}
          </p>
          <p>
            <strong>Location:</strong> {alert.location}
          </p>
          <p>
            <strong>File Name:</strong> {alert.file_name}
          </p>
          <p>
            <strong>Agent:</strong> {alert.agent_ip}:{alert.agent_port}
          </p>
          <p>
            <strong>Grade:</strong> {alert.grade}
          </p>
          <p>
            <strong>Log:</strong> {alert.log}
          </p>
          <p>
            <strong>Alert Date:</strong>{' '}
            {new Date(alert.alert_epoch).toLocaleString()}
          </p>
        </div>

        <div className="popup-footer">
          <Button className="button-outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsPopup;
