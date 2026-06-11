import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: '📝',
      title: '在线报名',
      description: '简单几步完成注册报名，随时随地开始学车之旅',
    },
    {
      icon: '👨‍🏫',
      title: '自主选教练',
      description: '查看教练资质、评价和评分，选择最适合你的教练',
    },
    {
      icon: '📅',
      title: '灵活预约',
      description: '在线预约练车时间，灵活安排你的学习计划',
    },
    {
      icon: '📊',
      title: '进度跟踪',
      description: '实时查看学习进度、考试记录，掌握学习状态',
    },
    {
      icon: '🏆',
      title: '考试管理',
      description: '考试预约、成绩查询、证书管理一站式服务',
    },
    {
      icon: '📱',
      title: '多端支持',
      description: '支持电脑、手机、平板等多种设备，随时随地学习',
    },
  ];

  const stats = [
    { number: '5000+', label: '已服务学员' },
    { number: '50+', label: '专业教练' },
    { number: '98%', label: '学员满意度' },
    { number: '95%', label: '考试通过率' },
  ];

  return (
    <div className="space-y-16">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              开启你的驾驶之旅
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              专业教练团队，灵活预约系统，助你轻松拿驾照
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                立即报名
              </Link>
              <Link
                href="/coaches"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
              >
                查看教练
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            核心功能
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            我们提供全方位的驾校管理服务，让学车变得简单高效
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-gray-100 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            学车流程
          </h2>
          <p className="text-gray-600 text-lg">简单四步，轻松拿证</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          {[
            { step: '01', title: '在线报名', desc: '填写信息，选择班型' },
            { step: '02', title: '选择教练', desc: '根据评价选择心仪教练' },
            { step: '03', title: '预约练车', desc: '灵活安排练车时间' },
            { step: '04', title: '考试拿证', desc: '顺利通过考试获取驾照' },
          ].map((item, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
              {index < 3 && (
                <div className="hidden md:block absolute top-8 left-3/4 w-1/2 h-0.5 bg-blue-200"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好开始学车了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            加入我们，让专业教练带你开启驾驶之旅
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            立即报名
          </Link>
        </div>
      </section>
    </div>
  );
}
