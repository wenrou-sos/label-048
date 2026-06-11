'use client';

import { useEffect, useState } from 'react';

interface ExamRecord {
  id: number;
  examType: string;
  examDate: string;
  score: number | null;
  status: string;
  location: string | null;
  notes: string | null;
}

interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  coach: {
    user: {
      name: string;
    };
  };
}

interface StudentDetail {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  idNumber: string | null;
  licenseType: string;
  studyPhase: string;
  licenseStatus: string;
  enrollDate: string | null;
  totalHours: number;
  completedHours: number;
  coachId: number | null;
  coach: {
    id: number;
    user: {
      name: string;
      phone: string | null;
    };
  } | null;
  bookings: Booking[];
  examRecords: ExamRecord[];
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchStudent();
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();
      setStudent(data.student);
    } catch (error) {
      console.error('获取学员详情失败:', error);
    } finally {
      setLoading(false);
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

  const getBookingStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      PENDING: '待确认',
      CONFIRMED: '已确认',
      CANCELLED: '已取消',
      COMPLETED: '已完成',
    };
    return statuses[status] || status;
  };

  const getExamStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      NOT_TAKEN: '未参加',
      PASSED: '已通过',
      FAILED: '未通过',
    };
    return statuses[status] || status;
  };

  const getExamStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NOT_TAKEN: 'bg-gray-100 text-gray-600',
      PASSED: 'bg-green-100 text-green-600',
      FAILED: 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getBookingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-600',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-12 text-gray-500">学员不存在</div>;
  }

  const progress = student.totalHours > 0
    ? (student.completedHours / student.totalHours) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <a href="/students" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回学员列表
        </a>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-600">
                {student.user.name?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {student.user.name}
            </h1>
            <p className="text-gray-500 mb-4">{student.user.email}</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {student.licenseType}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {getPhaseLabel(student.studyPhase)}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {getLicenseStatusLabel(student.licenseStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">学习进度</span>
            <span className="font-medium">
              {student.completedHours} / {student.totalHours} 学时 ({progress.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['info', 'bookings', 'exams'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' && '基本信息'}
              {tab === 'bookings' && '预约记录'}
              {tab === 'exams' && '考试记录'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">姓名</span>
              <p className="font-medium">{student.user.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">邮箱</span>
              <p className="font-medium">{student.user.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">手机号</span>
              <p className="font-medium">{student.user.phone || '未填写'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">身份证号</span>
              <p className="font-medium">{student.idNumber || '未填写'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">学车类型</span>
              <p className="font-medium">{student.licenseType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">报名日期</span>
              <p className="font-medium">
                {student.enrollDate
                  ? new Date(student.enrollDate).toLocaleDateString()
                  : '未填写'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">当前阶段</span>
              <p className="font-medium">{getPhaseLabel(student.studyPhase)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">驾照状态</span>
              <p className="font-medium">{getLicenseStatusLabel(student.licenseStatus)}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">当前教练</span>
              <p className="font-medium">
                {student.coach ? student.coach.user.name : '未选择教练'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">预约记录</h2>
            <a href="/booking" className="text-blue-600 hover:underline text-sm">
              发起预约
            </a>
          </div>
          <div className="space-y-4">
            {student.bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无预约记录</p>
            ) : (
              student.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      教练: {booking.coach.user.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getBookingStatusColor(
                      booking.status
                    )}`}
                  >
                    {getBookingStatusLabel(booking.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">考试记录</h2>
          <div className="space-y-4">
            {student.examRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无考试记录</p>
            ) : (
              student.examRecords.map((exam) => (
                <div
                  key={exam.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{getPhaseLabel(exam.examType)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exam.examDate).toLocaleDateString()}
                    </p>
                    {exam.score !== null && (
                      <p className="text-sm text-gray-500">分数: {exam.score}分</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getExamStatusColor(
                      exam.status
                    )}`}
                  >
                    {getExamStatusLabel(exam.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
