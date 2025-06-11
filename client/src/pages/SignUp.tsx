import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';
import '../styles/SignUp.css';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signup(username.trim(), password);
      navigate('/'); // redirect home on success
    } catch (err: any) {
      // backend sends plain text like 'exists' on duplicate user
      setError(err.message || 'Sign-up failed');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        <div className="signup-container">
          <h1>Sign Up</h1>

          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <span className="signup-error">{error}</span>}

            <button type="submit">Create account</button>
          </form>

          <p>
            Already have an account?&nbsp;
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
