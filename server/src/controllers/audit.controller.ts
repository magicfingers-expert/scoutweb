import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { runWebsiteAudit } from '../../../src/lib/audit-engine';
import { prisma } from '../config/prisma';

export async function runAuditHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { url, businessName, businessType } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Target website URL is required.',
      });
    }

    // Run deep website audit
    const report = await runWebsiteAudit(url, businessType, businessName);

    // Persist audit record in Prisma database
    const savedAudit = await prisma.audit.create({
      data: {
        userId: req.user?.id || null,
        url: report.url,
        businessName: report.businessName,
        businessType: businessType || report.cms || report.businessType || null,
        overallScore: report.overallScore,
        summary: report.summaryParagraph1 || report.criticalFindingsSummary || 'Audit summary',
        scores: JSON.stringify({
          overall: report.overallScore,
          seo: report.seoScore,
          performance: report.performanceScore,
          ux: report.uxScore,
          conversion: report.conversionScore,
          accessibility: report.accessibilityScore,
        }),
        metrics: JSON.stringify(report.metrics),
        issues: JSON.stringify(report.issues),
        actionPlan: JSON.stringify(report.actionPlan || []),
        outreachMessages: JSON.stringify(report.outreachMessages || {}),
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'AUDIT_RUN',
          details: `Audited ${report.url} (${report.businessName}) - Score: ${report.overallScore}/100`,
        },
      }).catch(() => null);
    }

    return res.status(201).json({
      success: true,
      auditId: savedAudit.id,
      report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const [total, audits] = await Promise.all([
      prisma.audit.count({ where }),
      prisma.audit.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Parse JSON fields for clean consumption
    const parsed = audits.map((a) => ({
      ...a,
      scores: JSON.parse(a.scores || '{}'),
      metrics: JSON.parse(a.metrics || '{}'),
      issues: JSON.parse(a.issues || '[]'),
      actionPlan: JSON.parse(a.actionPlan || '[]'),
      outreachMessages: JSON.parse(a.outreachMessages || '{}'),
    }));

    return res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditByIdHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return res.status(404).json({
        success: false,
        error: 'Audit record not found.',
      });
    }

    const parsed = {
      ...audit,
      scores: JSON.parse(audit.scores || '{}'),
      metrics: JSON.parse(audit.metrics || '{}'),
      issues: JSON.parse(audit.issues || '[]'),
      actionPlan: JSON.parse(audit.actionPlan || '[]'),
      outreachMessages: JSON.parse(audit.outreachMessages || '{}'),
    };

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
}
