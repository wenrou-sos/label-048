import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const licenseType = searchParams.get('licenseType');

    const where: any = {};
    if (status) {
      where.status = status;
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
          },
        },
        courses: {
          where: {
            status: 'active',
          },
        },
        reviews: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            students: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json({ coaches });
  } catch (error) {
    console.error('获取教练列表失败:', error);
    return NextResponse.json(
      { error: '获取教练列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId, bio, specialties, licenseNumber, experience, pricePerHour } = body;

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const coach = await prisma.coach.create({
      data: {
        userId,
        bio,
        specialties,
        licenseNumber,
        experience: experience || 0,
        pricePerHour: pricePerHour || 100,
        status: 'active',
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

    return NextResponse.json(
      { message: '教练信息创建成功', coach },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建教练失败:', error);
    return NextResponse.json(
      { error: '创建教练失败' },
      { status: 500 }
    );
  }
}
