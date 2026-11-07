'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radar,
  Users,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Header from '@/components/Header';
import { Lead, ActivityLog } from '@/lib/types';

export default function OverviewPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState({
    searches: 0,
    savedLeads: 0,
    auditsRun: 0,
    websitesGenerated: 0,
    publishedWebsites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsRes, statsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/stats'),
        ]);

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData.leads || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats || {});
          setActivity(statsData.activity || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Prospecting dashboard"
        subtitle="Live view of your saved prospects, pipeline and follow-ups."
      />

      <div className="p-8 space-y-8 flex-1">
        {/* KPI Metric Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Prospects</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{leads.length}</p>
            <p className="text-[11px] text-cyan-400 mt-1">Live in your local CRM pipeline</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Opportunity</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {leads.filter((l) => l.opportunityScore >= 75).length}
            </p>
            <p className="text-[11px] text-amber-400 mt-1">Prime candidates for outreach</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Web Audits</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stats.auditsRun}</p>
            <p className="text-[11px] text-emerald-400 mt-1">SEO & performance reports</p>
          </div>

          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Sites Built</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stats.websitesGenerated}</p>
            <p className="text-[11px] text-purple-400 mt-1">{stats.publishedWebsites} deployed live to web</p>
          </div>
        </div>

        {/* Main Content Area */}
        {leads.length === 0 ? (
          /* Empty State matching screenshot 3 */
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 shadow-lg shadow-cyan-950/50">
              <Radar className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight mb-2">
              No saved prospects yet
            </h2>

            <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
              Your dashboard fills in automatically once you save leads. Start with the Opportunity Finder, or audit a website you already have in mind.
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link
                href="/finder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <Search className="w-4 h-4" />
                <span>Find opportunities</span>
              </Link>

              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14213d] hover:bg-[#1b2b4e] text-slate-200 border border-[#23385e] text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Run an audit</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Populated State with Leads and Activity */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Leads list */}
            <div className="lg:col-span-2 bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Prospects</h3>
                  <p className="text-xs text-slate-400">High-scoring opportunities in your pipeline</p>
                </div>
                <Link
                  href="/leads"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <span>View all ({leads.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#091120] border border-[#16253e] hover:border-cyan-500/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{lead.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#132039] text-slate-300 border border-[#203152]">
                          {lead.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{lead.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-cyan-400">{lead.opportunityScore}</span>
                        <span className="text-[10px] text-slate-400 block">{lead.status}</span>
                      </div>
                      <Link
                        href={`/leads`}
                        className="p-2 rounded-lg bg-[#14213d] hover:bg-[#1d2f54] text-slate-300 hover:text-white transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Timeline */}
            <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">Activity Stream</h3>
              <p className="text-xs text-slate-400 mb-5">Real-time actions and AI updates</p>

              <div className="space-y-4">
                {activity.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{act.action}</p>
                      <p className="text-slate-400 text-[11px] leading-tight mt-0.5">{act.details}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

