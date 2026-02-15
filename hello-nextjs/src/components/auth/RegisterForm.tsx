'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      if (error.message.includes('already registered')) {
        setError('该邮箱已被注册');
      } else {
        setError(error.message);
      }
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <div className="text-green-500 text-lg">注册成功！</div>
        <div className="text-gray-400">正在跳转到登录页面...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          确认密码
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
      >
        {loading ? '注册中...' : '注册'}
      </button>
      <div className="text-center text-sm text-gray-400">
        已有账号？{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          登录
        </Link>
      </div>
    </form>
  );
}
