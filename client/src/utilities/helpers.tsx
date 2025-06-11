import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';

export function copyToClipboard(text: string, setToast: React.Dispatch<React.SetStateAction<boolean>>) {
  navigator.clipboard.writeText(text).then(() => {
    setToast(true);
    setTimeout(() => setToast(false), 1000);
  });
}

export const bars = Array.from({ length: 10 }, (_, i) => i + 1);

export const getColor = (grade: number, index: number): string => {
  if (grade >= 8) return index <= grade ? '#f44336' : '#e0e0e0';
  if (grade >= 5) return index <= grade ? '#ff9800' : '#e0e0e0';
  return index <= grade ? '#4caf50' : '#e0e0e0';
};

export const eraseSession = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');

  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  const { hostname } = window.location;

  const parts = hostname.split('.');

  for (let i = 0; i < parts.length; i++) {
    const domain = '.' + parts.slice(i).join('.');
    document.cookie = `token=; ${expire}; path=/; domain=${domain};`;
  }

  document.cookie = `token=; ${expire}; path=/;`;
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return useCallback(async () => {
    logout();
    eraseSession();
    navigate('/login');
  }, [navigate]);
};
