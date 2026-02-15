import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProjectStage, ProjectError } from '@/lib/db/projects';
import { confirmAllVideos, getScenesByProjectId } from '@/lib/db/scenes';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await getProjectById(projectId, user.id);
    await confirmAllVideos(projectId);

    const scenes = await getScenesByProjectId(projectId);
    const allConfirmed = scenes.every(
      (s) => s.description_confirmed && s.image_confirmed && s.video_confirmed
    );

    if (allConfirmed && scenes.length > 0) {
      await updateProjectStage(projectId, user.id, 'completed');
    }

    return NextResponse.json({ success: true, completed: allConfirmed });
  } catch (error) {
    if (error instanceof ProjectError) {
      if (error.code === 'not_found') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (error.code === 'unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
