'use client';
import { useState } from 'react';
import type { Todo } from '@/types/todo';

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onEdit: (id: number, newText: string) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.todo);

  const handleEdit = () => {
    if (isEditing) {
      if (editText.trim()) {
        onEdit(todo.id, editText);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <li className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 cursor-pointer p-2 ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {todo.todo}
        </span>
      )}

      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
          todo.completed
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
      >
        {todo.completed ? 'Completed' : 'Incomplete'}
      </button>

      <button
        onClick={handleEdit}
        className="ml-2 text-blue-700 hover:text-blue-400 px-2 py-1 text-sm font-medium"
      >
        {isEditing ? 'Save' : 'Edit'}
      </button>

      <button
        onClick={() => {
          if (confirm('Delete this todo?')) onDelete(todo.id);
        }}
        className="ml-2 text-red-500 hover:text-red-700 px-2 py-1 text-sm font-medium"
      >
        Delete
      </button>
    </li>
  );
}