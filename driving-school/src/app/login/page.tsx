'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      login(data.user, data.studentId, data.coachId);

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
          <p className="text-gray-600">登录您的账号</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div>
            <label className="label">密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="请输入密码"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded" />
              记住我
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          还没有账号？{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            立即注册
          </a>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-4">测试账号</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>管理员</span>
              <span className="font-mono">admin@driving.com / 123456</span>
            </div>
            <div className="flex justify-between">
              <span>学员</span>
              <span className="font-mono">student1@driving.com / 123456</span>
            </div>
            <div className="flex justify-between">
              <span>教练</span>
              <span className="font-mono">coach1@driving.com / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
