import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
    let source: EventSource | null = null;

    if (currentUser) {
      const biscuit = localStorage.getItem('biscuit');
      if (biscuit) document.cookie = `biscuit=${biscuit}`;

      source = new EventSource('/api/agents_sse', { withCredentials: true });
      source.onmessage = (event) => setAgents(JSON.parse(event.data));
      source.onerror = (error) => console.error('SSE error: ', error);
    } else {
      setAgents([]);
    }

    return () => {
      if (source && currentUser) {
        source.close();
        source = null;
      }
    };
  }, [currentUser?.id]);

  return <AgentsContext.Provider value={{ agents, setAgents }}>{children}</AgentsContext.Provider>;
};

export const useAgents = () => useContext(AgentsContext);
