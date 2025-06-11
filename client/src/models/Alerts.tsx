export async function getAlerts() {
  try {
    const response = await fetch('/api/alerts', {
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching alerts:', err);
  }
}

export async function archiveAlert(tokenId: string, alertId: string, archive: boolean): Promise<Boolean> {
  try {
    const response = await fetch('/api/alerts/archive', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        archive: archive,
        token_id: tokenId,
        alert_id: alertId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      alert('Failed to set alert as archive.');
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error('Request failed:', err);
    alert('Something went wrong while setting alert as archive.');
    return false;
  }
}
