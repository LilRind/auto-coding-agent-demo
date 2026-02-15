'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VIDEO_STYLES, type VideoStyle } from '@/types/ai';
import { cn } from '@/lib/utils';

export function CreateProjectForm() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [style, setStyle] = useState<VideoStyle>('realistic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('请输入项目标题');
      return;
    }

    if (!story.trim()) {
      setError('请输入故事内容');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, story, style }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建失败');
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          项目标题
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="给我的故事起个名字"
        />
      </div>

      <div>
        <label htmlFor="story" className="block text-sm font-medium mb-2">
          故事内容
        </label>
        <textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="在这里输入您的故事，AI 将自动将其拆分为分镜场景..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          视频风格
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {VIDEO_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={cn(
                'p-3 rounded-lg border-2 text-left transition-all',
                style === s.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              )}
            >
              <div className="font-medium text-sm">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {loading ? '创建中...' : '创建项目'}
      </button>
    </form>
  );
}
