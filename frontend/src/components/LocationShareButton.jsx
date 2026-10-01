import React, { useState } from "react";
import { FiNavigation } from "react-icons/fi";
import api from "../services/api";

const LocationShareButton = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("");

  const toggle = () => {
    if (active) {
      setActive(false);
      setStatus("Location sharing off");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await api.post("/location", { lat: latitude, lng: longitude, sharingActive: true });
          setActive(true);
          setStatus("Location sharing on");
        } catch (err) {
          setStatus("Could not update location on server");
        }
      },
      () => setStatus("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center">
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium shadow-lg transition-colors ${
          active
            ? "bg-accent-green text-navy-950 shadow-green-500/30"
            : "glass text-white hover:bg-white/10"
        }`}
      >
        <FiNavigation size={16} />
        {active ? "Sharing Location" : "Share Location"}
      </button>
      {status && <span className="text-xs text-white/50 mt-2">{status}</span>}
    </div>
  );
};

export default LocationShareButton;
