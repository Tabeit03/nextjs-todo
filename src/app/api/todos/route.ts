import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all todos for logged-in user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;
    const userId = parseInt(session.user.id);

    const where: any = { userId };

    if (search) {
      where.todo = { contains: search, mode: 'insensitive' };
    }

    if (status === 'completed') {
      where.completed = true;
    } else if (status === 'incomplete') {
      where.completed = false;
    }

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.todo.count({ where }),
    ]);

    return NextResponse.json({
      data: todos,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('GET todos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new todo
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { todo } = body;

    if (!todo || !todo.trim()) {
      return NextResponse.json({ error: 'Todo text is required' }, { status: 400 });
    }

    const newTodo = await prisma.todo.create({
      data: {
        todo: todo.trim(),
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('POST todo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}