import { I_Agent } from '../interfaces/agent'

export class Agent implements I_Agent {
  agent_id: string
  ip: string
  name: string
  port: number

  constructor(agent_id: string, ip: string, name: string, port: number) {
    this.agent_id = agent_id
    this.ip = ip
    this.name = name
    this.port = port
  }

  getAgentID(): string {
    return this.agent_id
  }
  getIP(): string {
    return this.ip
  }
  getName(): string {
    return this.name
  }
  setName(name: string): void {
    this.name = name
  }

  getPort(): number {
    return this.port
  }
}
