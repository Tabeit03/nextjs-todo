import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single todo
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: parseInt(params.id),
        userId: parseInt(session.user.id),
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('GET todo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update todo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { todo, completed } = body;

    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: parseInt(params.id),
        userId: parseInt(session.user.id),
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(todo !== undefined && { todo }),
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('PUT todo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE todo
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: parseInt(params.id),
        userId: parseInt(session.user.id),
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('DELETE todo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}