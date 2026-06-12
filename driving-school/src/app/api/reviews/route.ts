import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
  studentId: z.number(),
  coachId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const checkEligibilitySchema = z.object({
  studentId: z.coerce.number(),
  coachId: z.coerce.number(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const coachId = searchParams.get('coachId');

    if (!studentId || !coachId) {
      return NextResponse.json(
        { error: '缺少参数' },
        { status: 400 }
      );
    }

    const validated = checkEligibilitySchema.parse({ studentId, coachId });

    const existingReview = await prisma.review.findFirst({
      where: {
        studentId: validated.studentId,
        coachId: validated.coachId,
      },
    });

    const hasCompletedBooking = await prisma.booking.findFirst({
      where: {
        studentId: validated.studentId,
        coachId: validated.coachId,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({
      canReview: !!hasCompletedBooking && !existingReview,
      hasCompletedBooking: !!hasCompletedBooking,
      hasExistingReview: !!existingReview,
      existingReview: existingReview || null,
    });
  } catch (error) {
    console.error('检查评价资格失败:', error);
    return NextResponse.json(
      { error: '检查失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    const existingReview = await prisma.review.findFirst({
      where: {
        studentId: validated.studentId,
        coachId: validated.coachId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: '您已经评价过该教练了' },
        { status: 400 }
      );
    }

    const hasCompletedBooking = await prisma.booking.findFirst({
      where: {
        studentId: validated.studentId,
        coachId: validated.coachId,
        status: 'COMPLETED',
      },
    });

    if (!hasCompletedBooking) {
      return NextResponse.json(
        { error: '您需要先完成该教练的课程才能评价' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        studentId: validated.studentId,
        coachId: validated.coachId,
        rating: validated.rating,
        comment: validated.comment,
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
      },
    });

    const coachReviews = await prisma.review.findMany({
      where: { coachId: validated.coachId },
      select: { rating: true },
    });

    const totalReviews = coachReviews.length;
    const averageRating =
      totalReviews > 0
        ? coachReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await prisma.coach.update({
      where: { id: validated.coachId },
      data: {
        rating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
      },
    });

    return NextResponse.json(
      {
        message: '评价成功',
        review,
        newRating: parseFloat(averageRating.toFixed(1)),
        newTotalReviews: totalReviews,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建评价失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '评价失败，请稍后重试' },
      { status: 500 }
    );
  }
}
