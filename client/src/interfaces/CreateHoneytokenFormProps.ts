import { HoneytokenType } from './HoneytokenType';

export interface CreateHoneytokenFormProps {
    types: HoneytokenType[];
    onClose: () => void;
}