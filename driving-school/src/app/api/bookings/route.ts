import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bookingSchema = z.object({
  studentId: z.number(),
  coachId: z.number(),
  scheduleId: z.number().optional(),
  courseId: z.number().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const coachId = searchParams.get('coachId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where: any = {};
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (coachId) where.coachId = parseInt(coachId, 10);
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        coach: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        course: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('获取预约列表失败:', error);
    return NextResponse.json(
      { error: '获取预约列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: validated.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '学员不存在' }, { status: 404 });
    }

    const coach = await prisma.coach.findUnique({
      where: { id: validated.coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: '教练不存在' }, { status: 404 });
    }

    const startTime = new Date(validated.startTime);
    const endTime = new Date(validated.endTime);
    const date = new Date(validated.date);

    const conflictBookings = await prisma.booking.findMany({
      where: {
        coachId: validated.coachId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        AND: [
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    });

    if (conflictBookings.length > 0) {
      return NextResponse.json(
        { error: '该时间段已有预约，请选择其他时间', conflicts: conflictBookings },
        { status: 409 }
      );
    }

    const studentConflicts = await prisma.booking.findMany({
      where: {
        studentId: validated.studentId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        AND: [
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    });

    if (studentConflicts.length > 0) {
      return NextResponse.json(
        { error: '您在该时间段已有预约' },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: validated.studentId,
        coachId: validated.coachId,
        scheduleId: validated.scheduleId,
        courseId: validated.courseId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        status: 'PENDING',
        notes: validated.notes,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        coach: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (validated.scheduleId) {
      await prisma.schedule.update({
        where: { id: validated.scheduleId },
        data: { isAvailable: false },
      });
    }

    await prisma.notification.create({
      data: {
        studentId: validated.studentId,
        title: '预约成功',
        content: `您已成功预约 ${date.toLocaleDateString()} 的练车时间，请等待教练确认。`,
        type: 'booking',
      },
    });

    return NextResponse.json(
      { message: '预约成功', booking },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建预约失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '预约失败，请稍后重试' },
      { status: 500 }
    );
  }
}
