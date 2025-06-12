import React from 'react';
import { Button } from './Popup';
import { AlertDetailsPopupProps } from '../utilities/props';
import { isMobile, detailsGroups } from '../utilities/data';
import '../styles/AlertDetailsPopup.css';

const AlertDetailsPopup: React.FC<AlertDetailsPopupProps> = ({ alert, onClose }) => {
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
          {detailsGroups({ alert }).map((group, index) => (
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

          <br />

          {/* Full-width log section */}
          <div className="full-width-group">
            <h3 className="group-title">Log Details</h3>
            <div className="full-width-value">
              <pre>{alert.log}</pre>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="popup-footer">
            <Button className="button-primary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertDetailsPopup;
