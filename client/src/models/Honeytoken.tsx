export async function createHoneytokenText(
  fileName: string,
  ComponentAddresses: string,
  grade: number,
  expirationDate: string,
  notes: string,
  fileContent: string,
  agentID: string,
) {
  return await fetch('http://localhost:3000/api/honeytokens/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'text',
      file_name: fileName,
      location: ComponentAddresses,
      grade: grade,
      expiration_date: expirationDate,
      notes: notes,
      data: fileContent,
      agent_id: agentID,
    }),
  });
}

export async function getHoneytokens() {
  try {
    const response = await fetch('http://localhost:3000/api/honeytokens');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching honeytokens:', err);
  }
}

export async function deleteHoneytoken(token_id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/honeytokens/token/${token_id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error deleting honeytoken:', err);
  }
}

export async function startMonitorOnHoneytoken(token_id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/honeytokens/start`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token_id: token_id,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error starting monitor:', err);
  }
}

export async function stopMonitorOnHoneytoken(token_id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/honeytokens/stop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token_id: token_id,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error stopping monitor:', err);
  }
}

export async function isHoneytokenMonitored(token_id: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3000/api/honeytokens/monitor_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token_id: token_id,
      }),
    });
    if (response.ok && response.status === 200) {
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error checking if honeytoken is monitored:', err);
    return false;
  }
}
