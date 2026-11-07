import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { isOpenAiConfigured, regenerateOutreachMessageWithOpenAi } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, report: providedReport, channel = 'Email', angle = 'glitch_alert', customInstructions } = body;

    let targetReport = providedReport;
    if (!targetReport && reportId) {
      targetReport = db.getAuditById(reportId);
    }

    if (!targetReport) {
      return NextResponse.json({ error: 'Audit report is required for outreach generation.' }, { status: 400 });
    }

    if (isOpenAiConfigured()) {
      try {
        const freshOutreach = await regenerateOutreachMessageWithOpenAi({
          report: targetReport,
          channel,
          angle,
          customInstructions,
        });

        return NextResponse.json({
          success: true,
          outreach: freshOutreach,
          source: 'openai_gpt4o_mini',
        });
      } catch (err) {
        console.warn('OpenAI outreach regeneration failed, using local variant:', err);
      }
    }

    // Local non-repeating fallbacks
    const domain = new URL(targetReport.url).hostname.replace('www.', '');
    const biz = targetReport.businessName;
    const topIssue = targetReport.detailedIssues?.[0]?.title || 'catalog direct actions';
    const scriptCount = targetReport.metrics?.scriptCount || 15;
    const loadTime = targetReport.metrics?.loadTimeMs || 850;

    const normalizedAngle =
      angle === 'glitch_alert'
        ? 'performance_vitals'
        : angle === 'conversion_teardown'
        ? 'conversion_ux'
        : angle === 'compliment_fix'
        ? 'technical_seo'
        : angle === 'quick_observation'
        ? 'executive_summary'
        : angle;

    const subjectsByAngle: Record<string, string[]> = {
      executive_summary: [
        `Website Audit Summary: ${domain} (Conversion & UX Analysis)`,
        `Executive Website Audit Summary: ${biz}`,
        `Technical & UX Audit Findings for ${domain}`,
      ],
      performance_vitals: [
        `Technical Performance & Speed Audit: ${domain} (~${loadTime}ms benchmark)`,
        `Core Web Vitals & Latency Review for ${domain}`,
        `Performance Diagnostic: ${domain}`,
      ],
      conversion_ux: [
        `Conversion & UX Pathway Audit: ${domain}`,
        `Inquiry Flow & Action Trigger Analysis: ${domain}`,
        `Conversion Architecture Opportunities for ${biz}`,
      ],
      technical_seo: [
        `Technical Architecture & SEO Audit: ${domain}`,
        `On-Page Structure & Search Diagnostic: ${domain}`,
        `Technical Indexing & Headline Audit for ${biz}`,
      ],
    };

    const subjectChoices = subjectsByAngle[normalizedAngle] || subjectsByAngle.executive_summary;
    const randomSubject = subjectChoices[Math.floor(Math.random() * subjectChoices.length)];

    const topProblem = targetReport.detailedIssues?.[0]?.problem || 'primary action triggers lack direct conversion pathways';
    const cleanProblem = topProblem.length > 200 ? topProblem.substring(0, 197) + '...' : topProblem;

    let bodyText = '';
    if (normalizedAngle === 'performance_vitals') {
      bodyText = `Hi ${biz} Team,\n\nDuring a recent Google Core Web Vitals diagnostic of ${domain}, we benchmarked your mobile delivery and asset load times:\n\n• Mobile Latency: Server response and initial render clocked at ~${loadTime}ms.\n• Asset Optimization: ${scriptCount > 0 ? `${scriptCount} third-party scripts are being loaded during initial render, which can introduce mobile friction.` : 'Asset delivery and styling can be streamlined to accelerate First Contentful Paint.'}\n• Mobile Experience: Mobile viewport is configured; asset deferral is recommended to prevent bounce.\n\nStreamlining these assets typically retains 15–25% more mobile visitors. Would you like me to send over our technical performance breakdown?`;
    } else if (normalizedAngle === 'conversion_ux') {
      bodyText = `Hi ${biz} Team,\n\nI analyzed the user experience and conversion funnel on ${domain}. We spotted notable opportunities to capture more high-intent visitors:\n\n• Call-to-Action Architecture: ${cleanProblem}\n• Inquiry Pathways: Transitioning passive buttons into direct modal triggers noticeably lowers visitor drop-off.\n\nWe have compiled a 3-step UX optimization outline for ${biz}. Open to reviewing the summary draft?`;
    } else if (normalizedAngle === 'technical_seo') {
      bodyText = `Hi ${biz} Team,\n\nOur team completed a technical architecture and on-page indexing audit of ${domain}:\n\n• Heading Structure: Content hierarchy presents immediate opportunities for primary keyword anchoring.\n• Asset Delivery: Technical audit flagged image and asset optimizations to bolster search indexing.\n• Security: Valid HTTPS protocol verified.\n\nWould you like our complete technical checklist for your development roadmap?`;
    } else {
      // executive_summary
      bodyText = `Hi ${biz} Team,\n\nI recently conducted a technical and conversion audit of ${domain}. Overall, your digital presence has strong core elements, but we identified key friction points that may be suppressing inquiries:\n\n• Action Architecture: ${cleanProblem}\n• Mobile Latency: Page response measured at ~${loadTime}ms${scriptCount > 0 ? ` with ${scriptCount} script resources evaluated` : ''}.\n• Navigation & Hierarchy: Structural headlines and conversion touchpoints can be optimized to lift retention.\n\nWe prepared a full Website Audit Summary and priority roadmap. Would you be open to a brief 10-minute briefing next week to review the findings?`;
    }

    return NextResponse.json({
      success: true,
      outreach: {
        subject: channel === 'Email' || channel === 'LinkedIn' ? randomSubject : undefined,
        body: bodyText,
      },
      source: 'local_adaptive',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Outreach generation failed' }, { status: 500 });
  }
}

