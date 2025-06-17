export function copyToClipboard(text: string, setToast: React.Dispatch<React.SetStateAction<boolean>>) {
  navigator.clipboard.writeText(text).then(() => {
    setToast(true);
    setTimeout(() => setToast(false), 1000);
  });
}

export const bars = [1, 2, 3, 4, 5];

export const getColor = (grade: number, index: number): string => {
  const colors = {
    1: '#ffeb3b',
    2: '#fbc02d',
    3: '#ff9800',
    4: '#ef6c00',
    5: '#f44336',
  };

  return index <= grade ? colors[grade as keyof typeof colors] || '#e0e0e0' : '#e0e0e0';
};

export function eraseSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('biscuit');
  document.cookie = '';
}

export function logoutFromSession() {
  eraseSession();
  window.location.href = '/login';
}
