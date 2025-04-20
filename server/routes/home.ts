import { Express, Router } from 'express'
import { Agent } from '../interfaces/agent'
import { Alert } from '../interfaces/alert'
import { Honeytoken } from '../interfaces/honeytoken'
import { Database } from 'sqlite'
import sqlite3 from 'sqlite3'

export function serveHome(app: Express, database: any) {
  const router = Router()

  router.get('/home', async (req, res) => {
    try {
      const db = database

      const agents = await database.all('SELECT * FROM agents')
      const alerts = await database.all('SELECT * FROM alerts')
      const honeytokens = await database.all('SELECT * FROM honeytokens')

      const now = new Date()
      const sevenDays = 7 * 24 * 60 * 60 * 1000

      const tokenStatus = {
        active: 0,
        expired: 0,
        expiring_soon: 0,
      }

      for (const token of honeytokens) {
        const expire = new Date(token.expire_date)
        if (expire < now) {
          tokenStatus.expired++
        } else if (expire.getTime() - now.getTime() < sevenDays) {
          tokenStatus.expiring_soon++
        } else {
          tokenStatus.active++
        }
      }

      const onlineAgents = agents.filter(
        (a: Agent) => a.status === 'online',
      ).length
      const offlineAgents = agents.length - onlineAgents

      const resolvedAlerts = alerts.filter(
        (a: Alert) => a.status === 'resolved',
      ).length

      const threatMap: Record<string, number> = {}
      for (const alert of alerts) {
        threatMap[alert.token_id] = (threatMap[alert.token_id] || 0) + 1
      }

      const topThreats = Object.entries(threatMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([token_id, count]) => ({ token_id, alert_count: count }))

      // Count honeytoken types
      const typeMap: Record<string, number> = {}
      for (const token of honeytokens) {
        const type = token.type_id || 'unknown'
        typeMap[type] = (typeMap[type] || 0) + 1
      }

      res.json({
        total_agents: agents.length,
        online_agents: onlineAgents,
        offline_agents: offlineAgents,
        total_honeytokens: honeytokens.length,
        alerts: {
          total: alerts.length,
          resolved: resolvedAlerts,
        },
        token_status: tokenStatus,
        top_threats: topThreats,
        honeytoken_types: typeMap,
      })
    } catch (error: any) {
      console.error('[-] Failed to fetch dashboard summary:', error.message)
      res.status(500).json({ failure: error.message })
    }
  })

  app.use('/api', router)
}
