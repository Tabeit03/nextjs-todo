// src/types/todo.ts

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFormData {
  todo?: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}