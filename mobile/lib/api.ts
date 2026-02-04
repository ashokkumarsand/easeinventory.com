import Constants from 'expo-constants';
import { useAuth } from './auth';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://easeinventory.com/api';

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

/**
 * API client for making authenticated requests
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  // Add auth token if authenticated
  if (authenticated) {
    const token = useAuth.getState().token;
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));

    // Handle auth errors
    if (response.status === 401) {
      useAuth.getState().logout();
    }

    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// API endpoints
export const api = {
  // Products
  products: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/products${query}`);
    },
    get: (id: string) => apiRequest(`/products/${id}`),
    create: (data: any) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  },

  // Barcode
  barcode: {
    lookup: (code: string) => apiRequest(`/barcode/lookup?code=${code}`),
    generate: () => apiRequest('/barcode/generate', { method: 'POST' }),
  },

  // Invoices
  invoices: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/invoices${query}`);
    },
    get: (id: string) => apiRequest(`/invoices/${id}`),
    create: (data: any) => apiRequest('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Repairs
  repairs: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return apiRequest(`/repairs${query}`);
    },
    get: (id: string) => apiRequest(`/repairs/${id}`),
    create: (data: any) => apiRequest('/repairs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/repairs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Dashboard
  dashboard: {
    stats: () => apiRequest('/dashboard/stats'),
    stockFlow: () => apiRequest('/dashboard/stock-flow'),
  },
};
