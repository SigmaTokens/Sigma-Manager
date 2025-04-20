import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/Main.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Honeytokens from './pages/Honeytokens';
import Alerts from './pages/Alerts';
import AgentsPage from './pages/Agents';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/honeytokens" element={<Honeytokens />}></Route>
        <Route path="/alerts" element={<Alerts />}></Route>
        <Route path="/agents" element={<AgentsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
