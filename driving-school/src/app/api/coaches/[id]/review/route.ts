import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectReason: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const coachId = parseInt(id, 10);
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: '教练不存在' }, { status: 404 });
    }

    if (coach.status === 'active' || coach.status === 'rejected') {
      return NextResponse.json(
        { error: '该教练已审核，无需重复操作' },
        { status: 400 }
      );
    }

    let newStatus = validated.action === 'approve' ? 'active' : 'rejected';

    const updatedCoach = await prisma.coach.update({
      where: { id: coachId },
      data: {
        status: newStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: validated.action === 'approve' ? '审核通过' : '已驳回',
      coach: updatedCoach,
    });
  } catch (error) {
    console.error('审核失败:', error);
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
