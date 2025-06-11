import { IAgent } from '../../../server/interfaces/agent';
import { Alert } from '../../../server/interfaces/alert';
import { IHoneytoken } from '../../../server/interfaces/honeytoken';

export interface AddAgentPopupProps {
  onClose: () => void;
}

export interface AgentDetailsPopupProps {
  agent: IAgent;
  status: string;
  onClose: () => void;
}

export interface AlertDetailsPopupProps {
  alert: Alert;
  onClose: () => void;
}

export interface ApiTokenDetailsPopupProps {
  token: IHoneytoken;
  onClose: () => void;
}

export interface TextTokenDetailsPopupProps {
  token: IHoneytoken;
  onClose: () => void;
}

export interface VolumeBarProps {
  grade: number;
}

export interface User {
  id: string;
  username: string;
}

export interface UserContextValue {
  currentUser: User | null;
  login: (u: string, p: string) => Promise<void>;
  signup: (u: string, p: string) => Promise<void>;
  logout: () => void;
}
