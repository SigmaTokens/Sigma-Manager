import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';
import { useAuth } from './UserContext';

export type HoneytokensContextType = {
  honeytokens: IHoneytoken[];
  setHoneytokens: React.Dispatch<React.SetStateAction<IHoneytoken[]>>;
};

const HoneytokensContext = createContext<HoneytokensContextType>({
  honeytokens: [],
  setHoneytokens: () => {},
});

export const HoneytokensContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [honeytokens, setHoneytokens] = useState<IHoneytoken[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setHoneytokens([]);
      return;
    }

    const biscuit = localStorage.getItem('biscuit');

    if (biscuit) document.cookie = `biscuit=${biscuit}`;

    const es = new EventSource('/api/honeytokens_sse', { withCredentials: true });

    es.onmessage = (event) => setHoneytokens(JSON.parse(event.data));

    es.onerror = (error) => console.error('SSE error: ', error);

    return () => es.close();
  }, [currentUser]);

  return <HoneytokensContext.Provider value={{ honeytokens, setHoneytokens }}>{children}</HoneytokensContext.Provider>;
};

export const useHoneytokens = () => useContext(HoneytokensContext);
