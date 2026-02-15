'use client';

import { useState } from 'react';
import { SceneImageCard } from './SceneImageCard';
import type { SceneWithMedia } from '@/types/database';

interface SceneImageListProps {
  projectId: string;
  scenes: SceneWithMedia[];
  onRefresh: () => void;
}

export function SceneImageList({
  projectId,
  scenes,
  onRefresh,
}: SceneImageListProps) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);

  const handleGenerate = async (sceneId: string) => {
    const response = await fetch(`/api/generate/image/${sceneId}`, {
      method: 'POST',
    });
    if (response.ok) {
      onRefresh();
    }
  };

  const handleConfirm = async (sceneId: string) => {
    const response = await fetch(`/api/scenes/${sceneId}/confirm-image`, {
      method: 'POST',
    });
    if (response.ok) {
      onRefresh();
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    try {
      await fetch('/api/generate/images', {
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
      await fetch('/api/scenes/confirm-all-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      onRefresh();
    } finally {
      setConfirmingAll(false);
    }
  };

  const allConfirmed = scenes.every((s) => s.image_confirmed);
  const completedCount = scenes.filter((s) => s.image_status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          图片生成 ({completedCount}/{scenes.length})
        </h2>
        {!allConfirmed && (
          <button
            onClick={handleGenerateAll}
            disabled={generatingAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg"
          >
            {generatingAll ? '生成中...' : '生成所有图片'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <SceneImageCard
            key={scene.id}
            scene={scene}
            onGenerate={handleGenerate}
            onConfirm={handleConfirm}
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
            {confirmingAll ? '确认中...' : '确认所有图片'}
          </button>
        </div>
      )}
    </div>
  );
}
