export async function createHoneytokenText(
  fileName: string,
  ComponentAddresses: string,
  grade: number,
  expirationDate: string,
  notes: string,
  fileContent: string,
  agentID: string,
) {
  return await fetch('http://localhost:3000/api/honeytoken/text', {
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
    const response = await fetch(
      `http://localhost:3000/api/honeytokens/token/${token_id}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error deleting honeytoken:', err);
  }
}

export async function startMonitorOnHoneytoken(agent_id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/agents/start`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error starting agent:', err);
  }
}

export async function stopMonitorOnHoneytoken(agent_id: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/agents/stop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error stopping agent:', err);
  }
}

export async function isHoneytokenMonitored(
  agent_id: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/agents/monitor_status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent_id,
        }),
      },
    );
    if (response.ok || response.status === 200) {
      console.log('agent is monitoring');
      return true;
    }
    console.log('agent is not monitoring');
    return false;
  } catch (err) {
    console.error('Error stopping agent:', err);
    return false;
  }
}
