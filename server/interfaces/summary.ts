export interface IDashboardSummary {
  total_agents: number;
  online_agents: number;
  offline_agents: number;
  total_honeytokens: number;
  alerts: IAlertSummary;
  alert_grades: number[];
  token_status: {
    active: number;
    expired: number;
    expiring_soon: number;
  };
  top_threats: {
    token_id: string;
    alert_count: number;
  }[];
  honeytoken_types: Record<string, number>;
}

export interface IAlertSummary {
  total: number;
  resolved: number;
}
