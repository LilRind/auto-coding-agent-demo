import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProjectStage, ProjectError } from '@/lib/db/projects';
import { getScenesByProjectId, updateSceneImageStatus } from '@/lib/db/scenes';
import { createImage, deleteImagesBySceneId, downloadAndUpload } from '@/lib/db/media';
import { generateImageBuffer } from '@/lib/ai/volc-image';
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
      (s) => s.description_confirmed && s.image_status === 'pending'
    );

    if (scenesToGenerate.length === 0) {
      return NextResponse.json({ message: 'No scenes to generate', generated: 0 });
    }

    let generated = 0;
    let failed = 0;

    for (const scene of scenesToGenerate) {
      await updateSceneImageStatus(scene.id, 'processing');

      try {
        const imageBuffer = await generateImageBuffer(scene.description, project.style as VideoStyle);

        const fileName = `scene-${scene.order_index}-${Date.now()}.png`;
        const { path, url } = await downloadAndUpload(
          `data:image/png;base64,${imageBuffer.toString('base64')}`,
          user.id,
          projectId,
          fileName,
          'image/png'
        );

        await deleteImagesBySceneId(scene.id);
        await createImage(scene.id, path, url);
        await updateSceneImageStatus(scene.id, 'completed');
        generated++;
      } catch {
        await updateSceneImageStatus(scene.id, 'failed');
        failed++;
      }
    }

    await updateProjectStage(projectId, user.id, 'images');

    return NextResponse.json({ generated, failed, total: scenesToGenerate.length });
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
        return NextResponse.json({ error: 'Image service not configured' }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
