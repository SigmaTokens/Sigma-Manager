import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IAgent } from '../../../server/interfaces/agent';
import { useAuth } from './UserContext';

export type AgentsContextType = {
  agents: IAgent[];
  setAgents: React.Dispatch<React.SetStateAction<IAgent[]>>;
};

const AgentsContext = createContext<AgentsContextType>({
  agents: [],
  setAgents: () => {},
});

export const AgentsContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<IAgent[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setAgents([]);
      return;
    }

    const biscuit = localStorage.getItem('biscuit');

    if (biscuit) document.cookie = `biscuit=${biscuit}`;

    const es = new EventSource('/api/agents_sse', { withCredentials: true });

    es.onmessage = (event) => setAgents(JSON.parse(event.data));

    es.onerror = (error) => console.error('SSE error: ', error);

    return () => es.close();
  }, [currentUser]);

  return <AgentsContext.Provider value={{ agents, setAgents }}>{children}</AgentsContext.Provider>;
};

export const useAgents = () => useContext(AgentsContext);
