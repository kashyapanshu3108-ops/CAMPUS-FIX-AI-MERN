import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("campusfix_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralize "session expired" handling: if any request comes back 401,
// clear the stored session so the app redirects to Login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("campusfix_token");
      localStorage.removeItem("campusfix_user");
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into a short, friendly message for the UI.
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default api;
