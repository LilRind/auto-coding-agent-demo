'use client';

import { useState, useCallback } from 'react';
import { StageIndicator } from '@/components/project/StageIndicator';
import { SceneDescriptionList } from '@/components/scene/SceneDescriptionList';
import { SceneImageList } from '@/components/scene/SceneImageList';
import { SceneVideoList } from '@/components/scene/SceneVideoList';
import Link from 'next/link';
import type { ProjectWithScenes, SceneWithMedia } from '@/types/database';

interface ProjectDetailContentProps {
  project: ProjectWithScenes;
}

export function ProjectDetailContent({ project: initialProject }: ProjectDetailContentProps) {
  const [project, setProject] = useState(initialProject);

  const refreshProject = useCallback(async () => {
    const response = await fetch(`/api/projects/${project.id}`);
    if (response.ok) {
      const data = await response.json();
      setProject(data);
    }
  }, [project.id]);

  const handleGenerateScenes = async () => {
    const response = await fetch('/api/generate/scenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    });
    if (response.ok) {
      refreshProject();
    }
  };

  const scenesWithMedia: SceneWithMedia[] = project.scenes.map((scene) => ({
    ...scene,
    images: scene.images || [],
    videos: scene.videos || [],
  }));

  const renderStageContent = () => {
    switch (project.stage) {
      case 'draft':
        return (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">故事已创建，点击下方按钮开始生成分镜描述</p>
            <button
              onClick={handleGenerateScenes}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-medium"
            >
              生成分镜
            </button>
          </div>
        );

      case 'scenes':
        return (
          <SceneDescriptionList
            projectId={project.id}
            scenes={project.scenes}
            onRefresh={refreshProject}
          />
        );

      case 'images':
        return (
          <SceneImageList
            projectId={project.id}
            scenes={scenesWithMedia}
            onRefresh={refreshProject}
          />
        );

      case 'videos':
        return (
          <SceneVideoList
            projectId={project.id}
            scenes={scenesWithMedia}
            onRefresh={refreshProject}
          />
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">项目已完成!</h2>
              <p className="text-gray-400">
                完成时间: {new Date(project.updated_at).toLocaleString('zh-CN')}
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-4">视频预览</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenesWithMedia.map((scene) => {
                const latestVideo = scene.videos[0];
                return (
                  <div
                    key={scene.id}
                    className="bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video relative bg-gray-900">
                      {latestVideo?.url ? (
                        <video
                          src={latestVideo.url}
                          className="w-full h-full object-cover"
                          controls
                          muted
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          无视频
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">分镜 {scene.order_index}</span>
                        {latestVideo?.url && (
                          <a
                            href={latestVideo.url}
                            download
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            下载
                          </a>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{scene.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <StageIndicator currentStage={project.stage} />
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {renderStageContent()}
      </div>
    </div>
  );
}
