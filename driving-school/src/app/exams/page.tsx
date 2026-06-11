'use client';

import { useEffect, useState } from 'react';

interface ExamRecord {
  id: number;
  studentId: number;
  examType: string;
  examDate: string;
  score: number | null;
  status: string;
  location: string | null;
  notes: string | null;
  certificateUrl: string | null;
  student: {
    user: {
      name: string;
    };
  };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    examType: 'SUBJECT_1',
    examDate: '',
    score: '',
    status: 'NOT_TAKEN',
    location: '',
    notes: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      setExams(data.examRecords || []);
    } catch (error) {
      console.error('获取考试记录失败:', error);
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
      PASSED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!formData.studentId || !formData.examDate) {
      setMessage('请填写必要信息');
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId, 10),
          examType: formData.examType,
          examDate: formData.examDate,
          score: formData.score ? parseFloat(formData.score) : undefined,
          status: formData.status,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '添加失败');
      }

      setMessage('添加成功！');
      setShowAddModal(false);
      fetchExams();
      setFormData({
        studentId: '',
        examType: 'SUBJECT_1',
        examDate: '',
        score: '',
        status: 'NOT_TAKEN',
        location: '',
        notes: '',
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '添加失败');
    } finally {
      setSubmitLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-800">考试管理</h1>
          <p className="text-gray-600 mt-1">查看和管理考试记录</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          + 录入成绩
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {exams.length}
          </div>
          <div className="text-gray-500">总考试次数</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {exams.filter((e) => e.status === 'PASSED').length}
          </div>
          <div className="text-gray-500">通过次数</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {exams.filter((e) => e.status === 'FAILED').length}
          </div>
          <div className="text-gray-500">未通过次数</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {exams.filter((e) => e.status === 'NOT_TAKEN').length}
          </div>
          <div className="text-gray-500">待考次数</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">考试记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  学员
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  考试科目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  考试日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  成绩
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  地点
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无考试记录
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {exam.student.user.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPhaseLabel(exam.examType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(exam.examDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.score !== null ? (
                        <span className="font-medium">{exam.score}分</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getExamStatusColor(
                          exam.status
                        )}`}
                      >
                        {getExamStatusLabel(exam.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {exam.location || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">录入考试成绩</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg mb-4 text-sm ${
                    message.includes('成功')
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">学员ID</label>
                  <input
                    type="number"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="请输入学员ID"
                    required
                  />
                </div>

                <div>
                  <label className="label">考试科目</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="SUBJECT_1">科目一</option>
                    <option value="SUBJECT_2">科目二</option>
                    <option value="SUBJECT_3">科目三</option>
                    <option value="SUBJECT_4">科目四</option>
                  </select>
                </div>

                <div>
                  <label className="label">考试日期</label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">考试状态</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="NOT_TAKEN">未参加</option>
                    <option value="PASSED">已通过</option>
                    <option value="FAILED">未通过</option>
                  </select>
                </div>

                <div>
                  <label className="label">成绩（选填）</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="请输入考试成绩"
                  />
                </div>

                <div>
                  <label className="label">考试地点（选填）</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="请输入考试地点"
                  />
                </div>

                <div>
                  <label className="label">备注（选填）</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input h-20 resize-none"
                    placeholder="请输入备注信息"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={submitLoading}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading ? '提交中...' : '确认提交'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
