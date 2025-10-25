
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import TodoList from '@/components/TodoList';

export default async function TodosPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <TodoList />;
}