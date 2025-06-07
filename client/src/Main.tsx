import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/Main.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Honeytokens from './pages/Honeytokens';
import Alerts from './pages/Alerts';
import AgentsPage from './pages/Agents';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Welcome from './pages/Welcome';

const isLoggedIn = false; // TODO: Replace with real auth logic


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Home /> : <Welcome />} />
        <Route path="/honeytokens" element={<Honeytokens />}></Route>
        <Route path="/alerts" element={<Alerts />}></Route>
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
