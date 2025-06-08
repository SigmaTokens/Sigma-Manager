import { IAgentStatus } from '../../../server/interfaces/agent';
import { HoneytokenType } from '../utilities/typing';
import { areAgentsConnected } from './Agents';

export async function createHoneytokenText(
  fileName: string,
  ComponentAddresses: string,
  grade: number,
  expirationDate: string,
  notes: string,
  fileContent: string,
  agentID: string,
) {
  return await fetch('/api/honeytokens/text', {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: HoneytokenType.Text,
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

export async function createHoneytokenApi(
  grade: number,
  expirationDate: string,
  notes: string,
  agentID: string,
  apiPort: number,
  apis: any[],
) {
  return await fetch('/api/honeytokens/api', {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: HoneytokenType.API,
      grade: grade,
      expiration_date: expirationDate,
      notes: notes,
      agent_id: agentID,
      api_port: apiPort,
      apis: apis,
    }),
  });
}

export async function getHoneytokens() {
  try {
    const response = await fetch('/api/honeytokens', {
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });
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
    const response = await fetch(`/api/honeytokens/token/${token_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
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
    const response = await fetch(`/api/honeytokens/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
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
    const response = await fetch(`/api/honeytokens/stop`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
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

export async function getHoneytokensMonitorStatusesText(): Promise<Record<string, boolean>> {
  try {
    const agents_data: IAgentStatus[] = await areAgentsConnected();

    const agents_ids: string[] = agents_data
      .filter(({ status }) => status === 'online')
      .map(({ agent_id }) => agent_id);

    if (agents_ids.length === 0) {
      return {}; // Early exit if no online agents
    }

    const response = await fetch('/api/honeytokens/monitor_status_text', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agents_ids }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch monitoring statuses');
      return {};
    }

    const data: Record<string, boolean> = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching monitoring statuses:', err);
    return {};
  }
}

export async function getHoneytokensMonitorStatusesAPI(): Promise<Record<string, boolean>> {
  try {
    const agents_data: IAgentStatus[] = await areAgentsConnected();

    const agents_ids: string[] = agents_data
      .filter(({ status }) => status === 'online')
      .map(({ agent_id }) => agent_id);

    if (agents_ids.length === 0) {
      return {}; // Early exit if no online agents
    }

    const response = await fetch('/api/honeytokens/monitor_status_api', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agents_ids }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch monitoring statuses');
      return {};
    }

    const data: Record<string, boolean> = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching monitoring statuses:', err);
    return {};
  }
}

export async function deleteHoneytokensByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/group/${group_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error deleting honeytokens group:', err);
  }
}

export async function startMonitorByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/api/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group_id }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error starting monitor on group:', err);
  }
}

export async function stopMonitorByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/stop/group`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group_id }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error stopping monitor on group:', err);
  }
}
