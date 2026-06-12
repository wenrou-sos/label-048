'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentData {
  id: number;
  licenseType: string;
  studyPhase: string;
  licenseStatus: string;
  totalHours: number;
  completedHours: number;
  coach: {
    id: number;
    user: {
      name: string;
    };
  } | null;
  bookings: any[];
  examRecords: any[];
}

interface CoachData {
  id: number;
  experience: number;
  rating: number;
  totalReviews: number;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  students: any[];
  bookings: any[];
}

export default function DashboardPage() {
  const { user, studentId, coachId, isLoading, logout } = useAuth();
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'STUDENT' && studentId) {
      fetchStudentData(studentId);
    } else if (user.role === 'COACH' && coachId) {
      fetchCoachData(coachId);
    }
  }, [user, studentId, coachId, isLoading, router]);

  const fetchStudentData = async (id: number) => {
    setDataLoading(true);
    try {
      const response = await fetch(`/api/students/${id}`);
      const data = await response.json();
      setStudentData(data.student);
    } catch (error) {
      console.error('获取学员数据失败:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchCoachData = async (id: number) => {
    setDataLoading(true);
    try {
      const response = await fetch(`/api/coaches/${id}`);
      const data = await response.json();
      setCoachData(data.coach);
    } catch (error) {
      console.error('获取教练数据失败:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getPhaseLabel = (phase: string) => {
    const phases: Record<string, string> = {
      SUBJECT_1: '科目一',
      SUBJECT_2: '科目二',
      SUBJECT_3: '科目三',
      SUBJECT_4: '科目四',
      COMPLETED: '已完成',
    };
    return phases[phase] || phase;
  };

  const getLicenseStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      NOT_APPLIED: '未申请',
      APPLYING: '申请中',
      LEARNING: '学习中',
      TESTING: '考试中',
      OBTAINED: '已取得',
      REVOKED: '已吊销',
    };
    return statuses[status] || status;
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || dataLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            欢迎回来，{user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'STUDENT' && '学员中心'}
            {user.role === 'COACH' && '教练工作台'}
            {user.role === 'ADMIN' && '管理后台'}
            {user.role === 'COACH' && coachData && (
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  coachData.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : coachData.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {coachData.status === 'pending'
                  ? '审核中'
                  : coachData.status === 'active'
                  ? '已认证'
                  : '未通过'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary"
        >
          退出登录
        </button>
      </div>

      {user.role === 'STUDENT' && studentData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">学车类型</div>
              <div className="text-2xl font-bold text-gray-800">
                {studentData.licenseType}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">当前阶段</div>
              <div className="text-2xl font-bold text-blue-600">
                {getPhaseLabel(studentData.studyPhase)}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">已完成学时</div>
              <div className="text-2xl font-bold text-green-600">
                {studentData.completedHours}/{studentData.totalHours}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">驾照状态</div>
              <div className="text-2xl font-bold text-purple-600">
                {getLicenseStatusLabel(studentData.licenseStatus)}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">学习进度</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${studentData.totalHours > 0
                    ? (studentData.completedHours / studentData.totalHours) * 100
                    : 0}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              已完成 {studentData.completedHours} 学时，还需 {studentData.totalHours - studentData.completedHours} 学时
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">我的教练</h2>
              </div>
              {studentData.coach ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {studentData.coach.user.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {studentData.coach.user.name}
                    </p>
                    <p className="text-sm text-gray-500">你的专属教练</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">还没有选择教练</p>
                  <Link href="/coaches" className="text-blue-600 hover:underline text-sm">
                    去选择教练 →
                  </Link>
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">最近预约</h2>
                <Link href="/booking" className="text-blue-600 hover:underline text-sm">
                  查看全部
                </Link>
              </div>
              {studentData.bookings?.length > 0 ? (
                <div className="space-y-3">
                  {studentData.bookings.slice(0, 3).map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {booking.status === 'CONFIRMED'
                          ? '已确认'
                          : booking.status === 'PENDING'
                          ? '待确认'
                          : booking.status === 'COMPLETED'
                          ? '已完成'
                          : '已取消'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">暂无预约记录</p>
                  <Link href="/booking" className="text-blue-600 hover:underline text-sm">
                    立即预约 →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">考试记录</h2>
              <Link href="/exams" className="text-blue-600 hover:underline text-sm">
                查看全部
              </Link>
            </div>
            {studentData.examRecords?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {studentData.examRecords.slice(0, 4).map((exam: any) => (
                  <div
                    key={exam.id}
                    className="p-4 bg-gray-50 rounded-lg text-center"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      {getPhaseLabel(exam.examType)}
                    </p>
                    <p className="text-2xl font-bold mb-1">
                      {exam.score !== null ? `${exam.score}分` : '-'}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        exam.status === 'PASSED'
                          ? 'bg-green-100 text-green-700'
                          : exam.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {exam.status === 'PASSED'
                        ? '通过'
                        : exam.status === 'FAILED'
                        ? '未通过'
                        : '待考'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">暂无考试记录</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/booking"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-bold text-gray-800">预约练车</h3>
              <p className="text-sm text-gray-500 mt-1">选择时间，在线预约</p>
            </Link>
            <Link
              href="/coaches"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">👨‍🏫</div>
              <h3 className="font-bold text-gray-800">选择教练</h3>
              <p className="text-sm text-gray-500 mt-1">查看教练，选择适合的</p>
            </Link>
            <Link
              href="/courses"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-gray-800">课程中心</h3>
              <p className="text-sm text-gray-500 mt-1">查看培训课程</p>
            </Link>
          </div>
        </>
      )}

      {user.role === 'COACH' && coachData && (
        <>
          {coachData.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-800 mb-2">
                    资质审核中
                  </h2>
                  <p className="text-yellow-700 mb-2">
                    您的教练资质正在由管理员进行审核，请耐心等待。审核通过后，您将可以使用全部教练功能。
                  </p>
                  <p className="text-sm text-yellow-600">
                    审核通常在 1-2 个工作日内完成，如有疑问请联系系统管理员。
                  </p>
                </div>
              </div>
            </div>
          )}

          {coachData.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-2">
                    审核未通过
                  </h2>
                  <p className="text-red-700 mb-2">
                    很遗憾，您的教练资质审核未通过。
                  </p>
                  {coachData.reviewNote && (
                    <div className="bg-white border border-red-200 rounded-lg p-4 mb-3">
                      <div className="text-xs text-red-500 mb-1">驳回原因：</div>
                      <p className="text-red-700">{coachData.reviewNote}</p>
                    </div>
                  )}
                  {coachData.reviewedAt && (
                    <p className="text-xs text-red-400 mb-2">
                      审核时间：{new Date(coachData.reviewedAt).toLocaleString('zh-CN')}
                    </p>
                  )}
                  <p className="text-sm text-red-600">
                    请检查您提交的资料是否完整准确，或联系管理员了解详情。您可以尝试重新注册提交。
                  </p>
                </div>
              </div>
            </div>
          )}

          {coachData.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-1">
                    资质已认证
                  </h2>
                  {coachData.reviewedAt && (
                    <p className="text-sm text-green-600 mb-2">
                      认证时间：{new Date(coachData.reviewedAt).toLocaleString('zh-CN')}
                    </p>
                  )}
                  {coachData.reviewNote && (
                    <p className="text-sm text-green-700">{coachData.reviewNote}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">学员数量</div>
              <div className="text-2xl font-bold text-blue-600">
                {coachData.students?.length || 0}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">综合评分</div>
              <div className="text-2xl font-bold text-yellow-500">
                {coachData.rating.toFixed(1)}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">评价数量</div>
              <div className="text-2xl font-bold text-green-600">
                {coachData.totalReviews}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500 mb-1">教学年限</div>
              <div className="text-2xl font-bold text-purple-600">
                {coachData.experience}年
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">今日预约</h2>
            {coachData.bookings?.length > 0 ? (
              <div className="space-y-3">
                {coachData.bookings.slice(0, 5).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.student?.user?.name || '学员'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(booking.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status === 'CONFIRMED' ? '已确认' : '待确认'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无预约</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/schedules"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-bold text-gray-800">排课管理</h3>
              <p className="text-sm text-gray-500 mt-1">管理你的排课时间</p>
            </Link>
            <Link
              href="/bookings"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-800">预约管理</h3>
              <p className="text-sm text-gray-500 mt-1">查看和处理预约</p>
            </Link>
            <Link
              href="/students"
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-gray-800">我的学员</h3>
              <p className="text-sm text-gray-500 mt-1">查看学员列表</p>
            </Link>
          </div>
        </>
      )}

      {user.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/coach-review" className="card p-6 hover:shadow-lg transition-shadow relative">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-800">教练审核</h3>
            <p className="text-sm text-gray-500 mt-1">审核教练注册申请</p>
            <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </Link>
          <Link href="/students" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-bold text-gray-800">学员管理</h3>
            <p className="text-sm text-gray-500 mt-1">管理所有学员</p>
          </Link>
          <Link href="/coaches" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">👨‍🏫</div>
            <h3 className="font-bold text-gray-800">教练管理</h3>
            <p className="text-sm text-gray-500 mt-1">管理所有教练</p>
          </Link>
          <Link href="/courses" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-bold text-gray-800">课程管理</h3>
            <p className="text-sm text-gray-500 mt-1">管理所有课程</p>
          </Link>
          <Link href="/exams" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-800">考试管理</h3>
            <p className="text-sm text-gray-500 mt-1">管理考试记录</p>
          </Link>
        </div>
      )}
    </div>
  );
}
