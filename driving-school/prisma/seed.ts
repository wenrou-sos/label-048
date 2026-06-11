import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始插入测试数据...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@driving.com' },
    update: {},
    create: {
      email: 'admin@driving.com',
      password: hashedPassword,
      name: '系统管理员',
      phone: '13800000000',
      role: 'ADMIN',
    },
  });

  const coachUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'coach1@driving.com' },
      update: {},
      create: {
        email: 'coach1@driving.com',
        password: hashedPassword,
        name: '张教练',
        phone: '13800000001',
        role: 'COACH',
      },
    }),
    prisma.user.upsert({
      where: { email: 'coach2@driving.com' },
      update: {},
      create: {
        email: 'coach2@driving.com',
        password: hashedPassword,
        name: '李教练',
        phone: '13800000002',
        role: 'COACH',
      },
    }),
    prisma.user.upsert({
      where: { email: 'coach3@driving.com' },
      update: {},
      create: {
        email: 'coach3@driving.com',
        password: hashedPassword,
        name: '王教练',
        phone: '13800000003',
        role: 'COACH',
      },
    }),
    prisma.user.upsert({
      where: { email: 'coach4@driving.com' },
      update: {},
      create: {
        email: 'coach4@driving.com',
        password: hashedPassword,
        name: '赵教练',
        phone: '13800000004',
        role: 'COACH',
      },
    }),
  ]);

  const coaches = await Promise.all([
    prisma.coach.upsert({
      where: { userId: coachUsers[0].id },
      update: {},
      create: {
        userId: coachUsers[0].id,
        licenseNumber: 'JL2020001',
        experience: 8,
        rating: 4.8,
        totalReviews: 156,
        bio: '从事驾培行业8年，教学经验丰富，耐心细致，通过率高。',
        specialties: 'C1手动挡,科目二,科目三',
        pricePerHour: 120,
        status: 'active',
      },
    }),
    prisma.coach.upsert({
      where: { userId: coachUsers[1].id },
      update: {},
      create: {
        userId: coachUsers[1].id,
        licenseNumber: 'JL2019002',
        experience: 10,
        rating: 4.9,
        totalReviews: 230,
        bio: '10年教龄，金牌教练，学员通过率95%以上。',
        specialties: 'C1/C2,科目二特训,考前辅导',
        pricePerHour: 150,
        status: 'active',
      },
    }),
    prisma.coach.upsert({
      where: { userId: coachUsers[2].id },
      update: {},
      create: {
        userId: coachUsers[2].id,
        licenseNumber: 'JL2021003',
        experience: 5,
        rating: 4.6,
        totalReviews: 89,
        bio: '年轻教练，教学方法新颖，善于与学员沟通。',
        specialties: 'C2自动挡,新手友好',
        pricePerHour: 100,
        status: 'active',
      },
    }),
    prisma.coach.upsert({
      where: { userId: coachUsers[3].id },
      update: {},
      create: {
        userId: coachUsers[3].id,
        licenseNumber: 'JL2018004',
        experience: 12,
        rating: 4.7,
        totalReviews: 312,
        bio: '资深教练，熟悉考试规则，针对性强。',
        specialties: 'B2货车,客车,增驾',
        pricePerHour: 180,
        status: 'active',
      },
    }),
  ]);

  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: '科目二基础班',
        description: '科目二基础训练，包含倒车入库、侧方停车等项目',
        courseType: 'SUBJECT_2',
        coachId: coaches[0].id,
        duration: 2,
        price: 200,
        capacity: 1,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: '科目二强化班',
        description: '科目二强化训练，考前冲刺',
        courseType: 'SUBJECT_2',
        coachId: coaches[1].id,
        duration: 3,
        price: 450,
        capacity: 1,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: '科目三路面班',
        description: '科目三路面训练，包含各种路况应对',
        courseType: 'SUBJECT_3',
        coachId: coaches[1].id,
        duration: 2,
        price: 300,
        capacity: 1,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: '自动挡基础班',
        description: 'C2自动挡基础训练',
        courseType: 'SUBJECT_2',
        coachId: coaches[2].id,
        duration: 2,
        price: 180,
        capacity: 1,
        status: 'active',
      },
    }),
    prisma.course.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'B2货车培训班',
        description: '大型货车驾驶培训',
        courseType: 'SUBJECT_3',
        coachId: coaches[3].id,
        duration: 4,
        price: 600,
        capacity: 1,
        status: 'active',
      },
    }),
  ]);

  const studentUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@driving.com' },
      update: {},
      create: {
        email: 'student1@driving.com',
        password: hashedPassword,
        name: '小明',
        phone: '13900000001',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@driving.com' },
      update: {},
      create: {
        email: 'student2@driving.com',
        password: hashedPassword,
        name: '小红',
        phone: '13900000002',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student3@driving.com' },
      update: {},
      create: {
        email: 'student3@driving.com',
        password: hashedPassword,
        name: '小刚',
        phone: '13900000003',
        role: 'STUDENT',
      },
    }),
  ]);

  const students = await Promise.all([
    prisma.student.upsert({
      where: { userId: studentUsers[0].id },
      update: {},
      create: {
        userId: studentUsers[0].id,
        idNumber: '110101199001010001',
        licenseType: 'C1',
        studyPhase: 'SUBJECT_2',
        licenseStatus: 'LEARNING',
        enrollDate: new Date('2024-01-15'),
        totalHours: 60,
        completedHours: 12,
        coachId: coaches[0].id,
      },
    }),
    prisma.student.upsert({
      where: { userId: studentUsers[1].id },
      update: {},
      create: {
        userId: studentUsers[1].id,
        idNumber: '110101199202020002',
        licenseType: 'C2',
        studyPhase: 'SUBJECT_1',
        licenseStatus: 'APPLYING',
        enrollDate: new Date('2024-06-01'),
        totalHours: 50,
        completedHours: 0,
      },
    }),
    prisma.student.upsert({
      where: { userId: studentUsers[2].id },
      update: {},
      create: {
        userId: studentUsers[2].id,
        idNumber: '110101198803030003',
        licenseType: 'B2',
        studyPhase: 'SUBJECT_3',
        licenseStatus: 'TESTING',
        enrollDate: new Date('2023-09-10'),
        totalHours: 80,
        completedHours: 65,
        coachId: coaches[3].id,
      },
    }),
  ]);

  const today = new Date();
  const schedules = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    if (date.getDay() === 0) continue;
    
    for (const coach of coaches) {
      for (let hour = 8; hour < 17; hour += 2) {
        if (hour === 12) continue;
        
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setHours(hour + 2, 0, 0, 0);

        schedules.push(
          prisma.schedule.upsert({
            where: { id: i * 20 + coach.id * 4 + hour },
            update: {},
            create: {
              coachId: coach.id,
              courseId: coach.id % 2 === 0 ? courses[0].id : courses[2].id,
              date: date,
              startTime: startTime,
              endTime: endTime,
              isAvailable: Math.random() > 0.3,
              location: '驾校训练场',
            },
          })
        );
      }
    }
  }
  await Promise.all(schedules);

  const bookings = await Promise.all([
    prisma.booking.upsert({
      where: { id: 1 },
      update: {},
      create: {
        studentId: students[0].id,
        coachId: coaches[0].id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        notes: '重点练习倒车入库',
      },
    }),
    prisma.booking.upsert({
      where: { id: 2 },
      update: {},
      create: {
        studentId: students[0].id,
        coachId: coaches[0].id,
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        startTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        status: 'PENDING',
        notes: '',
      },
    }),
    prisma.booking.upsert({
      where: { id: 3 },
      update: {},
      create: {
        studentId: students[2].id,
        coachId: coaches[3].id,
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        startTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: '路面训练完成',
      },
    }),
  ]);

  const examRecords = await Promise.all([
    prisma.examRecord.upsert({
      where: { id: 1 },
      update: {},
      create: {
        studentId: students[0].id,
        examType: 'SUBJECT_1',
        examDate: new Date('2024-02-20'),
        score: 95,
        status: 'PASSED',
        location: 'XX车管所',
        notes: '一次通过',
      },
    }),
    prisma.examRecord.upsert({
      where: { id: 2 },
      update: {},
      create: {
        studentId: students[0].id,
        examType: 'SUBJECT_2',
        examDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'NOT_TAKEN',
        location: 'XX考场',
        notes: '预约中',
      },
    }),
    prisma.examRecord.upsert({
      where: { id: 3 },
      update: {},
      create: {
        studentId: students[2].id,
        examType: 'SUBJECT_1',
        examDate: new Date('2023-10-15'),
        score: 98,
        status: 'PASSED',
        location: 'XX车管所',
      },
    }),
    prisma.examRecord.upsert({
      where: { id: 4 },
      update: {},
      create: {
        studentId: students[2].id,
        examType: 'SUBJECT_2',
        examDate: new Date('2024-01-20'),
        score: 85,
        status: 'PASSED',
        location: 'XX考场',
      },
    }),
  ]);

  const reviews = await Promise.all([
    prisma.review.upsert({
      where: { id: 1 },
      update: {},
      create: {
        studentId: students[0].id,
        coachId: coaches[0].id,
        rating: 5,
        comment: '张教练非常耐心，教学方法很好，推荐！',
      },
    }),
    prisma.review.upsert({
      where: { id: 2 },
      update: {},
      create: {
        studentId: students[2].id,
        coachId: coaches[1].id,
        rating: 5,
        comment: '李教练经验丰富，跟着他学通过率高。',
      },
    }),
  ]);

  console.log('测试数据插入完成！');
  console.log('管理员账号: admin@driving.com / 123456');
  console.log('学员账号: student1@driving.com / 123456');
  console.log('教练账号: coach1@driving.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
