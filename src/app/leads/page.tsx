'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  Trash2,
  Edit,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import Header from '@/components/Header';
import PitchModal from '@/components/PitchModal';
import { Lead, LeadStatus, BusinessResult, PitchRecord } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'date'>('score');

  // Lead editing state
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Pitch modal
  const [pitchLead, setPitchLead] = useState<Lead | null>(null);

  // Manual create form
  const [manualForm, setManualForm] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    opportunityScore: 85,
    status: 'New' as LeadStatus,
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Error loading leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { status: newStatus } }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        if (activeLead && activeLead.id === id) {
          setActiveLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async () => {
    if (!activeLead || !newNote.trim()) return;
    const updatedNotes = [...activeLead.notes, newNote.trim()];
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeLead.id, updates: { notes: updatedNotes } }),
      });
      if (res.ok) {
        setActiveLead({ ...activeLead, notes: updatedNotes });
        setLeads((prev) =>
          prev.map((l) => (l.id === activeLead.id ? { ...l, notes: updatedNotes } : l))
        );
        setNewNote('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lead from your CRM?')) return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (activeLead?.id === id) setActiveLead(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualForm,
          source: 'Manual Entry',
          tags: [manualForm.category || 'Lead'],
          notes: ['Created manually via CRM.'],
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setManualForm({
          name: '',
          category: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          opportunityScore: 85,
          status: 'New',
        });
        loadLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      'Name',
      'Category',
      'Status',
      'Opportunity Score',
      'Phone',
      'Email',
      'Website',
      'Address',
      'Rating',
      'Reviews',
      'Source',
    ];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      l.status,
      l.opportunityScore,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.website || ''}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      l.googleRating,
      l.reviewCount,
      `"${l.source}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort leads
  const filteredLeads = leads
    .filter((l) => {
      const matchStatus = selectedStatus === 'All' || l.status === selectedStatus;
      const matchSearch =
        search === '' ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase()) ||
        l.address.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.opportunityScore - a.opportunityScore;
      if (sortBy === 'rating') return b.googleRating - a.googleRating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statuses: ('All' | LeadStatus)[] = [
    'All',
    'New',
    'Contacted',
    'Interested',
    'Follow-up',
    'Converted',
    'Not interested',
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Lead Management CRM"
        subtitle="Organize, track, and follow up with your high-opportunity prospects."
        showQuickActions={false}
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Top Controls: Search, Status Tabs, Action buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0c1527] text-slate-400 hover:text-slate-200 border border-[#192843]'
                }`}
              >
                {st}
                {st === 'All' ? ` (${leads.length})` : ` (${leads.filter((l) => l.status === st).length})`}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e172a] hover:bg-[#162544] text-slate-300 text-xs font-semibold border border-[#1e2f4e] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead Manually</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-[#0c1527] border border-[#192843] rounded-2xl p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, category, or city..."
              className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="score">Opportunity Score</option>
              <option value="rating">Google Rating</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        </div>

        {/* Leads Table / Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-300">Loading your leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center bg-[#0c1527] border border-[#192843] rounded-2xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No prospects match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Save businesses from Opportunity Finder or create one manually with the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-[#0c1527] border border-[#192843] rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-950/20"
              >
                <div>
                  {/* Top: Score & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                      Score {lead.opportunityScore}
                    </span>

                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className="bg-[#091120] border border-[#1e2f4e] text-[11px] rounded-lg px-2 py-1 text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Converted">Converted</option>
                      <option value="Not interested">Not interested</option>
                    </select>
                  </div>

                  {/* Name & Category */}
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-400">{lead.category}</span>
                    {lead.cms && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#12233f] text-cyan-300 border border-cyan-500/30 font-medium">
                        {lead.cms}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">{lead.address}</p>

                  {/* Contact Info */}
                  <div className="mt-3 pt-3 border-t border-[#162238] space-y-1.5 text-xs text-slate-300">
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.website ? (
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {lead.website.replace('https://', '')}
                        </a>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-400 font-medium">
                        No official website detected
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#162238] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPitchLead(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                      title="Generate AI sales message"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Pitch</span>
                    </button>

                    <button
                      onClick={() => setActiveLead(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#14213d] hover:bg-[#1c2e52] text-slate-200 text-xs font-semibold border border-[#23385e] transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Notes</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Remove lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1324] border border-[#1e2f4e] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Add Lead Manually</h2>
            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category / Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Barber, Lawyer, Contractor"
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. 124 Main St, Austin, TX"
                  value={manualForm.address}
                  onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Website URL (leave empty if none)</label>
                <input
                  type="text"
                  value={manualForm.website}
                  onChange={(e) => setManualForm({ ...manualForm, website: e.target.value })}
                  className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#18263f]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail / Notes Drawer */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1324] border border-[#1e2f4e] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#18263f] pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{activeLead.name}</h2>
                <p className="text-xs text-slate-400">{activeLead.category} · Score {activeLead.opportunityScore}</p>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Prospect Notes & Activity History
                </label>
                <div className="space-y-2">
                  {activeLead.notes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
                  ) : (
                    activeLead.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#080e1b] border border-[#1a2842] text-xs text-slate-300"
                      >
                        {note}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Note Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a new note or call log..."
                  className="flex-1 bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Pitch Modal */}
      {pitchLead && (
        <PitchModal
          business={{
            id: pitchLead.id,
            name: pitchLead.name,
            category: pitchLead.category,
            address: pitchLead.address,
            phone: pitchLead.phone,
            rating: pitchLead.googleRating,
            reviewCount: pitchLead.reviewCount,
            googleMapsUrl: pitchLead.googleMapsUrl || '',
            website: pitchLead.website,
            websiteStatus: pitchLead.website ? 'verified' : 'no_website',
            onlinePresence: {} as any,
            opportunityScore: pitchLead.opportunityScore,
            opportunityTier: 'HIGH OPPORTUNITY',
            analysisPoints: pitchLead.notes,
            recommendedServices: pitchLead.recommendedServices || 'Website Design & Development',
            suggestedSalesAngle: 'Lead capture & bookings',
          }}
          isOpen={Boolean(pitchLead)}
          onClose={() => setPitchLead(null)}
          onSaveToLead={(pitch) => {
            const updated = [pitch, ...(pitchLead.pitches || [])];
            handleUpdateStatus(pitchLead.id, 'Contacted');
          }}
        />
      )}
    </div>
  );
}

