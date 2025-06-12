import { logoutFromSession } from '../utilities/helpers';
export async function getHome(setSummary: any, setError: any) {
  try {
    const response = await fetch('/api/home', {
      method: 'GET',
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.force === true) logoutFromSession();
      setError('Failed to fetch dashboard data');
      return;
    }

    setSummary(payload);
  } catch (error) {
    setError('Failed to load dashboard data.');
  }
}
