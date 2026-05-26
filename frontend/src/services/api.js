import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ===== Request Interceptor — แนบ token ทุก request =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor — จัดการ error กลาง =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';

    // Token หมดอายุ หรือ invalid → logout
    // ❗ ข้าม /auth/login และ /auth/register — เพราะ 401 ตรงนั้นคือ "รหัสผ่านผิด"
    //    ไม่ใช่ token หมดอายุ → ถ้าไม่ข้าม จะ redirect loop
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

// ===== Auth API =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

// ===== Tasks API =====
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  deleteMany: (ids) => api.delete('/tasks/bulk', { data: { ids } }),
};

export default api;
