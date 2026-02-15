import Link from 'next/link';
import type { Project } from '@/types/database';

interface ProjectCardProps {
  project: Project;
}

const stageLabels: Record<string, string> = {
  draft: '草稿',
  scenes: '分镜',
  images: '图片',
  videos: '视频',
  completed: '已完成',
};

const stageColors: Record<string, string> = {
  draft: 'bg-gray-600',
  scenes: 'bg-blue-600',
  images: 'bg-yellow-600',
  videos: 'bg-purple-600',
  completed: 'bg-green-600',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold truncate flex-1">{project.title}</h3>
          <span className={`px-2 py-1 rounded text-xs ${stageColors[project.stage]}`}>
            {stageLabels[project.stage]}
          </span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{project.story}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>风格: {project.style}</span>
          <span>{new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </Link>
  );
}
