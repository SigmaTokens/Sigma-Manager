import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
    let source: EventSource | null = null;

    if (currentUser) {
      const biscuit = localStorage.getItem('biscuit');
      if (biscuit) document.cookie = `biscuit=${biscuit}`;

      source = new EventSource('/api/honeytokens_sse', { withCredentials: true });
      source.onmessage = (event) => setHoneytokens(JSON.parse(event.data));
      source.onerror = (error) => console.error('SSE error: ', error);
    } else {
      setHoneytokens([]);
    }
    return () => {
      if (source) {
        source.close();
        source = null;
      }
    };
  }, [currentUser?.id]);

  return <HoneytokensContext.Provider value={{ honeytokens, setHoneytokens }}>{children}</HoneytokensContext.Provider>;
};

export const useHoneytokens = () => useContext(HoneytokensContext);
