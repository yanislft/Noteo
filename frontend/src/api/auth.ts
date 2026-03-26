import api from './axios';
import type { User } from '../types';

export const register = async (data: {
  name: string;
  firstname: string;
  email: string;
  password: string;
}) => {
  const response = await api.post<{ message: string; user: User }>('/auth/register', data);
  return response.data;
};

export const resendVerification = async (email: string) => {
  const response = await api.post('/auth/email/resend', { email });
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post<{ token: string; user: User }>('/auth/login', data);
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const me = async () => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const updateProfile = async (data: {
  name: string;
  firstname: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}) => {
  const response = await api.put<User>('/auth/profile', data);
  return response.data;
};
