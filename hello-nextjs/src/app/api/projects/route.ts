import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProject, getProjects, ProjectError } from '@/lib/db/projects';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  try {
    const { projects, total } = await getProjects(user.id, page, pageSize);
    return NextResponse.json({ projects, total, page, pageSize });
  } catch (error) {
    if (error instanceof ProjectError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { title, story, style } = body;

    if (!title || !story) {
      return NextResponse.json({ error: 'Title and story are required' }, { status: 400 });
    }

    const project = await createProject(user.id, title, story, style || 'realistic');
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof ProjectError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
