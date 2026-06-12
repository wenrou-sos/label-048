import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  coachId: z.number(),
  status: z.enum(['active', 'rejected']),
  reviewNote: z.string().optional(),
  reviewerId: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      where.status = 'pending';
    }

    const coaches = await prisma.coach.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const pendingCount = await prisma.coach.count({
      where: { status: 'pending' },
    });

    return NextResponse.json({ coaches, pendingCount });
  } catch (error) {
    console.error('获取待审核教练列表失败:', error);
    return NextResponse.json(
      { error: '获取待审核教练列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const coach = await prisma.coach.findUnique({
      where: { id: validated.coachId },
    });

    if (!coach) {
      return NextResponse.json(
        { error: '教练不存在' },
        { status: 404 }
      );
    }

    if (coach.status !== 'pending') {
      return NextResponse.json(
        { error: '该教练已处理，无需重复审核' },
        { status: 400 }
      );
    }

    const updatedCoach = await prisma.coach.update({
      where: { id: validated.coachId },
      data: {
        status: validated.status,
        reviewNote: validated.reviewNote,
        reviewedAt: new Date(),
        reviewedBy: validated.reviewerId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: validated.status === 'active' ? '审核通过' : '已驳回',
      coach: updatedCoach,
    });
  } catch (error) {
    console.error('审核教练失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '审核失败，请稍后重试' },
      { status: 500 }
    );
  }
}
