import { useEffect, useState } from 'react'
import '../styles/Agents.css'
import { Agent } from '../interfaces/agent'

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agents')
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data: Agent[] = await response.json()
      setAgents(data)
    } catch (err) {
      console.error('Error fetching honeytokens:', err)
      setError('Failed to fetch honeytokens. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAgents()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading agents...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    )
  }

  return (
    <div className="agents-container">
      <h2 className="agents-title">Agent List</h2>

      <div className="table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>IP</th>
              <th>Port</th>
              <th>ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id}>
                <td>{agent.name}</td>
                <td>{agent.ip}</td>
                <td>{agent.port}</td>
                <td>{agent.agent_id}</td>
                <td
                  className={`${
                    agent.status === 'online'
                      ? 'agents-status-online'
                      : agent.status === 'offline'
                        ? 'agents-status-offline'
                        : 'agents-status-unknown'
                  }`}
                >
                  {agent.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AgentsPage
