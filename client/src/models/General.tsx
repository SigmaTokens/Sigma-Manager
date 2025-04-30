export async function getServerAddress() {
  try {
    const res = await fetch('http://localhost:3000/api/server');
    console.log(res);
  } catch (err) {
    console.error('Error fetching server address', err);
  }
}
