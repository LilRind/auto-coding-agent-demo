import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">注册</h1>
        <p className="text-gray-400 mt-2">创建 Spring FES Video 账号</p>
      </div>
      <RegisterForm />
    </div>
  );
}
