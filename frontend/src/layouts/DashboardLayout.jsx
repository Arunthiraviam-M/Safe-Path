import React from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import { useAuth } from "../context/AuthContext";
import { FiUser } from "react-icons/fi";

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex bg-navy-950 min-h-screen">
      <Sidebar />

      <div className="flex-1 relative">
        {/* Fixed top-right profile chip - stays in place on every page, links to Profile */}
        <Link
          to="/profile"
          className="fixed top-5 right-6 z-[100] glass rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FiUser size={16} />
          </div>
          <span className="text-sm font-medium">
            {user ? `${user.firstName} ${user.lastName}` : "..."}
          </span>
        </Link>

        <main className="p-8 pt-24">
          <Outlet />
        </main>

        {/* SOS is global (every page) and must always render above the Leaflet
            map, which uses its own internal z-index stack (~400-1000 on some
            panes). z-[9999] guarantees it's never hidden behind the map. */}
        <SOSButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
