import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          页面未找到
        </h2>
        <p className="text-gray-400 mb-8">
          您访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
