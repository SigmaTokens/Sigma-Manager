import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
    if (!currentUser) return;

    const token = localStorage.getItem('token');

    if (token) document.cookie = `token=${token}`;

    const es = new EventSource('/api/alerts_sse', { withCredentials: true });

    es.onmessage = (event) => setAlerts(JSON.parse(event.data));

    es.onerror = (error) => console.error('SSE error: ', error);

    return () => es.close();
  }, [currentUser]);

  return <AlertsContext.Provider value={{ alerts, setAlerts }}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => useContext(AlertsContext);
