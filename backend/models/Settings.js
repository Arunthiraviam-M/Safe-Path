import mongoose from "mongoose";

// Kept separate from User.preferences to support future expansion
// (e.g. per-device settings) without bloating the User document.
const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    privacy: {
      shareLocationWithContacts: { type: Boolean, default: false },
      shareJourneyHistory: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
