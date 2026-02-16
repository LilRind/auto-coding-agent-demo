import { createClient } from '@/lib/supabase/server';
import type { Image, Video } from '@/types/database';

export class MediaError extends Error {
  constructor(
    message: string,
    public code: 'not_found' | 'unauthorized' | 'storage_error' | 'database_error'
  ) {
    super(message);
    this.name = 'MediaError';
  }
}

const BUCKET_NAME = 'project-media';

export async function createImage(
  sceneId: string,
  storagePath: string,
  url: string,
  width?: number,
  height?: number
): Promise<Image> {
  const supabase = await createClient();

  const { data: existingImages } = await supabase
    .from('images')
    .select('version')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = ((existingImages?.[0] as { version: number } | undefined)?.version || 0) + 1;

  const { data, error } = await supabase
    .from('images')
    .insert({
      scene_id: sceneId,
      storage_path: storagePath,
      url,
      width: width || null,
      height: height || null,
      version: nextVersion,
    } as never)
    .select()
    .single();

  if (error) {
    throw new MediaError(`Failed to create image: ${error.message}`, 'database_error');
  }

  return data as Image;
}

export async function createVideo(
  sceneId: string,
  storagePath: string,
  url: string,
  duration?: number,
  taskId?: string
): Promise<Video> {
  const supabase = await createClient();

  const { data: existingVideos } = await supabase
    .from('videos')
    .select('version')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = ((existingVideos?.[0] as { version: number } | undefined)?.version || 0) + 1;

  const { data, error } = await supabase
    .from('videos')
    .insert({
      scene_id: sceneId,
      storage_path: storagePath,
      url,
      duration: duration || null,
      task_id: taskId || null,
      version: nextVersion,
    } as never)
    .select()
    .single();

  if (error) {
    throw new MediaError(`Failed to create video: ${error.message}`, 'database_error');
  }

  return data as Video;
}

export async function updateVideoTaskId(videoId: string, taskId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('videos').update({ task_id: taskId } as never).eq('id', videoId);

  if (error) {
    throw new MediaError(`Failed to update video task ID: ${error.message}`, 'database_error');
  }
}

export async function getImagesBySceneId(sceneId: string): Promise<Image[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false });

  if (error) {
    throw new MediaError(`Failed to get images: ${error.message}`, 'database_error');
  }

  return (data || []) as Image[];
}

export async function getLatestImageBySceneId(sceneId: string): Promise<Image | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new MediaError(`Failed to get latest image: ${error.message}`, 'database_error');
  }

  return data as Image;
}

export async function getVideosBySceneId(sceneId: string): Promise<Video[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false });

  if (error) {
    throw new MediaError(`Failed to get videos: ${error.message}`, 'database_error');
  }

  return (data || []) as Video[];
}

export async function getLatestVideoBySceneId(sceneId: string): Promise<Video | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new MediaError(`Failed to get latest video: ${error.message}`, 'database_error');
  }

  return data as Video;
}

export async function getVideoById(videoId: string): Promise<Video> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('videos').select('*').eq('id', videoId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new MediaError('Video not found', 'not_found');
    }
    throw new MediaError(`Failed to get video: ${error.message}`, 'database_error');
  }

  return data as Video;
}

export async function uploadFile(
  userId: string,
  projectId: string,
  fileName: string,
  file: File | Buffer,
  contentType: string
): Promise<{ path: string; url: string }> {
  const supabase = await createClient();
  const path = `${userId}/${projectId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw new MediaError(`Failed to upload file: ${uploadError.message}`, 'storage_error');
  }

  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error) {
    throw new MediaError(`Failed to create signed URL: ${error.message}`, 'storage_error');
  }
  return { path, url: data.signedUrl };
}

export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresIn);

  if (error) {
    throw new MediaError(`Failed to create signed URL: ${error.message}`, 'storage_error');
  }

  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new MediaError(`Failed to delete file: ${error.message}`, 'storage_error');
  }
}

export async function deleteImagesBySceneId(sceneId: string): Promise<void> {
  const supabase = await createClient();

  const { data: images, error: fetchError } = await supabase
    .from('images')
    .select('storage_path')
    .eq('scene_id', sceneId);

  if (fetchError) {
    throw new MediaError(`Failed to fetch images: ${fetchError.message}`, 'database_error');
  }

  if (images && images.length > 0) {
    const paths = (images as { storage_path: string }[]).map((img) => img.storage_path);
    await supabase.storage.from(BUCKET_NAME).remove(paths);
  }

  const { error: deleteError } = await supabase.from('images').delete().eq('scene_id', sceneId);

  if (deleteError) {
    throw new MediaError(`Failed to delete images: ${deleteError.message}`, 'database_error');
  }
}

export async function deleteVideosBySceneId(sceneId: string): Promise<void> {
  const supabase = await createClient();

  const { data: videos, error: fetchError } = await supabase
    .from('videos')
    .select('storage_path')
    .eq('scene_id', sceneId);

  if (fetchError) {
    throw new MediaError(`Failed to fetch videos: ${fetchError.message}`, 'database_error');
  }

  if (videos && videos.length > 0) {
    const paths = (videos as { storage_path: string }[]).map((vid) => vid.storage_path);
    await supabase.storage.from(BUCKET_NAME).remove(paths);
  }

  const { error: deleteError } = await supabase.from('videos').delete().eq('scene_id', sceneId);

  if (deleteError) {
    throw new MediaError(`Failed to delete videos: ${deleteError.message}`, 'database_error');
  }
}

export async function downloadAndUpload(
  url: string,
  userId: string,
  projectId: string,
  fileName: string,
  contentType: string
): Promise<{ path: string; url: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new MediaError(`Failed to download from URL: ${response.status}`, 'storage_error');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadFile(userId, projectId, fileName, buffer, contentType);
}

export async function getMediaBySceneId(
  sceneId: string
): Promise<{ images: Image[]; videos: Video[] }> {
  const [images, videos] = await Promise.all([
    getImagesBySceneId(sceneId),
    getVideosBySceneId(sceneId),
  ]);

  return { images, videos };
}
