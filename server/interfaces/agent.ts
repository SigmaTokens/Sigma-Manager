export interface IAgent {
  agent_id: string;
  agent_name: string;
  status: string;
  user_id: string;
  username: string;
  validated: number;
  isMonitoring: boolean;
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
  onClose: () => void;
}
