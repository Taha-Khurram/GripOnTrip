/**
 * Axios instance for the Grip On Trip API.
 *
 * Adds the auth token to outgoing requests and normalizes errors into a
 * predictable `ApiError` shape. Token refresh / logout-on-401 can be wired in
 * the response interceptor once the auth endpoints are finalized.
 */
import axios, { AxiosError, type AxiosInstance } from 'axios';

import { env } from '@/config/env';
import type { ApiError } from '@/types';
import { secureStorage, StorageKeys } from '@/lib/storage';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.get(StorageKeys.authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    const normalized: ApiError = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ??
        error.message ??
        'Something went wrong. Please try again.',
      code: error.response?.data?.code,
    };
    return Promise.reject(normalized);
  },
);

/** Convenience wrapper that returns the response body directly. */
export async function apiGet<T>(url: string, params?: object) {
  const { data } = await apiClient.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await apiClient.post<T>(url, body);
  return data;
}
