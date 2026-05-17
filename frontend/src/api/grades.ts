import api from './axios';
import type { Grade } from '../types';

export const getGrades = async (subjectId: number) => {
  const response = await api.get<Grade[]>(`/subjects/${subjectId}/grades`);
  return response.data;
};

export const createGrade = async (subjectId: number, data: { name: string; value: number; coefficient: number }) => {
  const response = await api.post<Grade>(`/subjects/${subjectId}/grades`, data);
  return response.data;
};

export const updateGrade = async (id: number, data: { value?: number; coefficient?: number }) => {
  const response = await api.patch<Grade>(`/grades/${id}`, data);
  return response.data;
};

export const deleteGrade = async (id: number) => {
  await api.delete(`/grades/${id}`);
};
