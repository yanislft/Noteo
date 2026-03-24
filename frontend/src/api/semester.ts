import api from './axios';
import type { Semester } from '../types';

export const getSemesters = async (yearId: number) => {
  const response = await api.get<Semester[]>(`/years/${yearId}/semesters`);
  return response.data;
};

export const createSemester = async (yearId: number, name: string) => {
  const response = await api.post<Semester>(`/years/${yearId}/semesters`, { name });
  return response.data;
};

export const deleteSemester = async (id: number) => {
  await api.delete(`/semesters/${id}`);
};
