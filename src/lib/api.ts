const EDGE_FUNCTION_BASE = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${EDGE_FUNCTION_BASE}/functions/v1/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const categoriesApi = {
  getAll: () => apiFetch('categories'),
  create: (data: any) => apiFetch('categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`categories?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`categories?id=${id}`, {
    method: 'DELETE',
  }),
};

export const funnelsApi = {
  getAll: () => apiFetch('funnels'),
  getOne: (id: string) => apiFetch(`funnels?id=${id}`),
  create: (data: any) => apiFetch('funnels', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`funnels?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`funnels?id=${id}`, {
    method: 'DELETE',
  }),
};

export const funnelStepsApi = {
  getAll: (funnelId: string) => apiFetch(`funnel-steps?funnel_id=${funnelId}`),
  create: (data: any) => apiFetch('funnel-steps', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`funnel-steps?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`funnel-steps?id=${id}`, {
    method: 'DELETE',
  }),
};

export const messagesApi = {
  getAll: (category?: string) => apiFetch(`messages${category ? `?category=${category}` : ''}`),
  getOne: (id: string) => apiFetch(`messages?id=${id}`),
  create: (data: any) => apiFetch('messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`messages?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`messages?id=${id}`, {
    method: 'DELETE',
  }),
};
