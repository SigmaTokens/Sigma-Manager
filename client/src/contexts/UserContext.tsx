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
/**
 *  Replace with the public key that the back-end prints once:
 *    console.log('public →', KeyPair.fromPrivateKey(rootPriv).getPublicKey().toString());
 *  Keep it **64 hex chars**, no prefix.
 */
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('hex string must have an even length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; ++i) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

const bytes = hexToBytes('9009afe0a2047edaee54e520047884cf19fe821e1f2390983dcc1e0f71924de5');
const privateKey = PrivateKey.fromBytes(bytes, SignatureAlgorithm.Ed25519);

console.log('public →', KeyPair.fromPrivateKey(privateKey).getPublicKey().toString());

function userFromToken(token: string): User {
  const biscuit = Biscuit.fromBase64(token, KeyPair.fromPrivateKey(privateKey).getPublicKey()); // verifies sig
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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /* ---------- boot: parse token from storage ---------- */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const user = userFromToken(token);
      setCurrentUser(user);
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  /* ---------- actions ---------- */
  const login = async (username: string, password: string) => {
    const { token } = await apiFetch<{ token: string }>('http://localhost:3000/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem('token', token);
    setCurrentUser(userFromToken(token));
  };

  const signup = async (username: string, password: string) => {
    await apiFetch<void>('http://localhost:3000/api/signup', {
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
