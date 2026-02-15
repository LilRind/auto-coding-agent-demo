'use client';

import { useState } from 'react';
import { SceneDescriptionCard } from './SceneDescriptionCard';
import type { Scene } from '@/types/database';

interface SceneDescriptionListProps {
  projectId: string;
  scenes: Scene[];
  onRefresh: () => void;
}

export function SceneDescriptionList({
  projectId,
  scenes,
  onRefresh,
}: SceneDescriptionListProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);

  const handleConfirm = async (sceneId: string) => {
    const response = await fetch(`/api/scenes/${sceneId}/confirm-description`, {
      method: 'POST',
    });
    if (response.ok) {
      onRefresh();
    }
  };

  const handleUpdate = async (sceneId: string, description: string) => {
    const response = await fetch(`/api/scenes/${sceneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    if (response.ok) {
      onRefresh();
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch('/api/generate/scenes/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      if (response.ok) {
        onRefresh();
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleConfirmAll = async () => {
    setConfirmingAll(true);
    try {
      const response = await fetch('/api/scenes/confirm-all-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      if (response.ok) {
        onRefresh();
      }
    } finally {
      setConfirmingAll(false);
    }
  };

  const allConfirmed = scenes.every((s) => s.description_confirmed);
  const confirmedCount = scenes.filter((s) => s.description_confirmed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          分镜描述 ({confirmedCount}/{scenes.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.map((scene) => (
          <SceneDescriptionCard
            key={scene.id}
            scene={scene}
            onConfirm={handleConfirm}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg"
        >
          {regenerating ? '重新生成中...' : '重新生成分镜'}
        </button>
        {!allConfirmed && (
          <button
            onClick={handleConfirmAll}
            disabled={confirmingAll}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg"
          >
            {confirmingAll ? '确认中...' : '确认所有分镜'}
          </button>
        )}
      </div>
    </div>
  );
}
