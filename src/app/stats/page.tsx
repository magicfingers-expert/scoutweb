'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  Users,
  Globe,
  Palette,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Infinity,
} from 'lucide-react';
import Header from '@/components/Header';
import { ActivityLog } from '@/lib/types';

export default function StatsPage() {
  const [stats, setStats] = useState({
    searches: 0,
    savedLeads: 0,
    auditsRun: 0,
    websitesGenerated: 0,
    publishedWebsites: 0,
    aiOperations: 0,
  });
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.activity) setActivity(data.activity);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Usage & Activity Statistics"
        subtitle="Transparent tracking of all business searches, lead conversions, website audits, and AI operations."
        showQuickActions={false}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        {/* Unlimited Free Pro Notice Banner */}
        <div className="p-5 rounded-2xl bg-[#0c1e36] border border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Infinity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Unlimited Open Access Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  100% Free Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every prospecting feature, AI pitch generator, deep audit, and website builder tool is unlocked with zero credit gates.
              </p>
            </div>
          </div>
        </div>

        {/* Informational Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Searches</span>
              <Search className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.searches}</p>
            <p className="text-[11px] text-slate-400 mt-1">Global directory queries performed</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved CRM Leads</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.savedLeads}</p>
            <p className="text-[11px] text-slate-400 mt-1">Businesses saved to pipeline</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Website Audits</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.auditsRun}</p>
            <p className="text-[11px] text-slate-400 mt-1">Deep technical site crawls</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Websites Generated</span>
              <Palette className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.websitesGenerated}</p>
            <p className="text-[11px] text-slate-400 mt-1">Turnkey multi-page projects</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Deployments</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.publishedWebsites}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active public cloud websites</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Operations</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white mt-3">{stats.aiOperations}</p>
            <p className="text-[11px] text-slate-400 mt-1">Pitches, copy & visual modifications</p>
          </div>
        </div>

        {/* Detailed Activity Log Table */}
        <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Audit Trail & Activity Log</h3>
          <p className="text-xs text-slate-400 mb-6">Historical operations log preserved in persistent database.</p>

          <div className="space-y-3">
            {activity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#080e1b] border border-[#18263f] text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{act.action}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                  </div>
                </div>
                <span className="text-slate-500 text-[11px] whitespace-nowrap ml-4">
                  {new Date(act.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

