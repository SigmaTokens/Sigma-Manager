import { IAgent, IAgentStatus } from '../../../server/interfaces/agent';

export async function getAgents() {
  try {
    const response = await fetch('http://localhost:3000/api/agents', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

export async function addAgent(
  agentIP: string,
  agentName: string,
  agentPort: number | undefined,
) {
  try {
    const response = await fetch('http://localhost:3000/api/agents/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: agentIP,
        name: agentName,
        port: agentPort,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
    } else {
      console.log('Agent added successfully!');
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

export async function startAgent(agent_id: string) {
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

export async function stopAgent(agent_id: string) {
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

export async function areAgentsConnected() {
  const response = await fetch(
    'http://localhost:3000/api/agents/active_status',
  );
  return await response.json();
}

export async function isAgentMonitoring(agent_id: string): Promise<boolean> {
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
    if (response.ok && response.status === 200) {
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

export async function deleteAgent(agent_id: string) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/agents/agent/${agent_id}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error deleting agent:', err);
  }
}

export async function verifyAgent(
  agent_id: string,
  setAgents: any,
  setStatusUpdates: any,
) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/agents/verify/${agent_id}`,
      {
        method: 'GET',
      },
    );
    fetchAgents(setAgents, setStatusUpdates);
  } catch (err) {
    console.error('Error verifying agent: ', err);
  }
}

export async function refreshStatuses(setStatusUpdates: any) {
  try {
    const data: IAgentStatus[] = await areAgentsConnected();
    const newStatuses: Record<string, string> = {};
    data.forEach(({ agent_id, status }) => {
      newStatuses[agent_id] = status;
    });

    setStatusUpdates(newStatuses);
  } catch (error) {
    console.error('Failed to refresh statuses:', error);
  }
}

export async function fetchAgents(setAgents: any, setStatusUpdates: any) {
  try {
    const agentData = await getAgents();

    const agentDataWithRunningStatus = await Promise.all(
      agentData.map(async (agent: IAgent) => {
        try {
          const isMonitoring = await isAgentMonitoring(agent.agent_id);

          return { ...agent, isMonitoring: isMonitoring };
        } catch (err) {
          console.error(
            `Failed to check monitoring for agent ${agent.agent_id}:`,
            err,
          );
          return { ...agent, isMonitoring: false };
        }
      }),
    );

    setAgents(agentDataWithRunningStatus);
    await refreshStatuses(setStatusUpdates);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
  }
}
