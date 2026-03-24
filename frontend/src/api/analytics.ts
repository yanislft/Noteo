import api from './axios';
import type { Analytics } from '../types';

export const getGlobalAnalytics = async () => {
  const response = await api.get<Analytics>('/analytics/global');
  return response.data;
};

export const getYearAnalytics = async (id: number) => {
  const response = await api.get<Analytics>(`/analytics/year/${id}`);
  return response.data;
};

export const getSemesterAnalytics = async (id: number) => {
  const response = await api.get<Analytics>(`/analytics/semester/${id}`);
  return response.data;
};

export const getSubjectAnalytics = async (id: number) => {
  const response = await api.get<Analytics>(`/analytics/subject/${id}`);
  return response.data;
};
