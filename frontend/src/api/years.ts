import api from './axios';
import type { Year } from '../types';

export const getYears = async () => {
  const response = await api.get<Year[]>('/years');
  return response.data;
};

export const createYear = async (name: string) => {
  const response = await api.post<Year>('/years', { name });
  return response.data;
};

export const deleteYear = async (id: number) => {
  await api.delete(`/years/${id}`);
};
