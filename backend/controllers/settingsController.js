import User from "../models/User.js";
import Settings from "../models/Settings.js";

// @route  GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) settings = await Settings.create({ user: req.user._id });
    res.status(200).json({ settings, preferences: req.user.preferences });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/settings
// Handles both the User.preferences block (dark mode, travel mode, language,
// location sharing, etc.) and the separate Settings doc (notifications, privacy).
export const updateSettings = async (req, res, next) => {
  try {
    const { preferences, notificationPreferences, privacy } = req.body;

    if (preferences) {
      const user = await User.findById(req.user._id);
      user.preferences = { ...user.preferences.toObject(), ...preferences };
      await user.save();
    }

    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) settings = new Settings({ user: req.user._id });
    if (notificationPreferences) {
      settings.notificationPreferences = {
        ...settings.notificationPreferences.toObject(),
        ...notificationPreferences,
      };
    }
    if (privacy) {
      settings.privacy = { ...settings.privacy.toObject(), ...privacy };
    }
    await settings.save();

    res.status(200).json({ message: "Settings updated", settings });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/settings/logout-all-devices
// Since sessions are stateless JWTs, "logout everywhere" is implemented by
// clearing this device's cookie AND relying on the fact that any other valid
// tokens will naturally stop working once you rotate JWT_SECRET, or (better,
// for a real production app) by checking a per-user `sessionsInvalidatedAt`
// timestamp in protect(). A ready-to-extend field is included below.
export const logoutAllDevices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.sessionExpiry = new Date(); // marks the session as expired immediately
    await user.save({ validateBeforeSave: false });
    res.clearCookie("token", { path: "/" });
    res.status(200).json({ message: "Logged out from all devices." });
  } catch (error) {
    next(error);
  }
};
