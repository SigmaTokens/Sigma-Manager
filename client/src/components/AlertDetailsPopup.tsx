import React from 'react';
import { Button } from './popup';
import '../styles/AlertDetailsPopup.css';
import { Alert } from '../../../server/interfaces/alert';

interface AlertDetailsPopupProps {
  alert: Alert;
  onClose: () => void;
}

const AlertDetailsPopup: React.FC<AlertDetailsPopupProps> = ({
  alert,
  onClose,
}) => {
  const detailsGroups = [
    {
      title: 'Basic Information',
      items: [
        { label: 'Alert ID', value: alert.alert_id },
        { label: 'Token ID', value: alert.token_id },
        { label: 'Grade', value: alert.grade },
        {
          label: 'Alert Date',
          value: new Date(parseInt(alert.alert_epoch)).toLocaleString(),
        },
      ],
    },
    {
      title: 'Access Details',
      items: [
        { label: 'Accessed By', value: alert.accessed_by },
        { label: 'Location', value: alert.location },
        { label: 'File Name', value: alert.file_name },
      ],
    },
    {
      title: 'Agent Information',
      items: [
        { label: 'Agent', value: `${alert.agent_ip}:${alert.agent_port}` },
      ],
    },
  ];

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Alert Details</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="popup-content">
          {detailsGroups.map((group, index) => (
            <div key={index} className="details-group">
              <h3 className="group-title">{group.title}</h3>
              <div className="details-grid">
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <div className="detail-label">{item.label}:</div>
                    <div className="detail-value">{item.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          <br></br>
          {/* Full-width log section */}
          <div className="full-width-group">
            <h3 className="group-title">Log Details</h3>
            <div className="full-width-value">
              <pre>{alert.log}</pre>
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <Button className="button-primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailsPopup;
