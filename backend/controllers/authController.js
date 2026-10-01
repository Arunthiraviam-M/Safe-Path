import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import { signAndSetTokenCookie, clearTokenCookie } from "../utils/generateToken.js";

// @route  POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, dateOfBirth, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      password, // hashed automatically by the User model's pre-save hook
    });

    await Settings.create({ user: user._id });

    const now = new Date();
    user.lastLogin = now;
    user.lastActive = now;
    user.sessionExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    signAndSetTokenCookie(res, user._id);

    res.status(201).json({ message: "Account created successfully", user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const now = new Date();
    user.lastLogin = now;
    user.lastActive = now;
    user.sessionExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    signAndSetTokenCookie(res, user._id);

    res.status(200).json({ message: "Logged in successfully", user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/auth/me
// Called once when the frontend app loads, to check "am I still logged in?"
// This is what replaces localStorage entirely - the source of truth is the
// httpOnly cookie + this endpoint, never client-side storage.
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/forgot-password
// Generates a reset token and stores its hash + expiry on the user.
// In production you would email the raw token as a link; here we return
// a message and (in development only) the token so you can test the flow.
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way whether or not the user exists,
    // so attackers can't use this endpoint to discover valid emails.
    const genericResponse = {
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    if (!user) return res.status(200).json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      ...genericResponse,
      devOnlyResetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset. You can now log in." });
  } catch (error) {
    next(error);
  }
};
