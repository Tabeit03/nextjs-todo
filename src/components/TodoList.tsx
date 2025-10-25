'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TodoItem from './TodoItem';
import type { Todo, ApiResponse } from '@/types/todo';

const todoApi = {
  getTodos: async (page: number, limit: number, search: string, status: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });
    const res = await fetch(`/api/todos?${params}`);
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json() as Promise<ApiResponse<Todo>>;
  },
  addTodo: async (todo: string) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo }),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    return res.json();
  },
  updateTodo: async (id: number, data: { todo?: string; completed?: boolean }) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  },
  deleteTodo: async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
  },
};

export default function TodoList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [newTodo, setNewTodo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 5;

  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', page, limit, searchText, filterStatus],
    queryFn: () => todoApi.getTodos(page, limit, searchText, filterStatus),
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: todoApi.addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo('');
      router.push('?page=1');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => todoApi.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addMutation.mutate(newTodo.trim());
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateMutation.mutate({ id, data: { completed } });
  };

  const handleEdit = (id: number, todo: string) => {
    updateMutation.mutate({ id, data: { todo } });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading todos</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#3a66bf]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Todo List</h1>

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1 font-medium p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={addMutation.isPending}
        />
        <button
          type="submit"
          disabled={addMutation.isPending || !newTodo.trim()}
          className="bg-gray-50 font-bold py-3 px-6 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          {addMutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Search by title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 p-3 font-medium border border-gray-300 rounded-lg"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            router.push('?page=1');
          }}
          className="p-3 font-medium border border-gray-300 rounded-lg"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {/* Todo Items */}
      <ul className="space-y-4 mb-6">
        {!data || data.data.length === 0 ? (
          <li className="text-center py-8 font-bold text-[#f1bcbc]">NO TODOS FOUND.</li>
        ) : (
          data.data.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-4 text-sm">
          <button
            disabled={page === 1}
            onClick={() => router.push('?page=1')}
            className="px-3 py-2 font-medium bg-gray-300 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            « Back to page 1
          </button>
          <button
            disabled={page === 1}
            onClick={() => router.push(`?page=${page - 1}`)}
            className="px-3 py-2 font-medium bg-gray-300 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹ Prev
          </button>
          <span className="px-3 py-2 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => router.push(`?page=${page + 1}`)}
            className="px-3 py-2 font-medium bg-gray-300 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next ›
          </button>
        </nav>
      )}
    </div>
  );
}