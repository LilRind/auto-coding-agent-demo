'use client';

import { useState, useCallback } from 'react';
import { SceneVideoCard } from './SceneVideoCard';
import type { SceneWithMedia } from '@/types/database';

interface SceneVideoListProps {
  projectId: string;
  scenes: SceneWithMedia[];
  onRefresh: () => void;
}

export function SceneVideoList({
  projectId,
  scenes,
  onRefresh,
}: SceneVideoListProps) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);

  const handleGenerate = useCallback(
    async (sceneId: string) => {
      const response = await fetch(`/api/generate/video/scene/${sceneId}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        return { taskId: data.taskId, videoId: data.videoId };
      }
      return null;
    },
    []
  );

  const handleConfirm = useCallback(async (sceneId: string) => {
    const response = await fetch(`/api/scenes/${sceneId}/confirm-video`, {
      method: 'POST',
    });
    if (response.ok) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleCheckStatus = useCallback(
    async (taskId: string, videoId: string) => {
      const scene = scenes.find((s) =>
        s.videos.some((v) => v.id === videoId)
      );
      if (!scene) return;

      const response = await fetch(
        `/api/generate/video/task/${taskId}?sceneId=${scene.id}&projectId=${projectId}&videoId=${videoId}`
      );
      if (response.ok) {
        onRefresh();
      }
    },
    [scenes, projectId, onRefresh]
  );

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      await fetch('/api/generate/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      onRefresh();
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleConfirmAll = async () => {
    setConfirmingAll(true);
    try {
      await fetch('/api/scenes/confirm-all-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      onRefresh();
    } finally {
      setConfirmingAll(false);
    }
  };

  const allConfirmed = scenes.every((s) => s.video_confirmed);
  const completedCount = scenes.filter((s) => s.video_status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          视频生成 ({completedCount}/{scenes.length})
        </h2>
        {!allConfirmed && (
          <button
            onClick={handleGenerateAll}
            disabled={generatingAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg"
          >
            {generatingAll ? '生成中...' : '生成所有视频'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <SceneVideoCard
            key={scene.id}
            scene={scene}
            onGenerate={handleGenerate}
            onConfirm={handleConfirm}
            onCheckStatus={handleCheckStatus}
          />
        ))}
      </div>

      {!allConfirmed && completedCount === scenes.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleConfirmAll}
            disabled={confirmingAll}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg"
          >
            {confirmingAll ? '确认中...' : '确认所有视频'}
          </button>
        </div>
      )}
    </div>
  );
}
