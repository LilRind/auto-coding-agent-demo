import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">登录</h1>
        <p className="text-gray-400 mt-2">登录到 Spring FES Video</p>
      </div>
      <LoginForm />
    </div>
  );
}
