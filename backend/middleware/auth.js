import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signAndSetTokenCookie, clearTokenCookie } from "../utils/generateToken.js";

/**
 * protect()
 *
 * 1. Reads the JWT from the HTTP-only cookie (never from a header/localStorage).
 * 2. Verifies it. If it's missing, invalid, or expired -> 401, frontend redirects to /login.
 * 3. If valid: loads the user, then SLIDES the session -
 *    re-signs a fresh 30-day token and re-sets the cookie, and updates
 *    lastActive / sessionExpiry on the user document.
 *
 * This means: any authenticated request (opening the app, clicking around,
 * refreshing the dashboard) pushes the expiry another 30 days into the future.
 * If the user simply does not come back for 30 straight days, the existing
 * cookie/token expires naturally and they are logged out.
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      clearTokenCookie(res);
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearTokenCookie(res);
      return res.status(401).json({ message: "User no longer exists." });
    }

    // --- Sliding expiration: refresh the cookie + DB record on every request ---
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    signAndSetTokenCookie(res, user._id);
    user.lastActive = new Date();
    user.sessionExpiry = newExpiry;
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ message: "Server error during authentication." });
  }
};
