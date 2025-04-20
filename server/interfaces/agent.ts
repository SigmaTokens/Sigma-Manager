export interface I_Agent {
  getAgentID(): string
  getIP(): string
  getName(): string
  getPort(): number
}

export interface Agent {
  id: string
  ip: string
  port: number
  group_id: string
  notes?: string
  status?: 'online' | 'offline'
}
