import { getProjects } from '@/lib/db/projects';
import { createClient } from '@/lib/supabase/server';
import { ProjectCard } from '@/components/project/ProjectCard';
import Link from 'next/link';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const { projects, total } = await getProjects(user.id, currentPage, 12);
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">我的项目</h1>
        <Link
          href="/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          创建新项目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">还没有任何项目</p>
          <Link
            href="/create"
            className="text-blue-400 hover:text-blue-300"
          >
            创建第一个项目
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/projects?page=${p}`}
                  className={`px-3 py-1 rounded ${
                    p === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
