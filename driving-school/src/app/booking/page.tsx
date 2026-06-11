'use client';

import { useEffect, useState } from 'react';

interface Coach {
  id: number;
  user: {
    name: string;
  };
}

interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  student: {
    user: {
      name: string;
    };
  };
  coach: {
    user: {
      name: string;
    };
  };
  course: {
    name: string;
  } | null;
}

export default function BookingPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [studentId, setStudentId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  useEffect(() => {
    fetchCoaches();
    fetchBookings();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches?status=active');
      const data = await response.json();
      setCoaches(data.coaches || []);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('获取预约列表失败:', error);
    }
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

  const getBookingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-600',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!studentId || !selectedCoach || !selectedDate || !selectedTime) {
      setMessage('请填写完整信息');
      setMessageType('error');
      return;
    }

    const [startStr, endStr] = selectedTime.split('-');
    const startDateTime = new Date(`${selectedDate}T${startStr}:00`);
    const endDateTime = new Date(`${selectedDate}T${endStr}:00`);

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(studentId, 10),
          coachId: parseInt(selectedCoach, 10),
          date: selectedDate,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '预约失败');
      }

      setMessage('预约成功！请等待教练确认');
      setMessageType('success');
      fetchBookings();
      
      setSelectedCoach('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '预约失败');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('确定要取消这个预约吗？')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        fetchBookings();
        setMessage('预约已取消');
        setMessageType('success');
      }
    } catch (error) {
      console.error('取消预约失败:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">在线预约</h1>
        <p className="text-gray-600 mt-1">选择教练和时间，轻松预约练车</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">预约练车</h2>

            {message && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
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
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input"
                  placeholder="请输入学员ID"
                />
              </div>

              <div>
                <label className="label">选择教练</label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="input"
                >
                  <option value="">请选择教练</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">选择日期</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">选择时间段</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedTime === slot
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">备注（选填）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input h-24 resize-none"
                  placeholder="请输入备注信息"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? '提交中...' : '提交预约'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">预约记录</h2>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无预约记录</p>
              ) : (
                bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
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
                      <p className="text-sm text-gray-500">
                        教练: {booking.coach.user.name}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-400 mt-1">
                          备注: {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${getBookingStatusColor(
                          booking.status
                        )}`}
                      >
                        {getBookingStatusLabel(booking.status)}
                      </span>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="block mt-2 text-sm text-red-500 hover:text-red-600"
                        >
                          取消预约
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4">预约须知</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>请提前24小时预约练车时间</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>如需取消预约，请提前4小时操作</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>预约提交后需教练确认方可生效</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>请准时到达练车地点</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>练车时请携带身份证</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4">时段说明</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">上午</span>
                <span className="text-gray-800">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">午休</span>
                <span className="text-gray-800">12:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">下午</span>
                <span className="text-gray-800">14:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
