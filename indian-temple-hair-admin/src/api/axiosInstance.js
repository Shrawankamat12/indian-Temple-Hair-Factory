import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://indian-temple-hair-factory-production.up.railway.app/api/v1',
  withCredentials: true, // send httpOnly cookie
});

// fallback: also attach bearer token if stored (in case cookies are blocked cross-site)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ith_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// import.meta.env.BASE_URL = '/admin/' in production (from vite base), '/' in dev if base unset
const ADMIN_BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // "/admin"
const LOGIN_PATH = `${ADMIN_BASE}/login`;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ith_admin_token');
      // Avoid an infinite reload loop: only force-navigate when we're not
      // already on the login page (getMe() on the login page itself will
      // also 401 for a logged-out visitor — that's expected, not an error).
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.href = LOGIN_PATH;
      }
    }
    return Promise.reject(err);
  }
);

export default api;