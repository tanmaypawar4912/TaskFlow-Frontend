import api from './api';
import type { Task, TaskFilters, TaskForm, TasksResponse } from '../types';

const toPayload = (data: TaskForm | Partial<TaskForm>) => ({
  ...data,
  ...(typeof data.tags === 'string' ? { tags: data.tags.split(',').map(v => v.trim()).filter(Boolean) } : {}),
  ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : { dueDate: undefined }),
});

export const getTasks = async (filters: TaskFilters = {}): Promise<TasksResponse> =>
  (await api.get<{ success: boolean; data: TasksResponse }>('/tasks', { params: filters })).data.data;

export const createTask = async (data: TaskForm): Promise<Task> =>
  (await api.post<{ success: boolean; data: { task: Task } }>('/tasks', toPayload(data))).data.data.task;

export const updateTask = async (id: string, data: Partial<TaskForm>): Promise<Task> =>
  (await api.put<{ success: boolean; data: { task: Task } }>(`/tasks/${id}`, toPayload(data))).data.data.task;

export const deleteTask = async (id: string) => { await api.delete(`/tasks/${id}`); };
export const completeTask = async (id: string) => (await api.patch<{ data: { task: Task } }>(`/tasks/${id}/complete`)).data.data.task;
export const restoreTask = async (id: string) => (await api.patch<{ data: { task: Task } }>(`/tasks/${id}/restore`)).data.data.task;
export const duplicateTask = async (id: string) => (await api.post<{ data: { task: Task } }>(`/tasks/${id}/duplicate`)).data.data.task;
