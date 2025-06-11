export async function startAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
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

export async function stopAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/stop`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
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

export async function deleteAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/agent/${agent_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error deleting agent:', err);
  }
}

export async function verifyAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/verify/${agent_id}`, {
      method: 'GET',
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });
  } catch (err) {
    console.error('Error verifying agent: ', err);
  }
}
