import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiMapPin, FiInfo, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const navItem =
  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <aside
      className={`h-screen sticky top-0 glass flex flex-col justify-between py-6 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div className="flex items-center justify-between px-4 mb-8">
          {!collapsed && (
            <span className="font-display font-bold text-lg text-cyan-400">SafePath AI</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/60 hover:text-white p-1"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navItem} ${isActive ? "bg-cyan-500/15 text-cyan-400" : "text-white/70 hover:bg-white/5"}`
            }
          >
            <FiHome size={18} /> {!collapsed && t("home")}
          </NavLink>
          <NavLink
            to="/safe-places"
            className={({ isActive }) =>
              `${navItem} ${isActive ? "bg-cyan-500/15 text-cyan-400" : "text-white/70 hover:bg-white/5"}`
            }
          >
            <FiMapPin size={18} /> {!collapsed && t("safe_places")}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${navItem} ${isActive ? "bg-cyan-500/15 text-cyan-400" : "text-white/70 hover:bg-white/5"}`
            }
          >
            <FiInfo size={18} /> {!collapsed && t("about_us")}
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-3">
        <div className="h-px bg-white/10 my-2" />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${navItem} ${isActive ? "bg-cyan-500/15 text-cyan-400" : "text-white/70 hover:bg-white/5"}`
          }
        >
          <FiSettings size={18} /> {!collapsed && t("settings")}
        </NavLink>
        <button
          onClick={logout}
          className={`${navItem} text-accent-red hover:bg-red-500/10 w-full text-left`}
        >
          <FiLogOut size={18} /> {!collapsed && t("logout")}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
