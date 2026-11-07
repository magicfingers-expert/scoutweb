import { NextRequest, NextResponse } from 'next/server';
import { generateAiPitch } from '@/lib/ai-service';
import { db } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      business,
      channel = 'email',
      tone = 'professional',
      length = 'short',
      customInstructions,
      leadId,
    } = body;

    if (!business || !business.name) {
      return NextResponse.json({ error: 'Business details are required.' }, { status: 400 });
    }

    const pitch = await generateAiPitch({
      business,
      channel,
      tone,
      length,
      customInstructions,
    });

    db.incrementAiOpsCount();
    db.addActivity(
      'AI Pitch Generated',
      `Generated ${tone} ${channel} pitch for "${business.name}"`,
      'pitch'
    );

    // If linked to lead, save to lead's record
    if (leadId) {
      const lead = db.getLeadById(leadId);
      if (lead) {
        const pitches = lead.pitches || [];
        pitches.unshift(pitch);
        db.updateLead(leadId, { pitches });
      }
    }

    return NextResponse.json({
      success: true,
      pitch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Pitch generation failed' }, { status: 500 });
  }
}

