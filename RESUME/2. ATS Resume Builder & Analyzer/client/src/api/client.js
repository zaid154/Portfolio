import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ats_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the session so the app redirects to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ats_token");
    }
    return Promise.reject(err);
  }
);

export default api;

// Small helper to surface a readable message from an axios error.
export function apiError(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.errors?.[0]?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}
