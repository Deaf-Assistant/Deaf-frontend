
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
// const USE_MOCK = !API_BASE_URL;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    return fetchAPI<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: { name: string; email: string; password: string; role: string }) {
    return fetchAPI<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Courses API
export const coursesApi = {
  async getAll() {
    return fetchAPI<any[]>('/courses');
  },

  async getById(id: string) {
    return fetchAPI<any>(`/courses/${id}`);
  },

  async create(data: any) {
    return fetchAPI<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return fetchAPI<any>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI<void>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Vocabulary API
export const vocabularyApi = {
  async getAll(courseId?: string) {
    const url = courseId ? `/vocabularies?courseId=${courseId}` : '/vocabularies';
    return fetchAPI<any[]>(url);
  },

  async getById(id: string) {
    return fetchAPI<any>(`/vocabularies/${id}`);
  },

  async search(keyword: string, courseId?: string) {
    const params = new URLSearchParams({ q: keyword });
    if (courseId) params.append('courseId', courseId);
    return fetchAPI<any[]>(`/vocabularies/search?${params}`);
  },

  async create(data: any) {
    return fetchAPI<any>('/vocabularies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return fetchAPI<any>(`/vocabularies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI<void>(`/vocabularies/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reports API
export const reportsApi = {
  async getAll() {
    return fetchAPI<any[]>('/reports');
  },

  async create(data: any) {
    return fetchAPI<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: string) {
    return fetchAPI<any>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// File Upload API
export const uploadApi = {
  async uploadFile(file: File, type: 'image' | 'video') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};
