import api from "./api";

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const logoutRequest = () => api.post("/auth/logout");
export const getMeRequest = () => api.get("/auth/me");
export const forgotPasswordRequest = (email) => api.post("/auth/forgot-password", { email });
export const resetPasswordRequest = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });
