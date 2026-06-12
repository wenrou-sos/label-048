import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
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
        role: 'COACH',
        coach: {
          create: {
            bio: validated.bio,
            specialties: validated.specialties,
            experience: 0,
            rating: 0,
            totalReviews: 0,
            pricePerHour: 100,
            status: 'pending',
          },
        },
      },
      include: {
        coach: true,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: '注册成功，请等待管理员审核', 
        user: userWithoutPassword,
        coach: user.coach,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('教练注册失败:', error);
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
