'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Scene } from '@/types/database';

interface SceneDescriptionCardProps {
  scene: Scene;
  onConfirm: (sceneId: string) => Promise<void>;
  onUpdate: (sceneId: string, description: string) => Promise<void>;
}

export function SceneDescriptionCard({
  scene,
  onConfirm,
  onUpdate,
}: SceneDescriptionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(scene.description);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (description === scene.description) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    await onUpdate(scene.id, description);
    setIsEditing(false);
    setLoading(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(scene.id);
    setLoading(false);
  };

  return (
    <div
      className={cn(
        'bg-gray-800 rounded-lg p-4',
        scene.description_confirmed && 'border-2 border-green-600'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">
          分镜 {scene.order_index}
        </span>
        {scene.description_confirmed && (
          <span className="text-green-500 text-sm">✓ 已确认</span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded text-sm"
            >
              保存
            </button>
            <button
              onClick={() => {
                setDescription(scene.description);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 text-sm mb-3">{scene.description}</p>
          <div className="flex gap-2">
            {!scene.description_confirmed && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded text-sm"
                >
                  确认
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
