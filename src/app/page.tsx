import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth ();

  if (session) {
    redirect('/todos');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d1d186]">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Todo App</h1>
        <p className="text-gray-600 mb-6">
          Manage your tasks efficiently with our simple and elegant todo application.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}