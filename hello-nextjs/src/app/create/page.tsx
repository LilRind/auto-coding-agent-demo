import { CreateProjectForm } from '@/components/project/CreateProjectForm';

export default function CreatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">创建新项目</h1>
        <p className="text-gray-400">输入您的故事，AI 将帮您转化为精美的分镜视频</p>
      </div>
      <CreateProjectForm />
    </div>
  );
}
