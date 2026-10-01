import axios from "axios";

// Central axios instance.
// `withCredentials: true` is what makes the browser send the httpOnly
// JWT cookie automatically on every request - this is the entire reason
// we never touch localStorage anywhere in this app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
