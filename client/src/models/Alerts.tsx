export async function getAlerts() {
  try {
    const response = await fetch('http://localhost:3000/api/alerts');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching alerts:', err);
  }
}

export async function archiveAlert(alertId: string, archive: boolean) {
  try {
    const response = await fetch('http://localhost:3000/api/alerts/archive/'+alertId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        archive: archive,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      alert('Failed to set alert as archive.');
      return false;
    } else {
      console.log('Alert set as archive successfully!');
      return true;
    }
  } catch (err) {
    console.error('Request failed:', err);
    alert('Something went wrong while setting alert as archive.');
    return false;
  }
}