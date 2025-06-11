import { get_all_user_agents } from '../database/agents';
import { Globals } from '../globals';
import { IAgent } from '../interfaces/agent';

async function checkAgentStatus(id: string): Promise<string> {
  try {
    const socket = Globals.agentSockets.get(id);
    if (socket && socket.connected) return 'online';
    return 'offline';
  } catch (error) {
    return 'offline';
  }
}

async function checkAgentMonitoring(agent_id: string): Promise<boolean> {
  const socket = Globals.agentSockets.get(agent_id);
  if (socket) {
    const response = await socket.emitWithAck('STATUS_AGENT');
    if (response.status === 'monitoring') {
      return true;
    }
    return false;
  }
  return false;
}

export async function getAgents(user_id: string) {
  const agents: IAgent[] = await get_all_user_agents(user_id);
  const statusUpdates: IAgent[] = await Promise.all(
    agents.map(async (agent: IAgent) => ({
      ...agent,
      status: await checkAgentStatus(agent.agent_id),
      isMonitoring: await checkAgentMonitoring(agent.agent_id),
    })),
  );
  return statusUpdates;
}
