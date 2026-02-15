'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ProjectErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectError({ error, reset }: ProjectErrorProps) {
  useEffect(() => {
    console.error('Project error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          项目加载失败
        </h1>
        <p className="text-gray-400 mb-6">
          {error.message || '无法加载该项目，可能不存在或您没有访问权限。'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            重试
          </button>
          <Link
            href="/projects"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            返回项目列表
          </Link>
        </div>
      </div>
    </div>
  );
}
