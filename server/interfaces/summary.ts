export interface IDashboardSummary {
  total_agents: number;
  online_agents: number;
  offline_agents: number;
  total_honeytokens: number;
  alerts: IAlertSummary;
}

export interface IAlertSummary {
  total: number;
  resolved: number;
}
