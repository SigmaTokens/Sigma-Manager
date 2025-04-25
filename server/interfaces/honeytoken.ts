export interface IHoneytoken {
  token_id: string;
  agent_id: string;
  group_id: string;
  type_id: string;
  creation_date: string | Date;
  expire_date: string | Date;
  location: string;
  file_name: string;
  data: string;
  notes?: string;
}
