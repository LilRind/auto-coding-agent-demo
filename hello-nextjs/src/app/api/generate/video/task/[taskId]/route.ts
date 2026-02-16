import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSceneById, updateSceneVideoStatus } from '@/lib/db/scenes';
import { downloadAndUpload } from '@/lib/db/media';
import { getVideoTaskStatus, downloadVideo } from '@/lib/ai/volc-video';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await params;
  const { searchParams } = new URL(request.url);
  const sceneId = searchParams.get('sceneId');
  const projectId = searchParams.get('projectId');
  const videoId = searchParams.get('videoId');

  if (!sceneId || !projectId || !videoId) {
    return NextResponse.json({ error: 'Missing sceneId, projectId, or videoId' }, { status: 400 });
  }

  try {
    const scene = await getSceneById(sceneId);

    const status = await getVideoTaskStatus(taskId);

    if (status.status === 'succeeded' && status.content?.video_url) {
      try {
        const videoBuffer = await downloadVideo(status.content.video_url);

        const fileName = `video-${scene.order_index}-${Date.now()}.mp4`;
        const { path, url } = await downloadAndUpload(
          `data:video/mp4;base64,${videoBuffer.toString('base64')}`,
          user.id,
          projectId,
          fileName,
          'video/mp4'
        );

        await supabase
          .from('videos')
          .update({ storage_path: path, url } as never)
          .eq('id', videoId);

        await updateSceneVideoStatus(sceneId, 'completed');

        return NextResponse.json({
          status: 'completed',
          url,
        });
      } catch (downloadErr) {
        console.error('Failed to download video:', downloadErr);
        await updateSceneVideoStatus(sceneId, 'failed');
        return NextResponse.json({ status: 'failed', error: 'Failed to download video' }, { status: 500 });
      }
    }

    if (status.status === 'failed') {
      await updateSceneVideoStatus(sceneId, 'failed');
      return NextResponse.json({ status: 'failed', error: status.error });
    }

    return NextResponse.json({ status: status.status });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
