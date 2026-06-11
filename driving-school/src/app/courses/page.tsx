'use client';

import { useEffect, useState } from 'react';

interface Course {
  id: number;
  name: string;
  description: string | null;
  courseType: string;
  duration: number;
  price: number;
  capacity: number;
  status: string;
  coach: {
    user: {
      name: string;
    };
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [filterType]);

  const fetchCourses = async () => {
    try {
      let url = '/api/courses';
      if (filterType) {
        url += `?courseType=${filterType}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('获取课程列表失败:', error);
    } finally {
      setLoading(false);
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

  const getCourseTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SUBJECT_2: 'bg-blue-100 text-blue-700',
      SUBJECT_3: 'bg-purple-100 text-purple-700',
      REFRESHER: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">课程中心</h1>
          <p className="text-gray-600 mt-1">选择适合你的培训课程</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('SUBJECT_2')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'SUBJECT_2'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            科目二
          </button>
          <button
            onClick={() => setFilterType('SUBJECT_3')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'SUBJECT_3'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            科目三
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="card hover:shadow-xl transition-shadow duration-300">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className={`px-4 py-2 rounded-full text-white text-sm font-medium ${getCourseTypeColor(course.courseType)} bg-white/20`}>
                {getCourseTypeLabel(course.courseType)}
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {course.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description || '暂无描述'}
              </p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>教练</span>
                  <span className="font-medium text-gray-800">
                    {course.coach.user.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>时长</span>
                  <span className="font-medium text-gray-800">
                    {course.duration}小时
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-3xl font-bold text-blue-600">
                    ¥{course.price}
                  </span>
                </div>
                <a href="/booking" className="btn-primary text-sm">
                  立即预约
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无课程数据</p>
        </div>
      )}
    </div>
  );
}
