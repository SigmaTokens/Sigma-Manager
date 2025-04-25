export interface IAgent {
  agent_id: string;
  agent_name: string;
  agent_ip: string;
  agent_port: number | string;
  isRunning: boolean;
}

export interface IAgentStatus {
  agent_id: string;
  status: 'online' | 'offline' | 'unknown';
}

export interface IHoneytokenType {
  id: string;
  name: string;
}

export interface CreateHoneytokenFormProps {
  types: IHoneytokenType[];
  agents: IAgent[];
  onClose: () => void;
}
