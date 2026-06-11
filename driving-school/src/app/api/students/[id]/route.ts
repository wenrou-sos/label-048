import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  licenseType: z.enum(['C1', 'C2', 'B1', 'B2', 'A1', 'A2', 'A3', 'D', 'E', 'F']).optional(),
  studyPhase: z.enum(['SUBJECT_1', 'SUBJECT_2', 'SUBJECT_3', 'SUBJECT_4', 'COMPLETED']).optional(),
  licenseStatus: z.enum(['NOT_APPLIED', 'APPLYING', 'LEARNING', 'TESTING', 'OBTAINED', 'REVOKED']).optional(),
  coachId: z.number().optional(),
  totalHours: z.number().optional(),
  completedHours: z.number().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const studentId = parseInt(id, 10);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
        bookings: {
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
          },
          orderBy: {
            date: 'desc',
          },
        },
        examRecords: {
          orderBy: {
            examDate: 'desc',
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: '学员不存在' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('获取学员详情失败:', error);
    return NextResponse.json(
      { error: '获取学员详情失败' },
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
    const studentId = parseInt(id, 10);
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '学员不存在' }, { status: 404 });
    }

    const { name, phone, ...studentData } = validated;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: studentData,
      include: {
        user: true,
      },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: updatedStudent.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    return NextResponse.json({
      message: '更新成功',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('更新学员信息失败:', error);
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
