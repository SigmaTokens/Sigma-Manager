import { get_all_user_agents } from '../database/agents';
import { get_all_user_honeytokens } from '../database/honeytokens';
import { Globals } from '../globals';
import { IAgent } from '../interfaces/agent';
import { IHoneytoken } from '../interfaces/honeytoken';

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
    try {
      const response: any = await socket.timeout(2000).emitWithAck('STATUS_AGENT');
      if (response.status === 'monitoring') {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function checkHoneytokenMonitored(
  honeytoken: IHoneytoken,
  text_honeytokens_statuses: Record<string, boolean>,
  api_honeytokens_statuses: Record<string, boolean>,
): boolean {
  if (honeytoken.type_id === 'api') {
    return api_honeytokens_statuses[honeytoken.group_id] || false;
  } else {
    return text_honeytokens_statuses[honeytoken.token_id] || false;
  }
}

function extractAgents(honeytokens: IHoneytoken[]): string[] {
  const agents: string[] = [];
  honeytokens.forEach((honeytoken) => {
    if (!agents.includes(honeytoken.agent_id)) agents.push(honeytoken.agent_id);
  });
  return agents;
}

async function getHoneytokenStatuses(
  agents: string[],
  text_tokens: Record<string, boolean>,
  api_tokens: Record<string, boolean>,
) {
  for (const agent of agents) {
    try {
      const socket = Globals.agentSockets.get(agent);
      if (!socket) continue;
      const response_api = await socket.timeout(2000).emitWithAck('STATUSES_HONEYTOKENS_API');
      const response_text = await socket.timeout(2000).emitWithAck('STATUSES_HONEYTOKENS_TEXT');
      const statuses_api: Record<string, boolean> = response_api.message || {};
      const statuses_text: Record<string, boolean> = response_text.message || {};
      Object.assign(api_tokens, statuses_api);
      Object.assign(text_tokens, statuses_text);
    } catch {
      continue;
    }
  }
}

export async function getHoneytokens(user_id: string): Promise<IHoneytoken[]> {
  const honeytokens: IHoneytoken[] = await get_all_user_honeytokens(user_id);
  const agents: string[] = extractAgents(honeytokens);
  const api_honeytokens_statuses: Record<string, boolean> = {};
  const text_honeytokens_statuses: Record<string, boolean> = {};
  await getHoneytokenStatuses(agents, text_honeytokens_statuses, api_honeytokens_statuses);

  const honeytokenWithStatuses: IHoneytoken[] = await Promise.all(
    honeytokens.map(async (honeytoken: IHoneytoken) => ({
      ...honeytoken,
      isMonitored: checkHoneytokenMonitored(honeytoken, text_honeytokens_statuses, api_honeytokens_statuses),
    })),
  );
  return honeytokenWithStatuses;
}

export async function getAgents(user_id: string): Promise<IAgent[]> {
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
