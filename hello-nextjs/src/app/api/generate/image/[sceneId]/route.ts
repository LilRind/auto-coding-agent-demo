import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, ProjectError } from '@/lib/db/projects';
import { getSceneById, updateSceneImageStatus, SceneError } from '@/lib/db/scenes';
import { createImage, deleteImagesBySceneId, downloadAndUpload } from '@/lib/db/media';
import { generateImageBuffer } from '@/lib/ai/volc-image';
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

    if (!scene.description_confirmed) {
      return NextResponse.json({ error: 'Scene description must be confirmed first' }, { status: 400 });
    }

    const project = await getProjectById(scene.project_id, user.id);

    await updateSceneImageStatus(sceneId, 'processing');

    try {
      const imageBuffer = await generateImageBuffer(scene.description, project.style as VideoStyle);

      const fileName = `scene-${scene.order_index}-${Date.now()}.png`;
      const { path, url } = await downloadAndUpload(
        `data:image/png;base64,${imageBuffer.toString('base64')}`,
        user.id,
        scene.project_id,
        fileName,
        'image/png'
      );

      await deleteImagesBySceneId(sceneId);

      await createImage(sceneId, path, url);

      await updateSceneImageStatus(sceneId, 'completed');

      return NextResponse.json({ success: true, url });
    } catch (genError) {
      await updateSceneImageStatus(sceneId, 'failed');
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
        return NextResponse.json({ error: 'Image service not configured' }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
