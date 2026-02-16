'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SceneWithMedia } from '@/types/database';

interface SceneVideoCardProps {
  scene: SceneWithMedia;
  onGenerate: (sceneId: string) => Promise<{ taskId: string; videoId: string } | null>;
  onConfirm: (sceneId: string) => Promise<void>;
  onCheckStatus: (taskId: string, videoId: string) => Promise<void>;
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

export function SceneVideoCard({
  scene,
  onGenerate,
  onConfirm,
  onCheckStatus,
}: SceneVideoCardProps) {
  const [loading, setLoading] = useState(false);
  const latestImage = scene.images[0];
  const latestVideo = scene.videos[0];
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scene.video_status !== 'processing' || !latestVideo?.task_id) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const taskId = latestVideo.task_id;
    const videoId = latestVideo.id;

    intervalRef.current = setInterval(async () => {
      await onCheckStatus(taskId, videoId);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [scene.video_status, latestVideo?.task_id, latestVideo?.id, onCheckStatus]);

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
        scene.video_confirmed && 'border-2 border-green-600'
      )}
    >
      <div className="aspect-video relative bg-gray-900">
        {latestVideo?.url ? (
          <video
            src={latestVideo.url}
            className="w-full h-full object-cover"
            controls
            muted
          />
        ) : latestImage ? (
          <Image
            src={latestImage.url}
            alt={`分镜 ${scene.order_index}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            等待生成
          </div>
        )}

        {scene.video_status === 'processing' && !latestVideo?.url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <span className="text-sm">视频生成中...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">分镜 {scene.order_index}</span>
          <span className={cn('text-xs', statusColors[scene.video_status])}>
            {statusLabels[scene.video_status]}
          </span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{scene.description}</p>

        <div className="flex gap-2">
          {scene.video_status !== 'processing' && !scene.video_confirmed && (
            <>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded text-sm"
              >
                {scene.video_status === 'failed' ? '重试' : latestVideo ? '重新生成' : '生成'}
              </button>
              {scene.video_status === 'completed' && (
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
          {scene.video_confirmed && (
            <span className="text-green-500 text-sm">✓ 已确认</span>
          )}
        </div>
      </div>
    </div>
  );
}
