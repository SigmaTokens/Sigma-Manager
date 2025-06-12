import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { IAlert } from '../../../server/interfaces/alert';
import { useAuth } from './UserContext';

export type AlertsContextType = {
  alerts: IAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<IAlert[]>>;
};

const AlertsContext = createContext<AlertsContextType>({
  alerts: [],
  setAlerts: () => {},
});

export const AlertsContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    let source: EventSource | null = null;

    if (currentUser) {
      const biscuit = localStorage.getItem('biscuit');
      if (biscuit) document.cookie = `biscuit=${biscuit}`;

      source = new EventSource('/api/alerts_sse', { withCredentials: true });
      source.onmessage = (event) => setAlerts(JSON.parse(event.data));
      source.onerror = (error) => console.error('SSE error: ', error);
    } else {
      setAlerts([]);
    }
    return () => {
      if (source) {
        source.close();
        source = null;
      }
    };
  }, [currentUser?.id]);

  return <AlertsContext.Provider value={{ alerts, setAlerts }}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => useContext(AlertsContext);
