'use client';

import React, { useState } from 'react';

interface SiteContactFormProps {
  primaryColor: string;
}

export default function SiteContactForm({ primaryColor }: SiteContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
        <p className="font-bold text-sm text-emerald-400">Appointment Request Received!</p>
        <p className="text-xs text-slate-300">
          Thank you for reaching out. A team member will confirm your reservation shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Your Name</label>
        <input
          type="text"
          required
          placeholder="John Doe"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Phone or Email</label>
        <input
          type="text"
          required
          placeholder="john@example.com"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Message</label>
        <textarea
          rows={3}
          required
          placeholder="I'd like to book an appointment..."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 transition-transform active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        Send Message & Reserve
      </button>
    </form>
  );
}

