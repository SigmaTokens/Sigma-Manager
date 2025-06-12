import { createContext, useContext, useState, ReactNode } from 'react';
import { Biscuit, PublicKey, SignatureAlgorithm } from '@biscuit-auth/biscuit-wasm';
import { User, UserContextValue } from '../utilities/props';
import { logoutFromSession } from '../utilities/helpers';

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return (await res.json()) as T;
}

function userFromBiscuit(biscuit: string): User {
  const decoded_biscuit = Biscuit.fromBase64(
    biscuit,
    PublicKey.fromString(import.meta.env.VITE_PUBLIC_KEY_BISCUIT, SignatureAlgorithm.Ed25519),
  );
  const source = decoded_biscuit.getBlockSource(0);

  const idMatch = source.match(/user\("([^"]+)"\)/);
  const unMatch = source.match(/username\("([^"]+)"\)/);

  if (!idMatch || !unMatch) throw new Error('Malformed biscuit');
  return { id: idMatch[1], username: unMatch[1] };
}

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const biscuit = localStorage.getItem('biscuit');
    if (!biscuit) return null;
    try {
      return userFromBiscuit(biscuit);
    } catch {
      localStorage.removeItem('biscuit');
      return null;
    }
  });

  /* ----------------- auth actions ----------------- */
  const login = async (username: string, password: string) => {
    const { biscuit } = await apiFetch<{ biscuit: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('biscuit', biscuit);
    setCurrentUser(userFromBiscuit(biscuit));
  };

  const signup = async (username: string, password: string) => {
    await apiFetch<void>('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    await login(username, password);
  };

  const logout = () => {
    setCurrentUser(null);
    logoutFromSession();
  };

  return <UserContext.Provider value={{ currentUser, login, signup, logout }}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
