import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSceneById, confirmSceneImage, SceneError } from '@/lib/db/scenes';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const scene = await getSceneById(id);
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', scene.project_id)
      .single();

    if (!project || (project as { user_id: string }).user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (scene.image_status !== 'completed') {
      return NextResponse.json({ error: 'Image must be completed first' }, { status: 400 });
    }

    const updatedScene = await confirmSceneImage(id);
    return NextResponse.json(updatedScene);
  } catch (error) {
    if (error instanceof SceneError) {
      if (error.code === 'not_found') {
        return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
