import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const examSchema = z.object({
  studentId: z.number(),
  examType: z.enum(['SUBJECT_1', 'SUBJECT_2', 'SUBJECT_3', 'SUBJECT_4']),
  examDate: z.string(),
  score: z.number().optional(),
  status: z.enum(['NOT_TAKEN', 'PASSED', 'FAILED']).default('NOT_TAKEN'),
  location: z.string().optional(),
  notes: z.string().optional(),
  certificateUrl: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const examType = searchParams.get('examType');
    const status = searchParams.get('status');

    const where: any = {};
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (examType) where.examType = examType;
    if (status) where.status = status;

    const examRecords = await prisma.examRecord.findMany({
      where,
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
      orderBy: {
        examDate: 'desc',
      },
    });

    return NextResponse.json({ examRecords });
  } catch (error) {
    console.error('获取考试记录失败:', error);
    return NextResponse.json(
      { error: '获取考试记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = examSchema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: validated.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '学员不存在' }, { status: 404 });
    }

    const examRecord = await prisma.examRecord.create({
      data: {
        studentId: validated.studentId,
        examType: validated.examType,
        examDate: new Date(validated.examDate),
        score: validated.score,
        status: validated.status,
        location: validated.location,
        notes: validated.notes,
        certificateUrl: validated.certificateUrl,
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

    if (validated.status === 'PASSED') {
      const phaseOrder = ['SUBJECT_1', 'SUBJECT_2', 'SUBJECT_3', 'SUBJECT_4'];
      const currentIndex = phaseOrder.indexOf(validated.examType);
      
      if (currentIndex < phaseOrder.length - 1) {
        const nextPhase = phaseOrder[currentIndex + 1] as any;
        await prisma.student.update({
          where: { id: validated.studentId },
          data: { studyPhase: nextPhase },
        });
      } else {
        await prisma.student.update({
          where: { id: validated.studentId },
          data: {
            studyPhase: 'COMPLETED',
            licenseStatus: 'OBTAINED',
          },
        });
      }

      await prisma.notification.create({
        data: {
          studentId: validated.studentId,
          title: '考试通过',
          content: `恭喜您通过了${validated.examType}考试！`,
          type: 'exam',
        },
      });
    } else if (validated.status === 'FAILED') {
      await prisma.notification.create({
        data: {
          studentId: validated.studentId,
          title: '考试未通过',
          content: `很遗憾，您的${validated.examType}考试未通过，请继续努力。`,
          type: 'exam',
        },
      });
    }

    return NextResponse.json(
      { message: '考试记录创建成功', examRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建考试记录失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '创建考试记录失败' },
      { status: 500 }
    );
  }
}
