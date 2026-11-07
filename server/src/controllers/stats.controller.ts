import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

export async function getStatsOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const whereLead: any = {};
    const whereAudit: any = {};
    const whereSites: any = {};
    const whereLogs: any = {};

    if (req.user) {
      whereLead.userId = req.user.id;
      whereAudit.userId = req.user.id;
      whereSites.userId = req.user.id;
      whereLogs.userId = req.user.id;
    }

    const [
      totalLeads,
      highOpportunityLeads,
      contactedLeads,
      closedWonLeads,
      totalAudits,
      totalWebsites,
      recentLogs,
    ] = await Promise.all([
      prisma.lead.count({ where: whereLead }),
      prisma.lead.count({ where: { ...whereLead, opportunityTier: 'High' } }),
      prisma.lead.count({
        where: { ...whereLead, status: { in: ['Contacted', 'In Conversation'] } },
      }),
      prisma.lead.count({ where: { ...whereLead, status: 'Closed Won' } }),
      prisma.audit.count({ where: whereAudit }),
      prisma.websiteProject.count({ where: whereSites }),
      prisma.activityLog.findMany({
        where: whereLogs,
        take: 10,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const estimatedPipelineValue = totalLeads * 1250; // $1,250 avg agency website value
    const closedRevenue = closedWonLeads * 2500;
    const conversionRate = totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        totalLeads,
        highOpportunityLeads,
        contactedLeads,
        closedWonLeads,
        totalAudits,
        totalWebsites,
        estimatedPipelineValue,
        closedRevenue,
        conversionRate,
        searchesUsed: req.user?.plan ? (req.user as any).searchesUsed || 0 : 0,
        searchesLimit: req.user?.plan ? (req.user as any).searchesLimit || 100 : 100,
        recentActivity: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
}

