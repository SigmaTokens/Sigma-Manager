import { access_denied } from '../utilities/constants';
import { useLogout } from '../utilities/helpers';

export async function getHome(setSummary: any, setError: any) {
  try {
    const response = await fetch('/api/home', {
      method: 'GET',
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) useLogout();
      setError('Failed to fetch dashboard data');
    }

    setSummary(payload);
  } catch (error) {
    setError('Failed to load dashboard data.');
  }
}
