'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  RotateCw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  Printer,
} from 'lucide-react';
import Header from '@/components/Header';
import { CompetitorComparison } from '@/lib/types';

export default function CompetitorPage() {
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [activeComparison, setActiveComparison] = useState<CompetitorComparison | null>(null);

  const addCompetitorField = () => {
    if (competitorUrls.length < 3) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeCompetitorField = (idx: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== idx));
  };

  const handleRunComparison = async () => {
    if (!primaryUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryUrl: primaryUrl.trim(),
          competitorUrls: competitorUrls.filter((u) => u.trim().length > 3),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveComparison(data.comparison);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Competitor Comparison & AI Battlecard"
        subtitle="Benchmark local competitors side-by-side to uncover vulnerabilities and strategic advantages."
        showQuickActions={false}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        {/* Setup Card */}
        <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Configure Comparison URLs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Business URL */}
            <div>
              <label className="text-xs font-semibold text-cyan-400 block mb-1.5">
                Your Prospect / Target Website *
              </label>
              <input
                type="text"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="e.g. https://apexcuts.com"
                className="w-full bg-[#080e1b] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-300"
              />
            </div>

            {/* Competitor URLs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">
                Competitor Websites (1 to 3 competitors)
              </label>

              {competitorUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const next = [...competitorUrls];
                      next[idx] = e.target.value;
                      setCompetitorUrls(next);
                    }}
                    placeholder={`e.g. https://competitor-${idx + 1}.com`}
                    className="flex-1 bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  {competitorUrls.length > 1 && (
                    <button
                      onClick={() => removeCompetitorField(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {competitorUrls.length < 3 && (
                <button
                  onClick={addCompetitorField}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another competitor</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#162238] flex items-center justify-end">
            <button
              onClick={handleRunComparison}
              disabled={loading || !primaryUrl.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Competitor Sites...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Generate Competitor Benchmark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {activeComparison && (
          <div className="space-y-6">
            {/* Winner Strip */}
            <div className="bg-[#0c1527] border border-cyan-500/30 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Current Benchmark Leader
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeComparison.winnerUrl}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#14213d] hover:bg-[#1d2f54] text-slate-200 border border-[#23385e] text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Battlecard</span>
              </button>
            </div>

            {/* Side by Side Scorecards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeComparison.reports.map((r, idx) => (
                <div
                  key={idx}
                  className={`bg-[#0c1527] border rounded-2xl p-5 ${
                    r.url === activeComparison.winnerUrl
                      ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                      : 'border-[#192843]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {idx === 0 ? 'Your Prospect' : `Competitor ${idx}`}
                    </span>
                    <span className="text-lg font-black text-cyan-400">{r.overallScore}/100</span>
                  </div>

                  <h4 className="font-bold text-sm text-white truncate">{new URL(r.url).hostname}</h4>

                  <div className="mt-4 space-y-2 pt-3 border-t border-[#162238] text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>SEO:</span>
                      <span className="font-semibold text-white">{r.seoScore}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Speed:</span>
                      <span className="font-semibold text-white">{r.performanceScore}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Accessibility:</span>
                      <span className="font-semibold text-white">{r.accessibilityScore}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Conversion:</span>
                      <span className="font-semibold text-white">{r.conversionScore}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Latency:</span>
                      <span className="font-semibold text-white">{r.metrics.loadTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Comparative Insights */}
            <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Strategic Battlecard</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#080e1b] p-4 rounded-xl border border-[#18263f]">
                  {activeComparison.aiAnalysis.executiveSummary}
                </p>
              </div>

              {/* Tactical Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tactical Opportunities to Outperform Rivals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeComparison.aiAnalysis.tacticalRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#080e1b] border border-[#18263f] text-xs text-slate-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

