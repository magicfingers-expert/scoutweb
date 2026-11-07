'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCw,
  Mail,
  MessageSquare,
  Share2,
  Globe,
  Tag,
  Briefcase,
} from 'lucide-react';
import Header from '@/components/Header';

export default function ContentSuitePage() {
  const [selectedTool, setSelectedTool] = useState('seo_meta');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'seo_meta',
      name: 'SEO Titles & Meta Descriptions',
      desc: 'High-CTR search tags and snippet copy',
      icon: Tag,
    },
    {
      id: 'landing_copy',
      name: 'Landing Page Copy',
      desc: 'Hero headlines, value propositions, and guarantees',
      icon: Globe,
    },
    {
      id: 'cold_email',
      name: 'Cold Email Outreach',
      desc: 'Personalized appointment & pitch emails',
      icon: Mail,
    },
    {
      id: 'whatsapp_script',
      name: 'WhatsApp Outreach Script',
      desc: 'High-converting conversational mobile scripts',
      icon: MessageSquare,
    },
    {
      id: 'social_captions',
      name: 'Social Media Captions',
      desc: 'Engaging Instagram, Facebook, and LinkedIn posts',
      icon: Share2,
    },
    {
      id: 'sales_proposal',
      name: 'Sales Proposals & Battlecards',
      desc: 'Comprehensive pitch proposals for prospects',
      icon: Briefcase,
    },
  ];

  const handleGenerate = async () => {
    if (!businessName.trim()) return;

    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          businessName,
          industry,
          keywords,
          extraNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedResult(data.output);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="AI Content & Outreach Suite"
        subtitle="Produce high-converting copywriting, SEO tags, email funnels, and sales proposals."
        showQuickActions={false}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        {/* Tool Cards Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tools.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTool(t.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-[#0c1527] border-[#192843] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <p className="font-bold text-xs leading-snug">{t.name}</p>
              </button>
            );
          })}
        </div>

        {/* Input & Output Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Content Parameters
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Barber Palace"
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Industry / Category</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Grooming & Barber Shop"
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Target Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. best haircut, executive grooming, kyle tx"
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Special Instructions (Optional)</label>
              <textarea
                rows={3}
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="e.g. Emphasize weekend appointment availability and hot towel service..."
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !businessName.trim()}
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Output */}
          <div className="lg:col-span-7 bg-[#0c1527] border border-[#192843] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Generated Output (Editable)
                </h3>
                {generatedResult && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14213d] hover:bg-[#1b2b4e] text-slate-200 text-xs font-semibold border border-[#23385e] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <textarea
                rows={16}
                value={generatedResult}
                onChange={(e) => setGeneratedResult(e.target.value)}
                placeholder="Generated copy, SEO metadata, cold email, or proposals will appear here ready to copy and use..."
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

