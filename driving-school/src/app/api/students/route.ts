import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  licenseType: z.enum(['C1', 'C2', 'B1', 'B2', 'A1', 'A2', 'A3', 'D', 'E', 'F']).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone,
        role: 'STUDENT',
        student: {
          create: {
            licenseType: validated.licenseType || 'C1',
            studyPhase: 'SUBJECT_1',
            licenseStatus: 'NOT_APPLIED',
            enrollDate: new Date(),
          },
        },
      },
      include: {
        student: true,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: '注册成功', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
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
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('获取学员列表失败:', error);
    return NextResponse.json(
      { error: '获取学员列表失败' },
      { status: 500 }
    );
  }
}
