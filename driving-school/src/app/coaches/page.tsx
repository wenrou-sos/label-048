'use client';

import { useEffect, useState } from 'react';

interface Coach {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
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
    courseType: string;
    price: number;
  }>;
  reviews: any[];
  _count: {
    students: number;
    reviews: number;
  };
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/coaches?status=active');
      const data = await response.json();
      setCoaches(data.coaches || []);
    } catch (error) {
      console.error('获取教练列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">教练列表</h1>
        <p className="text-gray-600 mt-1">选择适合你的专业教练</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <div key={coach.id} className="card hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">
                    {coach.user.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {coach.user.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(coach.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {coach.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({coach.totalReviews}条评价)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {coach.experience}年教龄
                  </p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {coach.bio || '暂无简介'}
              </p>

              {coach.specialties && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {coach.specialties.split(',').map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    ¥{coach.pricePerHour}
                  </span>
                  <span className="text-gray-500 text-sm">/小时</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/coaches/${coach.id}`}
                    className="btn-primary text-sm"
                  >
                    查看详情
                  </a>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>{coach._count.students}名学员</span>
                <span>{coach.courses.length}门课程</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coaches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无教练数据</p>
        </div>
      )}
    </div>
  );
}
