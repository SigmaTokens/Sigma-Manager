import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';
import '../styles/Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(username.trim(), password);
      navigate('/'); // go to home after success
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="login-container">
      <h1>Login</h1>

      <form onSubmit={handleSubmit} className="login-form">
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

        {error && <span className="login-error">{error}</span>}

        <button type="submit">Login</button>
      </form>

      <p>
        Don&apos;t have an account?&nbsp;
        <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
