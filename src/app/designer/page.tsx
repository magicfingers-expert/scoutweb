'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Palette,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Send,
  Save,
  Globe,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Undo2,
  Redo2,
  Share2,
} from 'lucide-react';
import Header from '@/components/Header';
import { WebsiteProject, WebsiteSection, WebsitePage } from '@/lib/types';

function DesignerContent() {
  const searchParams = useSearchParams();
  const prefillName = searchParams.get('name') || '';
  const prefillInd = searchParams.get('industry') || '';

  // Step state: 'wizard' | 'editor'
  const [viewMode, setViewMode] = useState<'wizard' | 'editor'>('wizard');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Generator Wizard Inputs
  const [businessName, setBusinessName] = useState(prefillName);
  const [industry, setIndustry] = useState(prefillInd);
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<'modern' | 'bold' | 'luxury' | 'creative' | 'minimal' | 'corporate'>('modern');
  const [primaryColor, setPrimaryColor] = useState('#06b6d4');
  const [generating, setGenerating] = useState(false);

  // Active Project & History for Undo/Redo
  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [history, setHistory] = useState<WebsiteProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI Prompt Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModifying, setAiModifying] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // Publishing State
  const [customSlug, setCustomSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Saved Projects
  const [savedProjects, setSavedProjects] = useState<WebsiteProject[]>([]);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/ai/website');
      if (res.ok) {
        const data = await res.json();
        setSavedProjects(data.websites || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const pushToHistory = (newProject: WebsiteProject) => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(JSON.parse(JSON.stringify(newProject)));
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleGenerate = async () => {
    if (!businessName || !industry) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/ai/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          businessName,
          industry,
          description,
          style,
          primaryColor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProject(data.website);
        setCustomSlug(data.website.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        pushToHistory(data.website);
        setViewMode('editor');
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAiModify = async () => {
    if (!project || !aiPrompt.trim()) return;
    setAiModifying(true);
    setAiSummary('');

    try {
      const res = await fetch('/api/ai/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify',
          project,
          prompt: aiPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProject(data.website);
        setAiSummary(data.summary || 'Modifications applied successfully');
        pushToHistory(data.website);
        setAiPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiModifying(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!project) return;
    try {
      await fetch('/api/ai/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', project }),
      });
      alert('Draft saved to project library!');
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    if (!project) return;
    setIsPublishing(true);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: project.id,
          slug: customSlug,
          action: 'publish',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPublishedUrl(data.publishedUrl);
        setProject({ ...project, isPublished: true, publishedSlug: data.website.publishedSlug });
        loadProjects();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Publishing failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!project || !project.pages[0]) return;
    const sections = [...project.pages[0].sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    const updated = {
      ...project,
      pages: [{ ...project.pages[0], sections }],
    };
    setProject(updated);
    pushToHistory(updated);
  };

  const handleDeleteSection = (index: number) => {
    if (!project || !project.pages[0]) return;
    const sections = project.pages[0].sections.filter((_, i) => i !== index);
    const updated = {
      ...project,
      pages: [{ ...project.pages[0], sections }],
    };
    setProject(updated);
    pushToHistory(updated);
  };

  const handleUpdateSectionTitle = (index: number, newTitle: string) => {
    if (!project || !project.pages[0]) return;
    const sections = [...project.pages[0].sections];
    sections[index] = { ...sections[index], title: newTitle };
    const updated = {
      ...project,
      pages: [{ ...project.pages[0], sections }],
    };
    setProject(updated);
  };

  const handleUpdateSectionSubtitle = (index: number, newSub: string) => {
    if (!project || !project.pages[0]) return;
    const sections = [...project.pages[0].sections];
    sections[index] = { ...sections[index], subtitle: newSub };
    const updated = {
      ...project,
      pages: [{ ...project.pages[0], sections }],
    };
    setProject(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="AI Website Designer & Visual Editor"
        subtitle="Turnkey website generation with live visual drag-and-drop editing and one-click cloud hosting."
        showQuickActions={false}
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Mode Switcher */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#141f36]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('wizard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'wizard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#0c1527] text-slate-400 hover:text-white border border-[#192843]'
              }`}
            >
              1. Website Generation Wizard
            </button>
            <button
              onClick={() => project && setViewMode('editor')}
              disabled={!project}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'editor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#0c1527] text-slate-400 hover:text-white border border-[#192843] disabled:opacity-40'
              }`}
            >
              2. Visual Editor & Live Canvas
            </button>
          </div>

          {viewMode === 'editor' && project && (
            <div className="flex items-center gap-2.5">
              {/* Device Viewport switch */}
              <div className="flex items-center bg-[#091120] border border-[#18263f] rounded-xl p-1 gap-1">
                <button
                  onClick={() => setDeviceViewport('desktop')}
                  className={`p-1.5 rounded-lg ${
                    deviceViewport === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceViewport('tablet')}
                  className={`p-1.5 rounded-lg ${
                    deviceViewport === 'tablet' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceViewport('mobile')}
                  className={`p-1.5 rounded-lg ${
                    deviceViewport === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#14213d] hover:bg-[#1b2b4e] text-slate-200 text-xs font-semibold border border-[#23385e] transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                {isPublishing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish to Live Web</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* WIZARD VIEW */}
        {viewMode === 'wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-white tracking-tight">
                AI Website Brief & Style Generator
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Cuts Barbershop"
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Industry / Sector *
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Barber Shop, Law Firm, Dentist"
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Business Description & Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Premier local styling studio with over 10 years experience, offering executive haircuts, hot towel shaves, and online booking."
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Design Style */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Preferred Visual Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'modern', label: 'Modern Minimal', desc: 'Clean cyan & obsidian' },
                    { id: 'bold', label: 'Bold Tech', desc: 'High-contrast vibrant' },
                    { id: 'luxury', label: 'Elegant Luxury', desc: 'Sophisticated gold & dark' },
                    { id: 'creative', label: 'Creative Studio', desc: 'Dynamic purple neon' },
                    { id: 'minimal', label: 'Clean Corporate', desc: 'Slate & trust blue' },
                    { id: 'corporate', label: 'Enterprise Executive', desc: 'Polished deep navy' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStyle(st.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        style === st.id
                          ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                          : 'bg-[#080e1b] border-[#18263f] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-200">{st.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#162238] flex items-center justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !businessName.trim() || !industry.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Generating Turnkey Website...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Full Website</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Projects Library */}
            <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Saved Website Projects</h3>
              <div className="space-y-3">
                {savedProjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No website drafts generated yet.</p>
                ) : (
                  savedProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-[#091120] border border-[#16253e] hover:border-cyan-500/30 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{p.businessName}</p>
                        <p className="text-[10px] text-slate-400">{p.industry} · {p.style}</p>
                        {p.isPublished && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                            <Globe className="w-2.5 h-2.5" /> Published
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setProject(p);
                          setViewMode('editor');
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold"
                      >
                        Open Editor
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISUAL EDITOR VIEW */}
        {viewMode === 'editor' && project && (
          <div className="space-y-6">
            {/* AI Assistant Command Bar */}
            <div className="bg-[#0c1527] border border-cyan-500/30 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiModify()}
                  placeholder='Ask AI Assistant: "Make hero more modern", "Add testimonials section", "Change colors to luxury dark gold"...'
                  className="flex-1 bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleAiModify}
                  disabled={aiModifying || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                >
                  {aiModifying ? 'Applying...' : 'Apply AI Change'}
                </button>
              </div>

              {aiSummary && (
                <p className="text-[11px] text-cyan-400 mt-2 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{aiSummary}</span>
                </p>
              )}
            </div>

            {/* Published Banner if live */}
            {publishedUrl && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Website successfully deployed live to the public internet!</span>
                </div>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <span>Open Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Visual Canvas Layout */}
            <div className="flex justify-center bg-[#050811] p-6 rounded-2xl border border-[#162238] overflow-x-auto min-h-[600px]">
              <div
                className={`bg-[${project.colors.background}] transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-[#1e2f4e] flex flex-col ${
                  deviceViewport === 'desktop'
                    ? 'w-full max-w-5xl'
                    : deviceViewport === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
                style={{ backgroundColor: project.colors.background }}
              >
                {/* Simulated Browser Bar */}
                <div className="bg-[#0b1324] px-4 py-2.5 border-b border-[#18263f] flex items-center justify-between text-xs text-slate-400 select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="px-3 py-1 bg-[#060911] rounded-md text-[11px] text-cyan-400 font-mono">
                    https://scoutweb.ai/site/{customSlug || 'preview'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">{deviceViewport}</div>
                </div>

                {/* Website Sections List */}
                <div className="p-4 space-y-6">
                  {project.pages[0]?.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="group relative border border-transparent hover:border-cyan-500/40 rounded-xl p-4 transition-all"
                      style={{ backgroundColor: project.colors.surface }}
                    >
                      {/* Section Controls overlay */}
                      <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1.5 bg-[#091120] border border-[#1e2f4e] rounded-lg p-1 z-10">
                        <button
                          onClick={() => handleMoveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 'down')}
                          disabled={idx === project.pages[0].sections.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Section Header Inputs */}
                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={(e) => handleUpdateSectionTitle(idx, e.target.value)}
                        className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:outline-none w-full mb-1"
                        style={{ color: project.colors.text }}
                      />

                      <textarea
                        rows={2}
                        value={sec.subtitle || ''}
                        onChange={(e) => handleUpdateSectionSubtitle(idx, e.target.value)}
                        className="text-xs text-slate-300 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:outline-none w-full resize-none leading-relaxed"
                      />

                      {/* Section Type Specific Content Preview */}
                      {sec.type === 'hero' && (
                        <div className="mt-4 flex gap-3">
                          <button
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md"
                            style={{ backgroundColor: project.colors.primary }}
                          >
                            {sec.content.ctaPrimaryText || 'Book Appointment'}
                          </button>
                          <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800/80 border border-slate-700">
                            {sec.content.ctaSecondaryText || 'Our Services'}
                          </button>
                        </div>
                      )}

                      {sec.type === 'services' && sec.content.servicesList && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {sec.content.servicesList.map((srv: any, sIdx: number) => (
                            <div key={sIdx} className="p-3 rounded-lg bg-[#080e1b] border border-[#18263f]">
                              <p className="font-bold text-xs text-white">{srv.name}</p>
                              <p className="text-cyan-400 font-bold text-sm my-1">{srv.price}</p>
                              <p className="text-[11px] text-slate-400 leading-tight">{srv.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.type === 'testimonials' && sec.content.reviews && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sec.content.reviews.map((rev: any, rIdx: number) => (
                            <div key={rIdx} className="p-3 rounded-lg bg-[#080e1b] border border-[#18263f]">
                              <p className="text-[11px] text-slate-300 italic mb-2">"{rev.text}"</p>
                              <p className="font-bold text-xs text-cyan-400">{rev.author}</p>
                            </div>
                          ))}
                        </div>
                      )}
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

export default function DesignerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading AI designer studio...</div>}>
      <DesignerContent />
    </Suspense>
  );
}

