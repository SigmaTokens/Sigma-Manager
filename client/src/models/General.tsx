export async function getServerAddress() {
  try {
    const res = await fetch('http://localhost:3000/api/server');
    const resJSON = await res.json();
    return resJSON;
  } catch (err) {
    console.error('Error fetching server address', err);
  }
}
