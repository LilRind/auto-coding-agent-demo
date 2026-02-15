import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, ProjectError } from '@/lib/db/projects';
import { getSceneById, updateSceneVideoStatus, SceneError } from '@/lib/db/scenes';
import { createVideo, getLatestImageBySceneId, getSignedUrl } from '@/lib/db/media';
import { createVideoTask } from '@/lib/ai/volc-video';
import type { VideoStyle } from '@/types/ai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sceneId } = await params;

  try {
    const scene = await getSceneById(sceneId);
    const project = await getProjectById(scene.project_id, user.id);

    const latestImage = await getLatestImageBySceneId(sceneId);
    if (!latestImage) {
      return NextResponse.json({ error: 'No image found for this scene' }, { status: 400 });
    }

    const signedUrl = await getSignedUrl(latestImage.storage_path);

    await updateSceneVideoStatus(sceneId, 'processing');

    try {
      const taskId = await createVideoTask(signedUrl, scene.description, project.style as VideoStyle);

      const video = await createVideo(sceneId, '', '', undefined, taskId);

      return NextResponse.json({ success: true, taskId, videoId: video.id });
    } catch (genError) {
      await updateSceneVideoStatus(sceneId, 'failed');
      throw genError;
    }
  } catch (error) {
    if (error instanceof SceneError) {
      if (error.code === 'not_found') {
        return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
      }
    }
    if (error instanceof ProjectError) {
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
