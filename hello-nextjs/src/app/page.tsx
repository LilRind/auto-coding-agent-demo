import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">
          故事转视频
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          将您的故事文本转化为精美的分镜视频。AI 驱动的智能分镜、图片生成和视频合成。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-medium transition-colors"
          >
            创建新项目
          </Link>
          <Link
            href="/projects"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-medium transition-colors"
          >
            查看我的项目
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">输入故事</h3>
            <p className="text-gray-400 text-sm">
              输入您的故事文本，AI 将自动拆解为分镜场景
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">生成图片</h3>
            <p className="text-gray-400 text-sm">
              为每个场景生成高质量图片，支持多种风格
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <div className="text-3xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold mb-2">合成视频</h3>
            <p className="text-gray-400 text-sm">
              将静态图片转化为动态视频，讲述完整故事
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
