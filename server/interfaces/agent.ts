export interface IAgent {
  agent_id: string;
  agent_name: string;
  agent_ip: string;
  agent_port: number | string;
}

export interface IAgentStatus {
  agent_id: string;
  status: 'online' | 'offline' | 'unknown';
}
