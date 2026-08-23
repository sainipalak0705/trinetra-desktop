/**
 * Centralized HTTP API Client for TRINETRA Desktop Application.
 * Handles base URL configuration, JWT Bearer header injection, and 401 auto-logout.
 */

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject JWT token if available in local prototype storage
  const token = localStorage.getItem('trinetra_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(0, `Network error: Failed to reach backend at ${API_BASE_URL}`);
  }

  if (response.status === 401) {
    // Purge local auth state on 401 Unauthorized
    localStorage.removeItem('trinetra_auth_token');
    localStorage.removeItem('trinetra_auth_user');
    window.dispatchEvent(new CustomEvent('trinetra:unauthorized'));
    
    let errorDetail = 'Unauthorized or session expired';
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // ignore json parse error
    }
    throw new ApiError(401, errorDetail);
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    let errData = null;
    try {
      errData = await response.json();
      if (errData.detail) errorDetail = errData.detail;
    } catch {
      // ignore json parse error
    }
    throw new ApiError(response.status, errorDetail, errData);
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
