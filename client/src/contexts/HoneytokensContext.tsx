import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';

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

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      document.cookie = `token=${token}`;
    }

    const es = new EventSource('/api/honeytokens_sse', { withCredentials: true });

    es.onmessage = (event) => {
      console.log('honeytokens: ', JSON.parse(event.data));
      setHoneytokens(JSON.parse(event.data));
    };

    es.onerror = (error) => {
      console.error('SSE error: ', error);
    };
    return () => {
      es.close();
    };
  }, []);

  return <HoneytokensContext.Provider value={{ honeytokens, setHoneytokens }}>{children}</HoneytokensContext.Provider>;
};

export const useHoneytokens = () => useContext(HoneytokensContext);
