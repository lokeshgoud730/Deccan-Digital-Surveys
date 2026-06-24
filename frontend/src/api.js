import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Dynamically align host to prevent SameSite cookie issues (localhost vs 127.0.0.1)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to handle automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Send post request to refresh endpoint. The browser will automatically
        // send the HttpOnly refresh token cookie, and receive the new access token cookie.
        await axios.post(`${API_BASE_URL}/token/refresh/`, {}, { withCredentials: true });
        
        // Retry the original request (which will now have the new access cookie)
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('is_admin');
        localStorage.removeItem('admin_username');
        // If already on login, do not loop
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
