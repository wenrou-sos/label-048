import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const coachId = parseInt(id, 10);

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        courses: {
          where: { status: 'active' },
        },
        reviews: {
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        schedules: {
          where: {
            date: {
              gte: new Date(),
            },
            isAvailable: true,
          },
          orderBy: {
            date: 'asc',
          },
          take: 30,
        },
        students: {
          take: 10,
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

    if (!coach) {
      return NextResponse.json({ error: '教练不存在' }, { status: 404 });
    }

    return NextResponse.json({ coach });
  } catch (error) {
    console.error('获取教练详情失败:', error);
    return NextResponse.json(
      { error: '获取教练详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const coachId = parseInt(id, 10);
    const body = await request.json();

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: '教练不存在' }, { status: 404 });
    }

    const { name, phone, ...coachData } = body;

    const updatedCoach = await prisma.coach.update({
      where: { id: coachId },
      data: coachData,
      include: {
        user: true,
      },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: updatedCoach.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    return NextResponse.json({
      message: '更新成功',
      coach: updatedCoach,
    });
  } catch (error) {
    console.error('更新教练信息失败:', error);
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
}
