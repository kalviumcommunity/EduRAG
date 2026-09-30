const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach EduRAG. Check that the backend is running.', 0);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) sessionStorage.removeItem('edurag_token');
    throw new ApiError(data?.message || `Request failed (${response.status}).`, response.status);
  }
  return data;
}

export const api = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token) => apiRequest('/auth/me', { token }),
  courses: (token) => apiRequest('/courses', { token }),
  createCourse: (token, body) => apiRequest('/courses', { token, method: 'POST', body: JSON.stringify(body) }),
  sessions: (token) => apiRequest('/chat/sessions?page_size=100', { token }),
  session: (token, id) => apiRequest(`/chat/sessions/${id}`, { token }),
  ask: (token, body) => apiRequest('/chat', { token, method: 'POST', body: JSON.stringify(body) }),
  documents: (token, courseId) => apiRequest(`/documents?course_id=${courseId}&page_size=100`, { token }),
  upload: (token, form) => apiRequest('/documents/upload', { token, method: 'POST', body: form }),
  checkQuota: (body) => apiRequest('/quota/check', { method: 'POST', body: JSON.stringify(body) }),
  currentQuota: (token) => apiRequest('/quota/current', { token }),
  publishedLimits: (token) => apiRequest('/quota/published-limits', { token }),
};
