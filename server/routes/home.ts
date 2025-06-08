import { Express, Router } from 'express';
import { Globals } from '../globals';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';

export function serveHome() {
  const router = Router();

  router.use(auth());

  //❌
  router.get('/home', async (req, res) => {
    const user_id: string = (req as any).user.id;
    try {
      const agents = await Globals.app.locals.db.all('SELECT * FROM agents');
      const alerts = await Globals.app.locals.db.all('SELECT * FROM alerts');
      const honeytokens = await Globals.app.locals.db.all('SELECT * FROM honeytokens');
      const grades = await Globals.app.locals.db.all(
        `SELECT honeytokens.grade FROM alerts LEFT JOIN honeytokens ON alerts.token_id = honeytokens.token_id`,
      );
      const now = new Date();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      const tokenStatus = {
        active: 0,
        expired: 0,
        expiring_soon: 0,
      };

      for (const token of honeytokens) {
        const expire = new Date(token.expire_date);
        if (expire < now) {
          tokenStatus.expired++;
        } else if (expire.getTime() - now.getTime() < sevenDays) {
          tokenStatus.expiring_soon++;
        } else {
          tokenStatus.active++;
        }
      }

      // TODO: get the statuses ... the status now is initial - it doesn't work
      const onlineAgents = agents.filter((a: any) => a.status === 'online').length;
      const offlineAgents = agents.length - onlineAgents;

      const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved').length;

      const threatMap: Record<string, number> = {};
      for (const alert of alerts) {
        threatMap[alert.token_id] = (threatMap[alert.token_id] || 0) + 1;
      }

      const topThreats = Object.entries(threatMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([token_id, count]) => ({ token_id, alert_count: count }));

      const severityMap: Record<string, number> = {};
      for (let i = 1; i <= 10; i++) {
        severityMap[i.toString()] = 0;
      }

      for (const alert of alerts) {
        const grade = alert.grade?.toString();
        if (grade && severityMap.hasOwnProperty(grade)) {
          severityMap[grade]++;
        }
      }

      // Count honeytoken types
      const typeMap: Record<string, number> = {};
      for (const token of honeytokens) {
        const type = token.type_id || 'unknown';
        typeMap[type] = (typeMap[type] || 0) + 1;
      }

      return void res.status(200).json({
        total_agents: agents.length,
        online_agents: onlineAgents,
        offline_agents: offlineAgents,
        total_honeytokens: honeytokens.length,
        alerts: {
          total: alerts.length,
          resolved: resolvedAlerts,
        },
        token_status: tokenStatus,
        alert_severity: severityMap,
        alert_grades: grades.map((g: { grade: number }) => g.grade),
        top_threats: topThreats,
        honeytoken_types: typeMap,
      });
    } catch (error: any) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to fetch dashboard summary:',
        error.message,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ failure: error.message });
    }
  });

  Globals.app.use('/api', router);
}
