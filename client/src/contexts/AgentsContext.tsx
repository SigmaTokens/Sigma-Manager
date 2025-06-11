import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IAgent } from '../../../server/interfaces/agent';

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

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      document.cookie = `token=${token}`;
    }

    const es = new EventSource('/api/agents_sse', { withCredentials: true });

    es.onmessage = (event) => {
      setAgents(JSON.parse(event.data));
    };

    es.onerror = (error) => {
      console.error('SSE error: ', error);
    };
    return () => {
      es.close();
    };
  }, []);

  return <AgentsContext.Provider value={{ agents, setAgents }}>{children}</AgentsContext.Provider>;
};

export const useAgents = () => useContext(AgentsContext);
