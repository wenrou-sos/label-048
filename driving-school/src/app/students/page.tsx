'use client';

import { useEffect, useState } from 'react';

interface Student {
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
    };
  } | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('获取学员列表失败:', error);
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

  const getProgressColor = (phase: string) => {
    const colors: Record<string, string> = {
      SUBJECT_1: 'bg-yellow-500',
      SUBJECT_2: 'bg-blue-500',
      SUBJECT_3: 'bg-purple-500',
      SUBJECT_4: 'bg-green-500',
      COMPLETED: 'bg-green-600',
    };
    return colors[phase] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">学员中心</h1>
          <p className="text-gray-600 mt-1">查看所有学员信息</p>
        </div>
        <a href="/register" className="btn-primary">
          + 新增学员
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const progress = student.totalHours > 0
            ? (student.completedHours / student.totalHours) * 100
            : 0;

          return (
            <div key={student.id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {student.user.name?.charAt(0) || '学'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {student.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{student.user.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">学车类型</span>
                    <span className="font-medium">{student.licenseType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">学习阶段</span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${getProgressColor(student.studyPhase)}`}>
                      {getPhaseLabel(student.studyPhase)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">驾照状态</span>
                    <span className="font-medium">
                      {getLicenseStatusLabel(student.licenseStatus)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">学习进度</span>
                    <span className="font-medium">
                      {student.completedHours}/{student.totalHours} 学时
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {student.coach && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">教练:</span>
                      <span className="text-sm font-medium">
                        {student.coach.user.name}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <a
                    href={`/students/${student.id}`}
                    className="flex-1 text-center py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                  >
                    查看详情
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无学员数据</p>
          <a href="/register" className="btn-primary mt-4 inline-block">
            立即注册
          </a>
        </div>
      )}
    </div>
  );
}
