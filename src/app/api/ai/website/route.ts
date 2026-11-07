import { NextRequest, NextResponse } from 'next/server';
import { generateWebsiteDraft, modifyWebsiteWithAi } from '@/lib/ai-service';
import { db } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const site = db.getWebsiteById(id, userId);
      if (!site) return NextResponse.json({ error: 'Website project not found' }, { status: 404 });
      return NextResponse.json({ success: true, website: site });
    }

    const sites = db.getWebsites(userId);
    return NextResponse.json({ success: true, total: sites.length, websites: sites });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch websites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const body = await req.json();
    const { action = 'generate' } = body;

    if (action === 'generate') {
      const { businessName, industry, description, style = 'modern', targetAudience, primaryColor } = body;

      if (!businessName || !industry) {
        return NextResponse.json({ error: 'Business name and industry are required.' }, { status: 400 });
      }

      const project = await generateWebsiteDraft({
        businessName,
        industry,
        description: description || '',
        style,
        targetAudience,
        primaryColor,
      });

      project.userId = userId;
      db.saveWebsite(project, userId);
      db.incrementAiOpsCount();
      db.addActivity(
        'AI Website Created',
        `Generated complete multi-page responsive website draft for "${businessName}"`,
        'website',
        userId
      );

      return NextResponse.json({ success: true, website: project });
    }

    if (action === 'modify') {
      const { project, prompt } = body;
      if (!project || !prompt) {
        return NextResponse.json({ error: 'Project and editing prompt are required.' }, { status: 400 });
      }

      const { updatedProject, summary } = modifyWebsiteWithAi(project, prompt);
      updatedProject.userId = userId;
      db.saveWebsite(updatedProject, userId);
      db.incrementAiOpsCount();
      db.addActivity(
        'AI Website Edit',
        `AI Assistant: ${summary}`,
        'website',
        userId
      );

      return NextResponse.json({ success: true, website: updatedProject, summary });
    }

    if (action === 'save') {
      const { project } = body;
      if (!project) return NextResponse.json({ error: 'Project data is required.' }, { status: 400 });
      project.userId = userId;
      db.saveWebsite(project, userId);
      return NextResponse.json({ success: true, website: project });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Website operation failed' }, { status: 500 });
  }
}
