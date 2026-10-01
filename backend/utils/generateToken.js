import jwt from "jsonwebtoken";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Signs a JWT for the given user id and sets it as an HTTP-only cookie.
 * This is called both at login AND on every authenticated request
 * (see middleware/auth.js) to implement sliding expiration.
 */
export const signAndSetTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true, // JS on the frontend can never read this - not localStorage, not document.cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: THIRTY_DAYS_MS,
    path: "/",
  });

  return token;
};

export const clearTokenCookie = (res) => {
  res.clearCookie("token", { path: "/" });
};

export const THIRTY_DAYS = THIRTY_DAYS_MS;
