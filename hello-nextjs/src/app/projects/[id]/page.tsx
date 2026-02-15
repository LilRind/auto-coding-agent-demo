import { getProjectById, ProjectError } from '@/lib/db/projects';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ProjectDetailContent } from './ProjectDetailContent';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  let project;
  try {
    project = await getProjectById(id, user.id);
  } catch (error) {
    if (error instanceof ProjectError) {
      if (error.code === 'not_found' || error.code === 'unauthorized') {
        notFound();
      }
    }
    throw error;
  }

  return <ProjectDetailContent project={project} />;
}
