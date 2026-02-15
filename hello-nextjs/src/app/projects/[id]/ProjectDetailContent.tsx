'use client';

import { StageIndicator } from '@/components/project/StageIndicator';
import Link from 'next/link';
import type { ProjectWithScenes } from '@/types/database';

interface ProjectDetailContentProps {
  project: ProjectWithScenes;
}

export function ProjectDetailContent({ project }: ProjectDetailContentProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← 返回项目列表
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-400 text-sm mb-4">
          风格: {project.style} · 创建于{' '}
          {new Date(project.created_at).toLocaleDateString('zh-CN')}
        </p>
        <div className="bg-gray-900 rounded p-4">
          <p className="text-gray-300 whitespace-pre-wrap">{project.story}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <StageIndicator currentStage={project.stage} />
      </div>

      <div className="mt-6 text-center text-gray-400">
        {project.stage === 'draft' && '点击下方按钮开始生成分镜'}
        {project.stage === 'scenes' && `${project.scenes.length} 个分镜已生成`}
        {project.stage === 'images' && '图片生成中...'}
        {project.stage === 'videos' && '视频生成中...'}
        {project.stage === 'completed' && '项目已完成！'}
      </div>
    </div>
  );
}
