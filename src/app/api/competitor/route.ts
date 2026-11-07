import { NextRequest, NextResponse } from 'next/server';
import { runWebsiteAudit } from '@/lib/audit-engine';
import { db } from '@/lib/storage';
import { CompetitorComparison } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';
    const comparisons = db.getComparisons(userId);
    return NextResponse.json({ success: true, comparisons });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch comparisons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const body = await req.json();
    const { primaryUrl, competitorUrls = [] } = body;

    if (!primaryUrl) {
      return NextResponse.json({ error: 'Primary business website is required.' }, { status: 400 });
    }

    const allUrls = [primaryUrl, ...competitorUrls.filter((u: string) => u && u.trim().length > 3)];
    if (allUrls.length < 2) {
      return NextResponse.json({ error: 'At least one competitor URL is required for comparison.' }, { status: 400 });
    }

    // Run audits in parallel
    const auditPromises = allUrls.map(url => runWebsiteAudit(url));
    const reports = await Promise.all(auditPromises);

    // Determine highest scoring
    let highest = reports[0];
    reports.forEach(r => {
      if (r.overallScore > highest.overallScore) highest = r;
    });

    const strengths: Record<string, string[]> = {};
    const weaknesses: Record<string, string[]> = {};

    reports.forEach(r => {
      strengths[r.url] = r.issues.filter(i => i.severity === 'good').map(i => i.title);
      weaknesses[r.url] = r.issues.filter(i => i.severity === 'critical' || i.severity === 'warning').map(i => i.title);
    });

    const comparison: CompetitorComparison = {
      id: `comp_${Date.now()}`,
      userId,
      title: `Competitor Benchmark: ${new URL(reports[0].url).hostname} vs ${reports.slice(1).map(r => new URL(r.url).hostname).join(', ')}`,
      primaryUrl,
      competitorUrls,
      reports,
      winnerUrl: highest.url,
      aiAnalysis: {
        executiveSummary: `${new URL(highest.url).hostname} is currently leading the benchmark with an overall score of ${highest.overallScore}/100. However, significant vulnerabilities were identified across mobile responsiveness and conversion funnels that create high-value opportunities to dominate the niche.`,
        strengths,
        weaknesses,
        tacticalRecommendations: [
          'Accelerate initial server response times below 800ms with Edge CDN caching to outpace competitor Core Web Vitals.',
          'Implement persistent floating sticky appointment booking CTA widgets to capture mobile visitors.',
          'Enhance product catalog schema markup (schema.org/Product) to win Google rich snippets over competitors.',
          'Adopt dynamic social proof popups to drive conversion urgency in competitive local markets.',
        ],
        actionPlan: [
          'Phase 1: Fix Core Web Vitals and script bottlenecks identified in the primary store audit.',
          'Phase 2: Rework all button CTA microcopy to active conversion drivers.',
          'Phase 3: Launch high-converting mobile landing funnels outperforming the benchmark.',
        ],
      },
      createdAt: new Date().toISOString(),
    };

    db.saveComparison(comparison, userId);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Competitor benchmark failed' }, { status: 500 });
  }
}
