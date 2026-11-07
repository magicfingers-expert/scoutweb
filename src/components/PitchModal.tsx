'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mail,
  MessageSquare,
  Share2,
  Copy,
  Check,
  RotateCw,
  Bookmark,
  Send,
} from 'lucide-react';
import { BusinessResult, PitchRecord } from '@/lib/types';

interface PitchModalProps {
  business: BusinessResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToLead?: (pitch: PitchRecord) => void;
}

export default function PitchModal({
  business,
  isOpen,
  onClose,
  onSaveToLead,
}: PitchModalProps) {
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'linkedin'>('email');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'persuasive'>('professional');
  const [length, setLength] = useState<'short' | 'detailed'>('short');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchRecord | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [editableSubject, setEditableSubject] = useState('');

  const fetchPitch = async () => {
    if (!business) return;
    setLoading(true);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business,
          channel,
          tone,
          length,
          customInstructions: customPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentPitch(data.pitch);
        setEditableContent(data.pitch.content);
        setEditableSubject(data.pitch.subject || '');
      }
    } catch (err) {
      console.error('Failed to generate pitch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && business) {
      fetchPitch();
    }
  }, [isOpen, business, channel, tone, length]);

  if (!isOpen || !business) return null;

  const handleCopy = () => {
    const fullText = editableSubject
      ? `Subject: ${editableSubject}\n\n${editableContent}`
      : editableContent;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!currentPitch) return;
    const finalPitch: PitchRecord = {
      ...currentPitch,
      subject: editableSubject || undefined,
      content: editableContent,
    };
    if (onSaveToLead) onSaveToLead(finalPitch);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1324] border border-[#1e2f4e] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/40">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#18263f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Outreach Pitch Generator
              </h2>
              <p className="text-xs text-slate-400">
                Personalized for <span className="text-cyan-400 font-semibold">{business.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15233c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Channel Select */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Outreach Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setChannel('email')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  channel === 'email'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#10192e] text-slate-400 border-[#1a2842] hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Cold Email</span>
              </button>
              <button
                onClick={() => setChannel('whatsapp')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#10192e] text-slate-400 border-[#1a2842] hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setChannel('linkedin')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  channel === 'linkedin'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#10192e] text-slate-400 border-[#1a2842] hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Tone & Length Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-[#10192e] border border-[#1a2842] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="persuasive">Persuasive</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full bg-[#10192e] border border-[#1a2842] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="short">Short (Quick Hook)</option>
                <option value="detailed">Detailed (Comprehensive Pitch)</option>
              </select>
            </div>
          </div>

          {/* Generated Subject if Email */}
          {channel === 'email' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={editableSubject}
                onChange={(e) => setEditableSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full bg-[#10192e] border border-[#1a2842] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Pitch Editor Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Generated Message (Editable)
              </label>
              {loading && (
                <span className="text-xs text-cyan-400 flex items-center gap-1.5">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  <span>Synthesizing tailored pitch...</span>
                </span>
              )}
            </div>
            <textarea
              rows={8}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full bg-[#080e1b] border border-[#1a2842] rounded-xl p-3.5 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-[#18263f] flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={fetchPitch}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#14213d] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14213d] hover:bg-[#1b2b4e] text-slate-200 text-xs font-semibold border border-[#23385e] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Lead!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save to Lead</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

