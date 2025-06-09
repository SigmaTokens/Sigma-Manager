// AppRoutes.tsx
import { useAuth } from '../contexts/UserContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Welcome from './Welcome';
import Honeytokens from './Honeytokens';
import Alerts from './Alerts';
import AgentsPage from './Agents';
import Login from './Login';
import SignUp from './SignUp';

export default function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Home /> : <Welcome />} />

      {/* Protected routes redirect to /login if no user */}
      <Route path="/honeytokens" element={currentUser ? <Honeytokens /> : <Navigate to="/login" replace />} />
      <Route path="/alerts" element={currentUser ? <Alerts /> : <Navigate to="/login" replace />} />
      <Route path="/agents" element={currentUser ? <AgentsPage /> : <Navigate to="/login" replace />} />

      {/* Public routes redirect home if already logged in */}
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <SignUp />} />
    </Routes>
  );
}
