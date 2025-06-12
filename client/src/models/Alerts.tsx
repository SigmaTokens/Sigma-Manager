import { access_denied } from '../utilities/constants';
import { logoutFromSession } from '../utilities/helpers';

export async function getAlerts() {
  try {
    const response = await fetch('/api/alerts', {
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(`Error fetching alerts: ${error}`);
  }
}

export async function archiveAlert(tokenId: string, alertId: string, archive: boolean): Promise<Boolean> {
  try {
    const response = await fetch('/api/alerts/archive', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        archive: archive,
        token_id: tokenId,
        alert_id: alertId,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      const errorText = await response.text();
      console.error('Error:', errorText);
      alert('Failed to set alert as archive.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Request failed:', error);
    alert('Something went wrong while setting alert as archive.');
    return false;
  }
}
