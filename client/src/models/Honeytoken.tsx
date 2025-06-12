import { access_denied } from '../utilities/constants';
import { logoutFromSession } from '../utilities/helpers';
import { IAgent } from '../../../server/interfaces/agent';
import { HoneytokenType } from '../utilities/typing';

export async function createHoneytokenText(
  fileName: string,
  ComponentAddresses: string,
  grade: number,
  expirationDate: string,
  notes: string,
  fileContent: string,
  agentID: string,
) {
  try {
    const response = await fetch('/api/honeytokens/text', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
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

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`Error creating honeytoken text: ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(`Error creating honeytoken text: ${error}`);
  }
}

export async function createHoneytokenApi(
  grade: number,
  expirationDate: string,
  notes: string,
  agentID: string,
  apiPort: number,
  apis: any[],
) {
  try {
    const response = await fetch('/api/honeytokens/api', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
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
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`Error creating honeytoken api: ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(`Error creating honeytoken api: ${error}`);
  }
}

export async function getHoneytokens() {
  try {
    const response = await fetch('/api/honeytokens', {
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      throw new Error(`Error fetching honeytoken: ${response.status}`);
    }

    return payload;
  } catch (error) {
    throw new Error(`Error fetching honeytokens: ${error}`);
  }
}

export async function deleteHoneytoken(token_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/token/${token_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error deleting honeytoken: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting honeytoken:', error);
    return false;
  }
}

export async function startMonitorOnHoneytoken(token_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token_id: token_id,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error monitoring honeytoken: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error monitoring honeytoken:', error);
    return false;
  }
}

export async function stopMonitorOnHoneytoken(token_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/stop`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token_id: token_id,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error disabling honeytoken: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error disabling honeytoken:', error);
    return false;
  }
}

export async function getHoneytokensMonitorStatusesText(agents: IAgent[]): Promise<Record<string, boolean>> {
  try {
    const agents_ids: string[] = agents.filter(({ status }) => status === 'online').map(({ agent_id }) => agent_id);

    if (agents_ids.length === 0) return {};

    const response = await fetch('/api/honeytokens/monitor_status_text', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agents_ids }),
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error fetching monitoring statuses: ${response.status}`);
      return {};
    }

    const data: Record<string, boolean> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching monitoring statuses:', error);
    return {};
  }
}

export async function getHoneytokensMonitorStatusesAPI(agents: IAgent[]): Promise<Record<string, boolean>> {
  try {
    const agents_ids: string[] = agents
      .filter((agent: IAgent) => agent.status === 'online')
      .map(({ agent_id }) => agent_id);

    if (agents_ids.length === 0) return {};

    const response = await fetch('/api/honeytokens/monitor_status_api', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agents_ids }),
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error fetching monitoring statuses: ${response.status}`);
      return {};
    }

    const data: Record<string, boolean> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching monitoring statuses:', error);
    return {};
  }
}

export async function deleteHoneytokensByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/group/${group_id}`, {
      method: 'DELETE',
      headers: localStorage.getItem('biscuit') ? { Authorization: `Bearer ${localStorage.getItem('biscuit')}` } : {},
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error deleting honeytokens group: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting honeytokens group:', error);
    return false;
  }
}

export async function startMonitorByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/api/start`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group_id }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error starting monitor on group: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error starting monitor on group:', error);
    return false;
  }
}

export async function stopMonitorByGroupId(group_id: string) {
  try {
    const response = await fetch(`/api/honeytokens/stop/group`, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('biscuit') ? `Bearer ${localStorage.getItem('biscuit')}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group_id }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (payload.action === access_denied) logoutFromSession();
      console.error(`Error stopping monitor on group: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error stopping monitor on group:', error);
    return false;
  }
}
