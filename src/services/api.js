import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lts-dbms-backend.onrender.com/api/v1';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
// const DASHBOARD_API_BASE_URL = import.meta.env.VITE_DASHBOARD_API_BASE_URL ||
//   (import.meta.env.DEV
//     ? 'http://localhost:3007/api'
//     : API_BASE_URL.replace(/\/api\/v1\/?$/, '/api'));
const DASHBOARD_API_BASE_URL = 'https://lts-dbms-backend.onrender.com/api/'; 

export const getDashboardApiUrl = (path) =>
  `${DASHBOARD_API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token and bypass browser/304 caching for GET requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.method && config.method.toLowerCase() === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request was not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if the request was the refresh token request itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        // Clear session and redirect if no refresh token
        cleanupAuth();
        return Promise.reject(error);
      }

      try {
        // Call the refresh API using a separate axios call
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update Redux state asynchronously to avoid circular dependency
        import('../redux/store').then(({ default: store }) => {
          store.dispatch({
            type: 'auth/updateTokens',
            payload: { accessToken, refreshToken: newRefreshToken },
          });
        }).catch(err => {
          console.error('Failed to dispatch updateTokens to Redux store:', err);
        });

        // Set auth header for retry and execute queued requests
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        cleanupAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Cleanup local storage, dispatch resetAuth to store, and redirect to login page
const cleanupAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');

  // Dispatch resetAuth to Redux store
  import('../redux/store').then(({ default: store }) => {
    store.dispatch({ type: 'auth/resetAuth' });
  }).catch(err => {
    console.error('Failed to dispatch resetAuth to Redux store:', err);
  });

  // Redirect to login page
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

export default api;
