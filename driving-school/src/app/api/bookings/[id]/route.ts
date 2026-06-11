import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

const updateSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  notes: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const bookingId = parseInt(id, 10);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        coach: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        course: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('获取预约详情失败:', error);
    return NextResponse.json(
      { error: '获取预约详情失败' },
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
    const bookingId = parseInt(id, 10);
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: validated.status,
        notes: validated.notes,
      },
      include: {
        student: true,
      },
    });

    if (validated.status === 'CONFIRMED') {
      await prisma.notification.create({
        data: {
          studentId: booking.studentId,
          title: '预约已确认',
          content: `您的预约已被教练确认，请准时到达。`,
          type: 'booking',
        },
      });
    } else if (validated.status === 'CANCELLED') {
      await prisma.notification.create({
        data: {
          studentId: booking.studentId,
          title: '预约已取消',
          content: `您的预约已被取消，如有疑问请联系客服。`,
          type: 'booking',
        },
      });

      if (booking.scheduleId) {
        await prisma.schedule.update({
          where: { id: booking.scheduleId },
          data: { isAvailable: true },
        });
      }
    } else if (validated.status === 'COMPLETED') {
      const student = await prisma.student.findUnique({
        where: { id: booking.studentId },
      });

      if (student) {
        const duration =
          (booking.endTime.getTime() - booking.startTime.getTime()) /
          (1000 * 60 * 60);
        await prisma.student.update({
          where: { id: booking.studentId },
          data: {
            completedHours: {
              increment: duration,
            },
          },
        });
      }
    }

    return NextResponse.json({
      message: '更新成功',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('更新预约状态失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const bookingId = parseInt(id, 10);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    if (booking.scheduleId) {
      await prisma.schedule.update({
        where: { id: booking.scheduleId },
        data: { isAvailable: true },
      });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: '预约已删除' });
  } catch (error) {
    console.error('删除预约失败:', error);
    return NextResponse.json(
      { error: '删除失败，请稍后重试' },
      { status: 500 }
    );
  }
}
