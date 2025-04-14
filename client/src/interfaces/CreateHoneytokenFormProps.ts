import { HoneytokenType } from './HoneytokenType';
import { agentType } from './agentType';

export interface CreateHoneytokenFormProps {
    types: HoneytokenType[];
    agents: agentType[];
    onClose: () => void;
}