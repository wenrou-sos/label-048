import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      validated.password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    let studentId = null;
    let coachId = null;

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      studentId = student?.id || null;
    } else if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      coachId = coach?.id || null;
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '登录成功',
      user: userWithoutPassword,
      studentId,
      coachId,
    });
  } catch (error) {
    console.error('登录失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
