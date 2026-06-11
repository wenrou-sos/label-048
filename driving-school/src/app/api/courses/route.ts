import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const courseType = searchParams.get('courseType');
    const status = searchParams.get('status') || 'active';

    const where: any = { status };
    if (coachId) where.coachId = parseInt(coachId, 10);
    if (courseType) where.courseType = courseType;

    const courses = await prisma.course.findMany({
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
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return NextResponse.json(
      { error: '获取课程列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, description, courseType, coachId, duration, price, capacity } = body;

    if (!name || !courseType || !coachId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        courseType,
        coachId: parseInt(coachId, 10),
        duration: duration || 1,
        price: price || 100,
        capacity: capacity || 1,
        status: 'active',
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
      },
    });

    return NextResponse.json(
      { message: '课程创建成功', course },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建课程失败:', error);
    return NextResponse.json(
      { error: '创建课程失败' },
      { status: 500 }
    );
  }
}
