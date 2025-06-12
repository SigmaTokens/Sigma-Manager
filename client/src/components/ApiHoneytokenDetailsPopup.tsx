import '../styles/ApiHoneytokenDetailsPopup.css';
import { ApiHoneytokenDetailsPopupProps } from '../utilities/props';

const ApiHoneytokenDetailsPopup = ({ honeytoken, onClose }: ApiHoneytokenDetailsPopupProps) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>
        <h2>Honeytoken Group Info</h2>
        <div className="popup-details" onClick={(e) => e.stopPropagation()}>
          <p>
            <strong>Group ID:</strong> {honeytoken.group_id}
          </p>
          <p>
            <strong>Creation:</strong> {new Date(honeytoken.creation_date).toLocaleString()}
          </p>
          <p>
            <strong>Expire:</strong> {new Date(honeytoken.expire_date).toLocaleString()}
          </p>
          <p>
            <strong>Port:</strong> {honeytoken.api_port}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={honeytoken.isMonitored ? 'monitored' : 'not-monitored'} style={{ fontWeight: 'bold' }}>
              {honeytoken.isMonitored ? 'Monitored' : 'Not Monitored'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiHoneytokenDetailsPopup;
