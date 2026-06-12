'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CoachUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

interface PendingCoach {
  id: number;
  userId: number;
  licenseNumber: string | null;
  experience: number;
  rating: number;
  totalReviews: number;
  bio: string | null;
  specialties: string | null;
  pricePerHour: number;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;
  user: CoachUser;
}

export default function CoachReviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [coaches, setCoaches] = useState<PendingCoach[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; coachId: number; coachName: string }>({
    open: false,
    coachId: 0,
    coachName: '',
  });
  const [rejectNote, setRejectNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchCoaches();
  }, [user, isLoading, router, activeTab]);

  const fetchCoaches = async () => {
    setDataLoading(true);
    try {
      const response = await fetch(`/api/coaches/review?status=${activeTab}`);
      const data = await response.json();
      setCoaches(data.coaches || []);
      setPendingCount(data.pendingCount || 0);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (coachId: number) => {
    setActionLoading(coachId);
    try {
      const response = await fetch('/api/coaches/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          status: 'active',
          reviewerId: user?.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message || '审核通过');
        fetchCoaches();
      } else {
        showMessage('error', data.error || '操作失败');
      }
    } catch (error) {
      showMessage('error', '操作失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading(rejectModal.coachId);
    try {
      const response = await fetch('/api/coaches/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: rejectModal.coachId,
          status: 'rejected',
          reviewNote: rejectNote || '资料不符合要求',
          reviewerId: user?.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message || '已驳回');
        setRejectModal({ open: false, coachId: 0, coachName: '' });
        setRejectNote('');
        fetchCoaches();
      } else {
        showMessage('error', data.error || '操作失败');
      }
    } catch (error) {
      showMessage('error', '操作失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || dataLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'pending', label: '待审核', count: pendingCount },
    { key: 'active', label: '已通过', count: null },
    { key: 'rejected', label: '已驳回', count: null },
  ];

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">教练资质审核</h1>
          <p className="text-gray-600 mt-1">
            审核教练注册申请，通过后教练可使用平台功能
          </p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {coaches.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {activeTab === 'pending' ? '暂无待审核申请' : activeTab === 'active' ? '暂无已通过教练' : '暂无已驳回记录'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'pending' ? '新的教练注册申请将出现在这里' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => (
            <div key={coach.id} className="card p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-600">
                      {coach.user.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {coach.user.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          coach.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : coach.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {coach.status === 'pending'
                          ? '待审核'
                          : coach.status === 'active'
                          ? '已通过'
                          : '已驳回'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📧</span>
                        <span>{coach.user.email}</span>
                      </div>
                      {coach.user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📱</span>
                          <span>{coach.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📅</span>
                        <span>注册时间: {formatDate(coach.user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>🎓</span>
                        <span>教学年限: {coach.experience}年</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>💰</span>
                        <span>课时费: ¥{coach.pricePerHour}/小时</span>
                      </div>
                      {coach.licenseNumber && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🪪</span>
                          <span>资质编号: {coach.licenseNumber}</span>
                        </div>
                      )}
                    </div>

                    {coach.bio && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">个人简介</div>
                        <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                          {coach.bio}
                        </p>
                      </div>
                    )}

                    {coach.specialties && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">教学专长</div>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.split(/[,，、\s]+/).filter(Boolean).map((s, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {coach.reviewNote && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">
                          {coach.status === 'rejected' ? '驳回原因' : '审核备注'}
                        </div>
                        <p
                          className={`text-sm rounded-lg p-3 ${
                            coach.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {coach.reviewNote}
                        </p>
                      </div>
                    )}

                    {coach.reviewedAt && (
                      <div className="text-xs text-gray-400">
                        审核时间: {formatDate(coach.reviewedAt)}
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === 'pending' && (
                  <div className="flex md:flex-col gap-3 md:w-36">
                    <button
                      onClick={() => handleApprove(coach.id)}
                      disabled={actionLoading === coach.id}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === coach.id ? '处理中...' : '✓ 通过'}
                    </button>
                    <button
                      onClick={() =>
                        setRejectModal({
                          open: true,
                          coachId: coach.id,
                          coachName: coach.user.name,
                        })
                      }
                      disabled={actionLoading === coach.id}
                      className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✕ 驳回
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">驳回申请</h2>
            <p className="text-gray-600 mb-4">
              您即将驳回 <span className="font-medium">{rejectModal.coachName}</span> 的教练注册申请。
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                驳回原因（可选）
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                placeholder="请输入驳回原因，帮助教练了解问题所在"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({ open: false, coachId: 0, coachName: '' });
                  setRejectNote('');
                }}
                disabled={actionLoading === rejectModal.coachId}
                className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.coachId}
                className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal.coachId ? '处理中...' : '确认驳回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
