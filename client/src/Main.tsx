import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserContextProvider } from './contexts/UserContext';
import { AgentsContextProvider } from './contexts/AgentsContext';
import { HoneytokensContextProvider } from './contexts/HoneytokensContext';
import { Header } from './components/Header';
import AppRoutes from './pages/AppRoutes';
import './styles/Main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContextProvider>
      <AgentsContextProvider>
        <HoneytokensContextProvider>
          <BrowserRouter>
            <Header />
            <AppRoutes />
          </BrowserRouter>
        </HoneytokensContextProvider>
      </AgentsContextProvider>
    </UserContextProvider>
  </StrictMode>,
);
