'use client';

import { useEffect, useState } from 'react';

interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  location: string | null;
  course: {
    id: number;
    name: string;
  } | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    user: {
      name: string;
    };
  };
}

interface CoachDetail {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  licenseNumber: string | null;
  experience: number;
  rating: number;
  totalReviews: number;
  bio: string | null;
  specialties: string | null;
  pricePerHour: number;
  status: string;
  courses: Array<{
    id: number;
    name: string;
    description: string | null;
    courseType: string;
    duration: number;
    price: number;
  }>;
  reviews: Review[];
  schedules: Schedule[];
  students: Array<{
    user: {
      name: string;
    };
  }>;
}

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetchCoach();
  }, [params.id]);

  const fetchCoach = async () => {
    try {
      const response = await fetch(`/api/coaches/${params.id}`);
      const data = await response.json();
      setCoach(data.coach);
    } catch (error) {
      console.error('获取教练详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleBookClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowBookingModal(true);
    setBookingMessage('');
  };

  const handleBooking = async () => {
    if (!selectedSchedule || !studentId) {
      setBookingMessage('请填写学员ID');
      return;
    }

    setBookingLoading(true);
    setBookingMessage('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(studentId, 10),
          coachId: coach?.id,
          scheduleId: selectedSchedule.id,
          date: selectedSchedule.date,
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '预约失败');
      }

      setBookingMessage('预约成功！');
      setTimeout(() => {
        setShowBookingModal(false);
        fetchCoach();
      }, 1500);
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : '预约失败');
    } finally {
      setBookingLoading(false);
    }
  };

  const getCourseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SUBJECT_2: '科目二',
      SUBJECT_3: '科目三',
      REFRESHER: '复习课',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!coach) {
    return <div className="text-center py-12 text-gray-500">教练不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <a href="/coaches" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回教练列表
        </a>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {coach.user.name?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {coach.user.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{renderStars(coach.rating)}</div>
                  <span className="text-gray-600">
                    {coach.rating.toFixed(1)}分
                  </span>
                  <span className="text-gray-400">
                    ({coach.totalReviews}条评价)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">
                  ¥{coach.pricePerHour}
                </span>
                <span className="text-gray-500">/小时</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                {coach.experience}年教龄
              </span>
              {coach.specialties?.split(',').map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  {spec.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-gray-600">{coach.bio}</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'info', label: '教练介绍' },
            { key: 'courses', label: '课程列表' },
            { key: 'schedules', label: '可约时间' },
            { key: 'reviews', label: '学员评价' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">教练简介</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">姓名</span>
                <p className="font-medium">{coach.user.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">联系电话</span>
                <p className="font-medium">{coach.user.phone || '未填写'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">邮箱</span>
                <p className="font-medium">{coach.user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">教练证编号</span>
                <p className="font-medium">{coach.licenseNumber || '未填写'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">教学年限</span>
                <p className="font-medium">{coach.experience}年</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">在教学员</span>
                <p className="font-medium">{coach.students.length}人</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">开设课程</h2>
          <div className="space-y-4">
            {coach.courses.length === 0 ? (
              <p className="text-gray-500">暂无课程</p>
            ) : (
              coach.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{course.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getCourseTypeLabel(course.courseType)} · {course.duration}小时
                    </p>
                    {course.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">¥{course.price}</p>
                    <button
                      onClick={() => setActiveTab('schedules')}
                      className="text-sm text-blue-600 hover:underline mt-1"
                    >
                      预约
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">可预约时间</h2>
          {coach.schedules.length === 0 ? (
            <p className="text-gray-500">暂无可用时间</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coach.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    schedule.isAvailable
                      ? 'border-green-200 bg-green-50 hover:border-green-400 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => schedule.isAvailable && handleBookClick(schedule)}
                >
                  <p className="font-medium text-gray-800">
                    {new Date(schedule.date).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(schedule.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(schedule.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {schedule.course && (
                    <p className="text-sm text-blue-600 mt-1">
                      {schedule.course.name}
                    </p>
                  )}
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        schedule.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {schedule.isAvailable ? '可预约' : '已约满'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">学员评价</h2>
          <div className="space-y-4">
            {coach.reviews.length === 0 ? (
              <p className="text-gray-500">暂无评价</p>
            ) : (
              coach.reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-800">
                        {review.student.user.name}
                      </span>
                      <div className="flex mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showBookingModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">预约确认</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">教练</span>
                <span className="font-medium">{coach.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日期</span>
                <span className="font-medium">
                  {new Date(selectedSchedule.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">时间</span>
                <span className="font-medium">
                  {new Date(selectedSchedule.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(selectedSchedule.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {selectedSchedule.course && (
                <div className="flex justify-between">
                  <span className="text-gray-500">课程</span>
                  <span className="font-medium">{selectedSchedule.course.name}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="label">学员ID</label>
              <input
                type="number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input"
                placeholder="请输入学员ID"
              />
            </div>

            {bookingMessage && (
              <div
                className={`p-3 rounded-lg mb-4 text-sm ${
                  bookingMessage.includes('成功')
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {bookingMessage}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn-secondary"
                disabled={bookingLoading}
              >
                取消
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 btn-primary"
                disabled={bookingLoading}
              >
                {bookingLoading ? '预约中...' : '确认预约'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
