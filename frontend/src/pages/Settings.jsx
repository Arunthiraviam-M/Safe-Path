import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// Inline styles here are deliberate, not Tailwind classes - a plain px-based
// transform guarantees the dot is always fully inside the track with no
// build/purge edge cases, regardless of Tailwind config.
const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const DOT_SIZE = 20;
const DOT_MARGIN = 2;

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={checked}
    style={{
      width: TRACK_WIDTH,
      height: TRACK_HEIGHT,
      borderRadius: 999,
      position: "relative",
      border: "none",
      cursor: "pointer",
      flexShrink: 0,
      backgroundColor: checked ? "#06B6D4" : "rgba(255,255,255,0.15)",
      transition: "background-color 0.2s ease",
      padding: 0,
    }}
  >
    <span
      style={{
        position: "absolute",
        top: DOT_MARGIN,
        left: checked ? TRACK_WIDTH - DOT_SIZE - DOT_MARGIN : DOT_MARGIN,
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    />
  </button>
);

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <span className="text-sm text-white/80">{label}</span>
    {children}
  </div>
);

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState(user?.preferences || {});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.preferences) setPrefs(user.preferences);
  }, [user]);

  const updatePref = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await api.put("/settings", { preferences: { [key]: value } });
    setUser((u) => ({ ...u, preferences: updated }));
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/profile/change-password", passwordForm);
      setMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not change password.");
    }
  };

  const logoutAllDevices = async () => {
    await api.post("/settings/logout-all-devices");
    await logout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-2">{t("settings")}</h1>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-cyan-400 mb-2">{t("account")}</h2>
        <form onSubmit={changePassword} className="grid gap-3 mt-3">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="bg-navy-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <input
            type="password"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="bg-navy-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" className="justify-self-start px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm">
            {t("change_password")}
          </button>
        </form>
        {message && <p className="text-sm text-white/60 mt-2">{message}</p>}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-cyan-400 mb-2">{t("privacy")}</h2>
        <Row label={t("location_sharing")}>
          <Toggle checked={!!prefs.locationSharing} onChange={() => updatePref("locationSharing", !prefs.locationSharing)} />
        </Row>
        <Row label={t("emergency_alerts")}>
          <Toggle checked={!!prefs.emergencyAlerts} onChange={() => updatePref("emergencyAlerts", !prefs.emergencyAlerts)} />
        </Row>
        <Row label={t("journey_monitoring")}>
          <Toggle checked={!!prefs.journeyMonitoring} onChange={() => updatePref("journeyMonitoring", !prefs.journeyMonitoring)} />
        </Row>
        <Row label={t("safety_notifications")}>
          <Toggle checked={!!prefs.safetyNotifications} onChange={() => updatePref("safetyNotifications", !prefs.safetyNotifications)} />
        </Row>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-cyan-400 mb-2">{t("preferences")}</h2>
        <Row label={t("dark_mode")}>
          <Toggle checked={!!prefs.darkMode} onChange={() => updatePref("darkMode", !prefs.darkMode)} />
        </Row>
        <Row label={t("default_travel_mode")}>
          <select
            value={prefs.defaultTravelMode}
            onChange={(e) => updatePref("defaultTravelMode", e.target.value)}
            className="bg-navy-800 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="walking">Walking</option>
            <option value="bicycle">Bicycle</option>
            <option value="two_wheeler">Two Wheeler</option>
            <option value="car">Car</option>
            <option value="public_transport">Public Transport</option>
          </select>
        </Row>
        <Row label={t("language")}>
          <select
            value={prefs.language}
            onChange={(e) => updatePref("language", e.target.value)}
            className="bg-navy-800 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
          </select>
        </Row>
      </div>

      <button
        onClick={logoutAllDevices}
        className="px-5 py-3 rounded-xl bg-accent-red/15 text-accent-red hover:bg-accent-red/25 text-sm font-medium"
      >
        {t("logout_all_devices")}
      </button>
    </div>
  );
};

export default Settings;
