import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProjectStage, ProjectError } from '@/lib/db/projects';
import { getScenesByProjectId, updateSceneVideoStatus } from '@/lib/db/scenes';
import { createVideo, getLatestImageBySceneId, getSignedUrl } from '@/lib/db/media';
import { createVideoTask } from '@/lib/ai/volc-video';
import type { VideoStyle } from '@/types/ai';

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
    const scenes = await getScenesByProjectId(projectId);

    const scenesToGenerate = scenes.filter(
      (s) => s.image_confirmed && s.video_status === 'pending'
    );

    if (scenesToGenerate.length === 0) {
      return NextResponse.json({ message: 'No scenes to generate', tasks: [] });
    }

    const tasks: { sceneId: string; taskId: string; videoId: string }[] = [];

    for (const scene of scenesToGenerate) {
      const latestImage = await getLatestImageBySceneId(scene.id);
      if (!latestImage) continue;

      const signedUrl = await getSignedUrl(latestImage.storage_path);

      await updateSceneVideoStatus(scene.id, 'processing');

      try {
        const taskId = await createVideoTask(signedUrl, scene.description, project.style as VideoStyle);
        const video = await createVideo(scene.id, '', '', undefined, taskId);

        tasks.push({ sceneId: scene.id, taskId, videoId: video.id });
      } catch {
        await updateSceneVideoStatus(scene.id, 'failed');
      }
    }

    await updateProjectStage(projectId, user.id, 'videos');

    return NextResponse.json({ tasks, total: tasks.length });
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
      if (error.message.includes('VOLC_API_KEY')) {
        return NextResponse.json({ error: 'Video service not configured' }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
