export async function getAgents() {
  try {
    const response = await fetch('http://localhost:3000/api/agents', {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      alert('Failed to fetch agents.');
    } else {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error('Request failed:', err);
    alert('Something went wrong while fetching agents.');
  }
}

export async function addAgent(
  agentIP: string,
  agentName: string,
  agentPort: number | undefined,
) {
  try {
    const response = await fetch('http://localhost:3000/api/agents/text', {
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
      alert('Failed to add agent.');
    } else {
      console.log('Agent added successfully!');
    }
  } catch (err) {
    console.error('Request failed:', err);
    alert('Something went wrong while adding the agent.');
  }
}

export async function startAgent(agent_id: string) {
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

export async function stopAgent(agent_id: string) {
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
