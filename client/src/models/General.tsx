export interface ServerAddress {
  port: number;
}

export async function getServerAddress(): Promise<ServerAddress> {
  try {
    const res = await fetch('http://localhost:3000/api/server');

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data: ServerAddress = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching server address:', err);
    throw err;
  }
}

export async function getAddresses(): Promise<string[]> {
  try {
    const res = await fetch('http://localhost:3000/api/ips');

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data = await res.json();
    return data.ips;
  } catch (err) {
    console.error('Error fetching server address:', err);
    throw err;
  }
}
