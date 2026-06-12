'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'STUDENT',
    licenseType: 'C1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const endpoint = formData.role === 'STUDENT' ? '/api/students' : '/api/coaches/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          licenseType: formData.role === 'STUDENT' ? formData.licenseType : undefined,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      const userData = data.user || data.student?.user || data.coach?.user;
      const studentId = data.student?.id;
      const coachId = data.coach?.id;

      if (userData) {
        login(userData, studentId, coachId);
      }

      if (formData.role === 'STUDENT') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">用户注册</h1>
          <p className="text-gray-600">创建账号，开启你的学车之旅</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">注册身份</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'STUDENT' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.role === 'STUDENT'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">👨‍🎓</div>
                <div className="font-medium text-sm">我是学员</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'COACH' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.role === 'COACH'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">�‍🏫</div>
                <div className="font-medium text-sm">我是教练</div>
              </button>
            </div>
          </div>

          <div>
            <label className="label">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="请输入姓名"
              required
            />
          </div>

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
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>

          <div>
            <label className="label">确认密码</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div>
            <label className="label">手机号</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="请输入手机号"
            />
          </div>

          {formData.role === 'STUDENT' && (
            <div>
              <label className="label">学车类型</label>
              <select
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                className="input"
              >
                <option value="C1">C1 - 小型汽车（手动挡）</option>
                <option value="C2">C2 - 小型汽车（自动挡）</option>
                <option value="B1">B1 - 中型客车</option>
                <option value="B2">B2 - 大型货车</option>
                <option value="A1">A1 - 大型客车</option>
                <option value="A2">A2 - 牵引车</option>
                <option value="A3">A3 - 城市公交车</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          已有账号？{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            立即登录
          </a>
        </p>
      </div>
    </div>
  );
}
