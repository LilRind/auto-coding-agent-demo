'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SceneWithMedia } from '@/types/database';

interface SceneImageCardProps {
  scene: SceneWithMedia;
  onGenerate: (sceneId: string) => Promise<void>;
  onConfirm: (sceneId: string) => Promise<void>;
}

const statusLabels: Record<string, string> = {
  pending: '待生成',
  processing: '生成中',
  completed: '已完成',
  failed: '失败',
};

const statusColors: Record<string, string> = {
  pending: 'text-gray-400',
  processing: 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

export function SceneImageCard({
  scene,
  onGenerate,
  onConfirm,
}: SceneImageCardProps) {
  const [loading, setLoading] = useState(false);
  const latestImage = scene.images[0];

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerate(scene.id);
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
        'bg-gray-800 rounded-lg overflow-hidden',
        scene.image_confirmed && 'border-2 border-green-600'
      )}
    >
      <div className="aspect-video relative bg-gray-900">
        {latestImage ? (
          <Image
            src={latestImage.url}
            alt={`分镜 ${scene.order_index}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {scene.image_status === 'processing' ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <span>等待生成</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">分镜 {scene.order_index}</span>
          <span className={cn('text-xs', statusColors[scene.image_status])}>
            {statusLabels[scene.image_status]}
          </span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{scene.description}</p>

        <div className="flex gap-2">
          {scene.image_status !== 'processing' && !scene.image_confirmed && (
            <>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded text-sm"
              >
                {scene.image_status === 'failed' ? '重试' : latestImage ? '重新生成' : '生成'}
              </button>
              {scene.image_status === 'completed' && (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded text-sm"
                >
                  确认
                </button>
              )}
            </>
          )}
          {scene.image_confirmed && (
            <span className="text-green-500 text-sm">✓ 已确认</span>
          )}
        </div>
      </div>
    </div>
  );
}
