export async function getAgents() {
  try {
    const response = await fetch('http://localhost:3000/api/agents', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      alert('Failed to fetch agents.');
    } else {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error('Request failed:', err);
    alert('Something went wrong while fetching agents.');
  }
}
