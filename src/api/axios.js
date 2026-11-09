import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is not defined. Check your .env file.");
}

// Main instance used by the whole app
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends the httpOnly accessToken + refreshToken cookies
});

// Bare instance for the refresh call only (no interceptors => no refresh loops)
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// App.jsx registers this so we can switch to the login screen without a page reload
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const forceLogout = () => {
  localStorage.removeItem("accessToken");
  if (onUnauthorized) onUnauthorized();
};

// 401 on these routes means "wrong credentials", not "session expired"
const PUBLIC_AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh"];
const isPublicAuthRoute = (url = "") =>
  PUBLIC_AUTH_ROUTES.some((route) => url.includes(route));

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh: many failed requests share ONE refresh call
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((res) => {
        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw new Error("No accessToken in refresh response");
        localStorage.setItem("accessToken", newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    if (isPublicAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      forceLogout();
      return Promise.reject(error);
    }
  }
);

export default api;