import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProjectStage, ProjectError } from '@/lib/db/projects';
import { createScenes, deleteScenesByProjectId } from '@/lib/db/scenes';
import { storyToScenes } from '@/lib/ai/zhipu';

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

    const project = await getProjectById(projectId, user.id);

    if (!project.story) {
      return NextResponse.json({ error: 'Project has no story content' }, { status: 400 });
    }

    const scenes = await storyToScenes(project.story, project.style);

    await deleteScenesByProjectId(projectId);

    const createdScenes = await createScenes(
      projectId,
      scenes.map((s) => ({
        order_index: s.order_index,
        description: s.description,
      }))
    );

    await updateProjectStage(projectId, user.id, 'scenes');

    return NextResponse.json({ scenes: createdScenes });
  } catch (error) {
    if (error instanceof ProjectError) {
      if (error.code === 'not_found') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (error.code === 'unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    if (error instanceof Error) {
      if (error.message.includes('ZHIPU_API_KEY')) {
        return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
