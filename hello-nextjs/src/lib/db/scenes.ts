import { createClient } from '@/lib/supabase/server';
import type { Scene, Image, Video, SceneWithMedia } from '@/types/database';

export class SceneError extends Error {
  constructor(
    message: string,
    public code: 'not_found' | 'unauthorized' | 'database_error'
  ) {
    super(message);
    this.name = 'SceneError';
  }
}

export async function createScenes(
  projectId: string,
  scenes: { order_index: number; description: string }[]
): Promise<Scene[]> {
  const supabase = await createClient();

  const scenesToInsert = scenes.map((scene) => ({
    project_id: projectId,
    order_index: scene.order_index,
    description: scene.description,
    description_confirmed: false,
    image_status: 'pending' as const,
    image_confirmed: false,
    video_status: 'pending' as const,
    video_confirmed: false,
  }));

  const { data, error } = await supabase.from('scenes').insert(scenesToInsert as never).select();

  if (error) {
    throw new SceneError(`Failed to create scenes: ${error.message}`, 'database_error');
  }

  return (data || []) as Scene[];
}

export async function getScenesByProjectId(projectId: string): Promise<Scene[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new SceneError(`Failed to get scenes: ${error.message}`, 'database_error');
  }

  return (data || []) as Scene[];
}

export async function getScenesWithMediaByProjectId(projectId: string): Promise<SceneWithMedia[]> {
  const supabase = await createClient();

  const { data: scenes, error: scenesError } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (scenesError) {
    throw new SceneError(`Failed to get scenes: ${scenesError.message}`, 'database_error');
  }

  const scenesWithMedia: SceneWithMedia[] = await Promise.all(
    (scenes || []).map(async (scene) => {
      const sceneData = scene as Scene;
      const [imagesResult, videosResult] = await Promise.all([
        supabase.from('images').select('*').eq('scene_id', sceneData.id).order('version', { ascending: false }),
        supabase.from('videos').select('*').eq('scene_id', sceneData.id).order('version', { ascending: false }),
      ]);

      return {
        ...sceneData,
        images: (imagesResult.data || []) as Image[],
        videos: (videosResult.data || []) as Video[],
      };
    })
  );

  return scenesWithMedia;
}

export async function getSceneById(sceneId: string): Promise<Scene> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('scenes').select('*').eq('id', sceneId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new SceneError('Scene not found', 'not_found');
    }
    throw new SceneError(`Failed to get scene: ${error.message}`, 'database_error');
  }

  return data as Scene;
}

export async function updateSceneDescription(
  sceneId: string,
  description: string
): Promise<Scene> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scenes')
    .update({ description } as never)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    throw new SceneError(`Failed to update scene description: ${error.message}`, 'database_error');
  }

  return data as Scene;
}

export async function confirmSceneDescription(sceneId: string): Promise<Scene> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scenes')
    .update({ description_confirmed: true } as never)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    throw new SceneError(`Failed to confirm scene description: ${error.message}`, 'database_error');
  }

  return data as Scene;
}

export async function confirmAllDescriptions(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ description_confirmed: true } as never)
    .eq('project_id', projectId);

  if (error) {
    throw new SceneError(`Failed to confirm all descriptions: ${error.message}`, 'database_error');
  }
}

export async function confirmSceneImage(sceneId: string): Promise<Scene> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scenes')
    .update({ image_confirmed: true } as never)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    throw new SceneError(`Failed to confirm scene image: ${error.message}`, 'database_error');
  }

  return data as Scene;
}

export async function confirmAllImages(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ image_confirmed: true } as never)
    .eq('project_id', projectId)
    .eq('image_status', 'completed');

  if (error) {
    throw new SceneError(`Failed to confirm all images: ${error.message}`, 'database_error');
  }
}

export async function confirmSceneVideo(sceneId: string): Promise<Scene> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scenes')
    .update({ video_confirmed: true } as never)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    throw new SceneError(`Failed to confirm scene video: ${error.message}`, 'database_error');
  }

  return data as Scene;
}

export async function confirmAllVideos(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ video_confirmed: true } as never)
    .eq('project_id', projectId)
    .eq('video_status', 'completed');

  if (error) {
    throw new SceneError(`Failed to confirm all videos: ${error.message}`, 'database_error');
  }
}

export async function updateSceneImageStatus(
  sceneId: string,
  status: Scene['image_status']
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('scenes').update({ image_status: status } as never).eq('id', sceneId);

  if (error) {
    throw new SceneError(`Failed to update image status: ${error.message}`, 'database_error');
  }
}

export async function updateSceneVideoStatus(
  sceneId: string,
  status: Scene['video_status']
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('scenes').update({ video_status: status } as never).eq('id', sceneId);

  if (error) {
    throw new SceneError(`Failed to update video status: ${error.message}`, 'database_error');
  }
}

export async function resetSceneImageStatus(sceneId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ image_status: 'pending', image_confirmed: false } as never)
    .eq('id', sceneId);

  if (error) {
    throw new SceneError(`Failed to reset image status: ${error.message}`, 'database_error');
  }
}

export async function resetSceneVideoStatus(sceneId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scenes')
    .update({ video_status: 'pending', video_confirmed: false } as never)
    .eq('id', sceneId);

  if (error) {
    throw new SceneError(`Failed to reset video status: ${error.message}`, 'database_error');
  }
}

export async function deleteScenesByProjectId(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('scenes').delete().eq('project_id', projectId);

  if (error) {
    throw new SceneError(`Failed to delete scenes: ${error.message}`, 'database_error');
  }
}

export async function getConfirmedDescriptionCount(projectId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('scenes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('description_confirmed', true);

  if (error) {
    throw new SceneError(`Failed to get count: ${error.message}`, 'database_error');
  }

  return count || 0;
}

export async function getCompletedImageCount(projectId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('scenes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('image_status', 'completed');

  if (error) {
    throw new SceneError(`Failed to get count: ${error.message}`, 'database_error');
  }

  return count || 0;
}

export async function getCompletedVideoCount(projectId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('scenes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('video_status', 'completed');

  if (error) {
    throw new SceneError(`Failed to get count: ${error.message}`, 'database_error');
  }

  return count || 0;
}
