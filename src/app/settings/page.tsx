'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Key,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  Download,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import Header from '@/components/Header';
import { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [googlePlacesApiKey, setGooglePlacesApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'smart_heuristic' | 'gemini' | 'openai' | 'anthropic'>('smart_heuristic');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [defaultCity, setDefaultCity] = useState('');
  const [defaultIndustry, setDefaultIndustry] = useState('');

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setRole(data.user.role || '');
          setGooglePlacesApiKey(data.user.preferences?.googlePlacesApiKey || '');
          setAiProvider(data.user.preferences?.aiProvider || 'smart_heuristic');
          setAiApiKey(data.user.preferences?.aiApiKey || '');
          setAiModel(data.user.preferences?.aiModel || 'gemini-1.5-flash');
          setDefaultCity(data.user.preferences?.defaultCity || '');
          setDefaultIndustry(data.user.preferences?.defaultIndustry || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          preferences: {
            googlePlacesApiKey,
            aiProvider,
            aiApiKey,
            aiModel,
            defaultCity,
            defaultIndustry,
          },
        }),
      });

      if (res.ok) {
        setSavedMessage('Settings successfully updated and saved to persistent database!');
        setTimeout(() => setSavedMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/leads';
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Settings & System Configuration"
        subtitle="Manage your profile, configure external API keys, and tune prospecting preferences."
        showQuickActions={false}
      />

      <div className="p-8 space-y-8 max-w-4xl mx-auto w-full flex-1">
        {savedMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Profile Information */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#162238]">
              <User className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                User Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 2. External API Integrations */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#162238]">
              <Key className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                API Integrations & External Keys
              </h2>
            </div>

            {/* Google Places API */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Google Places API Key
                </label>
                <span className="text-[11px] text-cyan-400">
                  Optional — Global discovery fallback works automatically
                </span>
              </div>
              <input
                type="password"
                value={googlePlacesApiKey}
                onChange={(e) => setGooglePlacesApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                If provided, Opportunity Finder will query Google Places API directly. If left blank, the system uses built-in live open global business discovery.
              </p>
            </div>

            {/* AI Provider */}
            <div className="pt-3 border-t border-[#162238] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    AI Intelligence Provider
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value as any)}
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="smart_heuristic">Smart Built-in Heuristic AI (Zero Config)</option>
                    <option value="gemini">Google Gemini API</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="anthropic">Anthropic (Claude 3.5)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    AI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="Enter API key for external provider..."
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Prospecting Defaults */}
          <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#162238]">
              <Settings className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Prospecting Defaults
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Default City / Location</label>
                <input
                  type="text"
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  placeholder="e.g. Austin, TX"
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Default Target Industry</label>
                <input
                  type="text"
                  value={defaultIndustry}
                  onChange={(e) => setDefaultIndustry(e.target.value)}
                  placeholder="e.g. Barbers"
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

