import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const date = searchParams.get('date');
    const isAvailable = searchParams.get('isAvailable');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (coachId) where.coachId = parseInt(coachId, 10);
    if (isAvailable !== null) where.isAvailable = isAvailable === 'true';

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: d,
        lt: nextDay,
      };
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
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
        date: 'asc',
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('获取排课列表失败:', error);
    return NextResponse.json(
      { error: '获取排课列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { coachId, courseId, date, startTime, endTime, location } = body;

    if (!coachId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const d = new Date(date);

    const existingSchedules = await prisma.schedule.findMany({
      where: {
        coachId: parseInt(coachId, 10),
        date: {
          gte: new Date(d.toDateString()),
          lt: new Date(d.getTime() + 24 * 60 * 60 * 1000),
        },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (existingSchedules.length > 0) {
      return NextResponse.json(
        { error: '该时间段已有排课' },
        { status: 409 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        coachId: parseInt(coachId, 10),
        courseId: courseId ? parseInt(courseId, 10) : null,
        date: d,
        startTime: start,
        endTime: end,
        isAvailable: true,
        location,
      },
      include: {
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
    });

    return NextResponse.json(
      { message: '排课创建成功', schedule },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建排课失败:', error);
    return NextResponse.json(
      { error: '创建排课失败' },
      { status: 500 }
    );
  }
}
