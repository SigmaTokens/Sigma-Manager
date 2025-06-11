import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Biscuit, PublicKey, PrivateKey, SignatureAlgorithm, KeyPair } from '@biscuit-auth/biscuit-wasm';

/* ---------- User shape ---------- */
export interface User {
  id: string;
  username: string;
}

/* ---------- Context shape ---------- */
interface UserContextValue {
  currentUser: User | null;
  login: (u: string, p: string) => Promise<void>;
  signup: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

/* ---------- Tiny fetch helper ---------- */
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    throw new Error((await res.text()) || res.statusText);
  }
  return (await res.json()) as T;
}

/* ---------- Biscuit decode ---------- */
function userFromToken(token: string): User {
  console.log('checking public key value:', import.meta.env.VITE_PUBLIC_KEY_BISCUIT);
  const biscuit = Biscuit.fromBase64(
    token,
    PublicKey.fromString(import.meta.env.VITE_PUBLIC_KEY_BISCUIT, SignatureAlgorithm.Ed25519),
  ); // verifies sig
  const source = biscuit.getBlockSource(0); // authority block as Datalog

  // user("<id>")
  const idMatch = source.match(/user\("([^"]+)"\)/);
  // username("<name>")
  const unMatch = source.match(/username\("([^"]+)"\)/);

  if (!idMatch || !unMatch) throw new Error('Malformed token');

  return { id: idMatch[1], username: unMatch[1] };
}

/* ---------- Context ---------- */
const UserContext = createContext<UserContextValue>({
  currentUser: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return userFromToken(token);
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  });

  /* ---------- actions ---------- */
  const login = async (username: string, password: string) => {
    const { token } = await apiFetch<{ token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem('token', token);
    setCurrentUser(userFromToken(token));
  };

  const signup = async (username: string, password: string) => {
    await apiFetch<void>('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    await login(username, password); // auto-login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return <UserContext.Provider value={{ currentUser, login, signup, logout }}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
