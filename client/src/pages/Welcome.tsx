import '../styles/Welcome.css';
import logo from '../assets/SigmaTokens.png';
import { useAuth } from '../contexts/UserContext'; // adjust the path if needed
import { ErrorPopup } from '../../popup.tsx';
function Welcome() {
  const { currentUser } = useAuth(); // ← see if someone is logged-in

  return (
    <div className="home-container">
      <img src={logo} alt="SigmaTokens Logo" className="welcome-logo" />

      <h1 className="welcome-title">Welcome to SigmaTokens</h1>
      <p className="welcome-subtitle">Proactive Intrusion Detection using deception technology.</p>

      <p className="welcome-description">
        SigmaTokens is an Intrusion Detection System that identifies unauthorized access attempts by deploying
        honeytokens—fake, intentionally crafted data—across endpoints. These honeytokens are designed to lure attackers
        and generate alerts when accessed. The system tracks these interactions and logs detailed information about
        suspicious activity. With SigmaTokens, users can create and manage honeytokens, monitor alerts, and gain
        valuable insights into potential threats. By using deception as a detection method, SigmaTokens enhances
        visibility into malicious behavior and supports early threat identification.
      </p>

      <div className="features">
        <h2>Why SigmaTokens?</h2>
        <ul className="features-list">
          <li>🧪 Deploys honeytokens to catch attackers in action</li>
          <li>🔐 Real-time detection of unauthorized access</li>
          <li>📊 Easy-to-use dashboard with alerts and analytics</li>
          <li>🚀 Lightweight setup&nbsp;– up and running in minutes</li>
        </ul>
      </div>

      {/* Render the call-to-action only for guests */}
      {!currentUser && (
        <>
          <p className="join-callout">
            <strong>Want to get started? Join now and secure your environment.</strong>
          </p>

          <div className="cta-buttons">
            <a href="/login" className="btn">
              Login
            </a>
            <a href="/signup" className="btn secondary">
              Sign Up
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default Welcome;