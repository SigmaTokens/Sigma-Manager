import { access_denied } from '../utilities/constants';
import { logoutFromSession } from '../utilities/helpers';

export async function startAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error starting agent: ${error}`);
  }
}

export async function stopAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/stop`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error stopping agent: ${error}`);
  }
}

export async function deleteAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/agent/${agent_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error deleting agent: ${error}`);
  }
}

export async function verifyAgent(agent_id: string) {
  try {
    const response = await fetch(`/api/agents/verify/${agent_id}`, {
      method: 'GET',
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Error verifying agent: ${error}`);
  }
}
