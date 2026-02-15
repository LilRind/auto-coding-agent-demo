import { createClient } from '@/lib/supabase/server';
import type {
  Project,
  ProjectUpdate,
  ProjectWithScenes,
  SceneWithMedia,
  Scene,
  Image,
  Video,
} from '@/types/database';

export class ProjectError extends Error {
  constructor(
    message: string,
    public code: 'not_found' | 'unauthorized' | 'database_error'
  ) {
    super(message);
    this.name = 'ProjectError';
  }
}

export async function createProject(
  userId: string,
  title: string,
  story: string,
  style: string = 'realistic'
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title,
      story,
      style,
      stage: 'draft',
    } as never)
    .select()
    .single();

  if (error) {
    throw new ProjectError(`Failed to create project: ${error.message}`, 'database_error');
  }

  return data as Project;
}

export async function getProjects(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ projects: Project[]; total: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  const [{ data: projects, error: projectsError }, { count, error: countError }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + pageSize - 1),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  if (projectsError || countError) {
    throw new ProjectError(
      `Failed to get projects: ${projectsError?.message || countError?.message}`,
      'database_error'
    );
  }

  return { projects: (projects || []) as Project[], total: count || 0 };
}

export async function getProjectById(
  projectId: string,
  userId: string
): Promise<ProjectWithScenes> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError) {
    if (projectError.code === 'PGRST116') {
      throw new ProjectError('Project not found', 'not_found');
    }
    throw new ProjectError(`Failed to get project: ${projectError.message}`, 'database_error');
  }

  const projectData = project as Project;

  if (projectData.user_id !== userId) {
    throw new ProjectError('Unauthorized access to project', 'unauthorized');
  }

  const { data: scenes, error: scenesError } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (scenesError) {
    throw new ProjectError(`Failed to get scenes: ${scenesError.message}`, 'database_error');
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

  return {
    ...projectData,
    scenes: scenesWithMedia,
  };
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: ProjectUpdate
): Promise<Project> {
  const supabase = await createClient();

  await isProjectOwner(projectId, userId, supabase);

  const { data, error } = await supabase
    .from('projects')
    .update(updates as never)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new ProjectError(`Failed to update project: ${error.message}`, 'database_error');
  }

  return data as Project;
}

export async function updateProjectStage(
  projectId: string,
  userId: string,
  stage: Project['stage']
): Promise<Project> {
  return updateProject(projectId, userId, { stage });
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  await isProjectOwner(projectId, userId, supabase);

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    throw new ProjectError(`Failed to delete project: ${error.message}`, 'database_error');
  }
}

async function isProjectOwner(
  projectId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  const { data, error } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ProjectError('Project not found', 'not_found');
    }
    throw new ProjectError(`Database error: ${error.message}`, 'database_error');
  }

  const projectData = data as { user_id: string };

  if (projectData.user_id !== userId) {
    throw new ProjectError('Unauthorized access to project', 'unauthorized');
  }
}
