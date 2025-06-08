export interface Alert {
  alert_id: string;
  token_id: string;
  alert_epoch: string;
  accessed_by: string;
  log: string;
  archive: boolean;
  location: string;
  file_name: string;
  agent_id: string;
  agent_name: string;
  grade: number;
}
