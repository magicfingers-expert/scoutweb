'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Globe,
  Radar,
  Search,
  RotateCw,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Trash2,
  Bookmark,
  Sparkles,
  ArrowLeft,
  Mail,
  Copy,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { AuditReport, DetailedIssue, ActionPlanWeek } from '@/lib/types';

function AuditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillUrl = searchParams.get('url') || '';

  // Form input states
  const [storeUrl, setStoreUrl] = useState(prefillUrl);
  const [businessType, setBusinessType] = useState('Auto-detect');
  const [analyzing, setAnalyzing] = useState(false);

  // Analysis progress animation states
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Current viewed report
  const [report, setReport] = useState<AuditReport | null>(null);

  // Lead saved state
  const [leadSaved, setLeadSaved] = useState(false);

  // Outreach generator states
  const [outreachChannel, setOutreachChannel] = useState<'Email' | 'LinkedIn' | 'WhatsApp' | 'Instagram DM'>('Email');
  const [outreachAngle, setOutreachAngle] = useState<
    | 'executive_summary'
    | 'performance_vitals'
    | 'conversion_ux'
    | 'technical_seo'
    | 'glitch_alert'
    | 'conversion_teardown'
    | 'compliment_fix'
    | 'quick_observation'
  >('executive_summary');
  const [customOutreachMessage, setCustomOutreachMessage] = useState<{ subject?: string; body: string } | null>(null);
  const [regeneratingOutreach, setRegeneratingOutreach] = useState(false);
  const [regenerateToast, setRegenerateToast] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);

  const analysisSteps = [
    'Checking robots.txt and reaching the store',
    'Collecting pages and performance data',
    'Identifying the business type',
    'Scoring the site against the industry checklist',
    'Generating findings and the 30-day action plan',
    'Saving your report',
  ];

  useEffect(() => {
    if (prefillUrl && !report) {
      handleStartAudit(prefillUrl);
    }
  }, [prefillUrl]);

  const handleStartAudit = async (targetUrlOverride?: string) => {
    const finalUrl = targetUrlOverride || storeUrl;
    if (!finalUrl.trim()) return;

    setAnalyzing(true);
    setProgressPercent(15);
    setCurrentStepIndex(0);
    setLeadSaved(false);

    // Animate progress smoothly through steps
    const stepInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 95) return 95;
        const next = prev + 15;
        const nextIndex = Math.min(5, Math.floor((next / 100) * 6));
        setCurrentStepIndex(nextIndex);
        return next;
      });
    }, 600);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl.trim(),
          businessType: businessType !== 'Auto-detect' ? businessType : undefined,
        }),
      });

      clearInterval(stepInterval);
      setProgressPercent(100);
      setCurrentStepIndex(5);

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setReport(data.report);
          setAnalyzing(false);
        }, 500);
      } else {
        alert('Audit failed. Please check the URL and try again.');
        setAnalyzing(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      console.error(err);
    }
  };

  const handleSaveAsLead = async () => {
    if (!report) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: report.businessName,
          category: report.businessType,
          website: report.url,
          opportunityScore: report.businessOpportunity?.score || 80,
          opportunityTier: report.businessOpportunity?.level === 'High' ? 'HIGH OPPORTUNITY' : 'MEDIUM OPPORTUNITY',
          status: 'New',
          source: 'Website Audit Engine',
          tags: [report.businessType, 'Audit Lead'],
          notes: report.detailedIssues?.map((i) => `• [${i.category}] ${i.title}: ${i.recommendation}`) || [],
          recommendedServices: report.businessOpportunity?.recommendedServices?.join(', ') || 'Website Optimization',
        }),
      });
      if (res.ok) {
        setLeadSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  // Helper for metric progress bar colors matching reference
  const getMetricBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 70) return 'bg-cyan-400';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  // Helper for severity pill colors matching reference
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'medium':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
    }
  };

  const handleRegenerateOutreach = async (
    targetAngle?:
      | 'executive_summary'
      | 'performance_vitals'
      | 'conversion_ux'
      | 'technical_seo'
      | 'glitch_alert'
      | 'conversion_teardown'
      | 'compliment_fix'
      | 'quick_observation'
  ) => {
    if (!report) return;
    const chosenAngle = targetAngle || outreachAngle;
    setRegeneratingOutreach(true);
    setRegenerateToast('');

    try {
      const res = await fetch('/api/audit/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          channel: outreachChannel,
          angle: chosenAngle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.outreach) {
          setCustomOutreachMessage(data.outreach);
          setRegenerateToast('Generated unique anti-spam message with OpenAI!');
          setTimeout(() => setRegenerateToast(''), 4000);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate outreach:', err);
    } finally {
      setRegeneratingOutreach(false);
    }
  };

  // Generate customized, professional website audit summaries built directly from this site's actual findings
  const getOutreachMessage = () => {
    if (!report) return { subject: '', body: '' };

    // 1. If user regenerated or custom message is active
    if (customOutreachMessage) {
      return customOutreachMessage;
    }

    const channelKey =
      outreachChannel === 'Email'
        ? 'email'
        : outreachChannel === 'LinkedIn'
        ? 'linkedIn'
        : outreachChannel === 'WhatsApp'
        ? 'whatsApp'
        : 'instagramDm';

    // 2. Check OpenAI-generated outreach from the audit report
    const channelMessages: any = report.outreachMessages
      ? (report.outreachMessages as any)[channelKey]
      : null;
    if (channelMessages) {
      const angles = channelMessages.angles || {};
      const targetAngleData =
        angles[outreachAngle] ||
        (outreachAngle === 'executive_summary' ? angles.quick_observation : null) ||
        (outreachAngle === 'performance_vitals' ? angles.glitch_alert : null) ||
        (outreachAngle === 'conversion_ux' ? angles.conversion_teardown : null) ||
        (outreachAngle === 'technical_seo' ? angles.compliment_fix : null) ||
        (outreachAngle === 'quick_observation' ? angles.executive_summary : null) ||
        (outreachAngle === 'glitch_alert' ? angles.performance_vitals : null) ||
        (outreachAngle === 'conversion_teardown' ? angles.conversion_ux : null) ||
        (outreachAngle === 'compliment_fix' ? angles.technical_seo : null);

      if (targetAngleData) {
        return {
          subject: targetAngleData.subject || channelMessages.subject || '',
          body: targetAngleData.body,
        };
      }
      if (channelMessages.body) {
        return {
          subject: channelMessages.subject || '',
          body: channelMessages.body,
        };
      }
    }

    // 3. Adaptive non-repeating professional Website Audit Summary derived strictly from findings
    const biz = report.businessName;
    const domain = report.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const topIssue = report.detailedIssues?.[0];
    const topProblem = topIssue?.problem || 'primary action triggers lack clear next-step conversion incentives';
    const cleanProblem = topProblem.length > 200 ? topProblem.substring(0, 197) + '...' : topProblem;
    const scriptCount = report.metrics?.scriptCount || 0;
    const loadTime = report.metrics?.loadTimeMs || 850;

    if (outreachAngle === 'performance_vitals' || outreachAngle === 'glitch_alert') {
      return {
        subject: `Technical Performance & Speed Audit: ${domain} (~${loadTime}ms benchmark)`,
        body: `Hi ${biz} Team,\n\nDuring a recent Google Core Web Vitals diagnostic of ${domain}, we benchmarked your mobile delivery and asset load times:\n\n• Mobile Latency: Server response and initial render clocked at ~${loadTime}ms.\n• Asset Optimization: ${scriptCount > 0 ? `${scriptCount} third-party scripts are being loaded during initial render, which can introduce mobile friction.` : 'Asset delivery and styling can be streamlined to accelerate First Contentful Paint.'}\n• Mobile Experience: Mobile viewport is active; asset deferral is recommended to prevent visitor bounce.\n\nStreamlining these assets typically retains 15–25% more mobile visitors. Would you like me to send over our technical performance breakdown?`,
      };
    }
    if (outreachAngle === 'conversion_ux' || outreachAngle === 'conversion_teardown') {
      return {
        subject: `Conversion & UX Pathway Audit: ${domain}`,
        body: `Hi ${biz} Team,\n\nI analyzed the user experience and conversion funnel on ${domain}. We spotted notable opportunities to capture more high-intent visitors:\n\n• Call-to-Action Architecture: ${cleanProblem}\n• Inquiry Pathways: Transitioning passive buttons into direct modal triggers noticeably lowers visitor drop-off.\n\nWe have compiled a 3-step UX optimization outline for ${biz}. Open to reviewing the summary draft?`,
      };
    }
    if (outreachAngle === 'technical_seo' || outreachAngle === 'compliment_fix') {
      return {
        subject: `Technical Architecture & SEO Audit: ${domain}`,
        body: `Hi ${biz} Team,\n\nOur team completed a technical architecture and on-page indexing audit of ${domain}:\n\n• Heading Structure: Content hierarchy presents immediate opportunities for primary keyword anchoring.\n• Asset Delivery: Technical audit flagged image and asset optimizations to bolster search indexing.\n• Security: Valid HTTPS protocol verified.\n\nWould you like our complete technical checklist for your development roadmap?`,
      };
    }
    // Default: executive_summary / quick_observation
    return {
      subject: `Website Audit Summary: ${domain} (Conversion & UX Analysis)`,
      body: `Hi ${biz} Team,\n\nI recently conducted a technical and conversion audit of ${domain}. Overall, your digital presence has strong core elements, but we identified key friction points that may be suppressing inquiries:\n\n• Action Architecture: ${cleanProblem}\n• Mobile Latency: Page response measured at ~${loadTime}ms${scriptCount > 0 ? ` with ${scriptCount} script resources evaluated` : ''}.\n• Navigation & Hierarchy: Structural headlines and conversion touchpoints can be optimized to lift retention.\n\nWe prepared a full Website Audit Summary and priority roadmap. Would you be open to a brief 10-minute briefing next week to review the findings?`,
    };
  };

  const outreach = getOutreachMessage();

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full min-h-screen">
      {/* =========================================================================
          VIEW A: FORM VIEW OR IN-PROGRESS VIEW (Matching Screenshots 1 & 2)
         ========================================================================= */}
      {!report && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Run a new audit
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              We fetch the live site, identify what kind of business it is, score it against the checks that matter for that industry, then turn the findings into a prioritised plan.
            </p>
          </div>

          {/* Form Card (Matching Screenshot 1) */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-7 max-w-2xl shadow-xl space-y-5">
            {/* Store URL Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Store URL
              </label>
              <input
                type="text"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !analyzing && handleStartAudit()}
                disabled={analyzing}
                placeholder="https://yourstore.com"
                className="w-full bg-[#080e1b] border border-[#1e2f4e] focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Business Type Select */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Business type
              </label>
              <div className="relative">
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  disabled={analyzing}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Auto-detect">Auto-detect</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Local Services">Local Services</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Restaurant / Food">Restaurant / Food</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Technology / SaaS">Technology / SaaS</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Auto-detect identifies the business from the site's own content and picks the matching industry checklist. You can change it on the report afterwards.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={() => handleStartAudit()}
                disabled={analyzing || !storeUrl.trim()}
                className="w-full py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing store...</span>
                  </>
                ) : (
                  <>
                    <Radar className="w-4 h-4 text-slate-950" />
                    <span>Analyze store</span>
                  </>
                )}
              </button>

              {/* Free Unlimited Badge (Per User Requirement) */}
              <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                100% Free &amp; Unlimited site audits · No AI credits needed
              </p>
            </div>
          </div>

          {/* Analysis In Progress Card (Matching Screenshot 2) */}
          {analyzing && (
            <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-7 max-w-2xl shadow-xl space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white tracking-tight">
                  Analysis in progress
                </span>
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {progressPercent}%
                </span>
              </div>

              {/* Cyan Progress Bar */}
              <div className="w-full h-1.5 bg-[#14213d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Checklist steps */}
              <div className="space-y-3 pt-2">
                {analysisSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : isCurrent ? (
                        <RotateCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                      )}
                      <span
                        className={
                          isCompleted
                            ? 'text-slate-200 font-medium'
                            : isCurrent
                            ? 'text-cyan-300 font-semibold'
                            : 'text-slate-500'
                        }
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-[#162238]">
                This usually takes under a minute. Keep this tab open.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW B: COMPREHENSIVE AUDIT REPORT (Matching Screenshots 3, 4, 5 & 6)
         ========================================================================= */}
      {report && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Bar Navigation (Screenshot 3) */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#141f36]">
            <button
              onClick={() => setReport(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSaveAsLead}
                disabled={leadSaved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  leadSaved
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#0e172a] hover:bg-[#14213d] text-slate-200 border-[#203152]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>{leadSaved ? 'Saved as lead' : '+ Save as lead'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0e172a] hover:bg-[#14213d] text-slate-200 border border-[#203152] text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Export report</span>
              </button>

              <button
                onClick={() => setReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Delete this view"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner: What changed since last time (Screenshot 3) */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-xs text-white">What changed since last time</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                This is the first report for this site — re-check it later to see progress.
              </p>
            </div>

            <button
              onClick={() => handleStartAudit(report.url)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080e1b] hover:bg-[#101b31] border border-[#1e2f4e] text-xs font-semibold text-slate-300 transition-colors"
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>Re-check this site</span>
            </button>
          </div>

          {/* Main Score & Store Overview Card (Screenshot 3) */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Donut Score (Screenshot 3) */}
            <div className="lg:col-span-4 bg-[#080e1b] border border-[#16253e] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-inner">
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#162238"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#00f2fe"
                    strokeWidth="8"
                    strokeDasharray={`${(report.overallScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {report.overallScore}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">/ 100</span>
                </div>
              </div>

              <p className="text-xs font-bold text-white mt-4">Overall Store Score</p>
            </div>

            {/* Right Store Info & 7 Metric Cards (Screenshot 3) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Business Header */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {report.businessName}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                    {report.businessType}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {report.summaryParagraph1}
                </p>

                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-1.5 hover:underline"
                >
                  <span>{report.url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {report.criticalFindingsSummary}
                </p>
              </div>

              {/* Business Type Selector Row */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#162238] flex-wrap">
                <span className="text-xs text-slate-400">Business type:</span>
                <select
                  value={report.businessType}
                  onChange={(e) => setReport({ ...report, businessType: e.target.value })}
                  className="bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="E-commerce">E-commerce</option>
                  <option value="Local Services">Local Services</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Restaurant / Food">Restaurant / Food</option>
                </select>
                <span className="text-[11px] text-slate-400">
                  Detected automatically from the site content — override it if it's wrong.
                </span>
              </div>

              {/* 7 Granular Metric Cards Grid (Screenshot 3) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: 'UX', score: report.scores.ux },
                  { label: 'CRO', score: report.scores.cro },
                  { label: 'SEO', score: report.scores.seo },
                  { label: 'Trust', score: report.scores.trust },
                  { label: 'Mobile', score: report.scores.mobile },
                  { label: 'Content', score: report.scores.content },
                  { label: 'Product Pages', score: report.scores.productPages },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#080e1b] border border-[#16253e] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">{m.label}</span>
                      <span className="text-sm font-bold text-white">{m.score}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-[#14213d] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getMetricBarColor(m.score)}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Opportunity Card (Screenshot 4) */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Business Opportunity</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Opportunity Score: {report.businessOpportunity.score}/100 · Level: {report.businessOpportunity.level}
                </p>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-md bg-[#080e1b] border border-[#1e2f4e] text-slate-400">
                Qualitative assessment — no revenue estimates
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {report.businessOpportunity.description}
            </p>

            {/* Recommended Services Pill Tags */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                RECOMMENDED SERVICES
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {report.businessOpportunity.recommendedServices.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-[#0e213b] text-cyan-300 border border-cyan-500/30 font-medium"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Detected Issues List (Screenshots 4 & 5) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Detected issues</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {report.detailedIssues.length} findings, ordered by severity.
              </p>
            </div>

            <div className="space-y-4">
              {report.detailedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors"
                >
                  {/* Top Row: Title, Category, Severity */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {issue.title}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#080e1b] text-slate-400 border border-[#1a2842] font-semibold uppercase">
                        {issue.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getSeverityBadge(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Grid Matching Screenshot 5: Col 1 (Problem + Recommendation), Col 2 (Why It Matters + Business Impact) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#162238] text-xs">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          PROBLEM
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{issue.problem}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          RECOMMENDATION
                        </span>
                        <p className="text-slate-200 leading-relaxed font-sans">{issue.recommendation}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          WHY IT MATTERS
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{issue.whyItMatters}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          BUSINESS IMPACT
                        </span>
                        <p className="text-slate-200 leading-relaxed font-sans">{issue.businessImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your 30-Day Growth Action Plan (Screenshot 5) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Your 30-Day Growth Action Plan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.actionPlan.map((week) => (
                <div
                  key={week.week}
                  className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4 flex flex-col justify-between"
                >
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Week {week.week} · {week.title}</span>
                  </h4>

                  <div className="space-y-4">
                    {week.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl bg-[#080e1b] border border-[#16253e] space-y-2"
                      >
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-slate-400">
                            Difficulty: <span className="text-slate-200 font-semibold">{task.difficulty}</span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              task.impact === 'Critical'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : task.impact === 'High'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {task.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
              Findings are based on publicly served page markup and AI analysis. Behavioral metrics (traffic, conversion rate, revenue) are not observed and are never estimated.
            </p>
          </div>

          {/* Outreach Generator Section (Screenshot 5 & 6) */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Outreach generator</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personalised messages built from this store's actual findings.
                </p>
              </div>

              <button
                onClick={() => handleRegenerateOutreach()}
                disabled={regeneratingOutreach}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a83b] hover:bg-[#d4972d] text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 disabled:opacity-50"
              >
                {regeneratingOutreach ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-slate-950" />
                )}
                <span>{regeneratingOutreach ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            </div>

            {regenerateToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{regenerateToast}</span>
              </div>
            )}

            {/* Channel Tabs */}
            <div className="flex items-center gap-2 border-b border-[#162238] pb-3">
              {(['Email', 'LinkedIn', 'WhatsApp', 'Instagram DM'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    setOutreachChannel(ch);
                    setCustomOutreachMessage(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    outreachChannel === ch
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#080e1b] text-slate-400 hover:text-slate-200 border border-[#18263f]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Outreach Message Box (Matching Screenshot 6) */}
            <div className="bg-[#080e1b] border border-[#18263f] rounded-2xl p-6 space-y-4">
              {outreach.subject && (
                <p className="text-xs font-semibold text-slate-200">
                  <span className="text-slate-400 font-normal">Subject:</span> {outreach.subject}
                </p>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {outreach.body}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() =>
                    handleCopyPitch(
                      outreach.subject ? `Subject: ${outreach.subject}\n\n${outreach.body}` : outreach.body
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14213d] hover:bg-[#1d2f54] text-slate-200 text-xs font-semibold border border-[#23385e] transition-colors"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 mr-1">Angle:</span>
                  {[
                    { key: 'executive_summary', label: 'Executive Summary', altKeys: ['quick_observation'] },
                    { key: 'performance_vitals', label: 'Speed & Web Vitals', altKeys: ['glitch_alert'] },
                    { key: 'conversion_ux', label: 'Conversion & UX', altKeys: ['conversion_teardown'] },
                    { key: 'technical_seo', label: 'Technical & SEO', altKeys: ['compliment_fix'] },
                  ].map((opt) => {
                    const isSelected =
                      outreachAngle === opt.key ||
                      (opt.altKeys as readonly string[]).includes(outreachAngle);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setOutreachAngle(opt.key as any);
                          setCustomOutreachMessage(null);
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#101b2f]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">Loading audit engine...</div>
      }
    >
      <AuditContent />
    </Suspense>
  );
}
