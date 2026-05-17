import api from './axios';
import type { Subject } from '../types';

export const getSubjects = async (semesterId: number) => {
  const response = await api.get<Subject[]>(`/semesters/${semesterId}/subjects`);
  return response.data;
};

export const createSubject = async (semesterId: number, data: { name: string; coefficient: number }) => {
  const response = await api.post<Subject>(`/semesters/${semesterId}/subjects`, data);
  return response.data;
};

export const updateSubjectCoeff = async (id: number, coefficient: number) => {
  const response = await api.patch<Subject>(`/subjects/${id}`, { coefficient });
  return response.data;
};

export const deleteSubject = async (id: number) => {
  await api.delete(`/subjects/${id}`);
};
