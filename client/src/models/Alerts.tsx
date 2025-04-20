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
