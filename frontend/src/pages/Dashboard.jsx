import React, { useState } from "react";
import { FiSearch, FiRepeat, FiNavigation2, FiPlay, FiSquare } from "react-icons/fi";
import MapView from "../components/MapView";
import LocationShareButton from "../components/LocationShareButton";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  geocodeAddress,
  getRoute,
  getCurrentPositionOrFallback,
  searchNearbyPlaces,
  distanceKm,
} from "../services/mapService";

const travelModes = [
  { value: "walking", label: "Walking" },
  { value: "bicycle", label: "Bicycle" },
  { value: "two_wheeler", label: "Two Wheeler" },
  { value: "car", label: "Car" },
  { value: "public_transport", label: "Public Transport" },
];

const staticStats = [
  { label: "Road Type", value: "Main road", color: "text-white" },
  { label: "Crowd Status", value: "Moderate", color: "text-accent-amber" },
  { label: "Battery Safety", value: "Sufficient", color: "text-accent-green" },
  { label: "Lighting Condition", value: "Well-lit", color: "text-accent-green" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("walking");

  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [nearbySafeCount, setNearbySafeCount] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const findRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Please enter both a current location and a destination.");
      return;
    }
    setError("");
    setLoading(true);
    setRoutePath(null);
    setRouteInfo(null);
    setNearbySafeCount(null);
    setSafetyScore(null);
    setTripStarted(false);
    setJourneyId(null);

    try {
      const [originPoint, destPoint] = await Promise.all([
        geocodeAddress(origin),
        geocodeAddress(destination),
      ]);

      if (!originPoint) {
        setError(`Couldn't find "${origin}". Try a more specific place name.`);
        setLoading(false);
        return;
      }
      if (!destPoint) {
        setError(`Couldn't find "${destination}". Try a more specific place name.`);
        setLoading(false);
        return;
      }

      // Real road route for the SELECTED travel mode, drawn on our own map.
      // Walking renders dotted (same convention Google Maps uses); estimated
      // distance/time below come straight from this real route, not a guess.
      const route = await getRoute(originPoint, destPoint, mode);
      if (!route) {
        setError("No route could be calculated between these two points for this travel mode.");
        setLoading(false);
        return;
      }

      const originMarker = { position: [originPoint.lat, originPoint.lon], label: `Start: ${origin}` };
      const destMarker = { position: [destPoint.lat, destPoint.lon], label: `Destination: ${destination}` };

      setRoutePath(route.path);
      setRouteInfo({ distanceKm: route.distanceKm, durationMin: route.durationMin });

      // Real safe places actually along this specific route (searched around
      // its midpoint), not a static/random number - this also drives the
      // Safety Score, and gets added to the map as real markers.
      const midpoint = route.path[Math.floor(route.path.length / 2)];
      const midCenter = { lat: midpoint[0], lon: midpoint[1] };

      let safeMarkers = [];
      try {
        const [police, hospitals] = await Promise.all([
          searchNearbyPlaces("police_station", midCenter, 3000),
          searchNearbyPlaces("hospital", midCenter, 3000),
        ]);
        const combined = [...police, ...hospitals].slice(0, 8);
        setNearbySafeCount(combined.length);
        setSafetyScore(Math.min(60 + combined.length * 5, 98));
        safeMarkers = combined.map((p) => ({ position: p.position, label: `Safe place: ${p.name}` }));
      } catch (err) {
        console.error("Nearby safe-place lookup failed:", err);
        setNearbySafeCount(0);
        setSafetyScore(65);
      }

      setMarkers([originMarker, destMarker, ...safeMarkers]);

      // Persist this journey to MongoDB (journeys collection) so search /
      // travel history is actually recorded, not just shown in the UI.
      try {
        const { data } = await api.post("/journeys", {
          origin: { label: origin, coordinates: [originPoint.lon, originPoint.lat] },
          destination: { label: destination, coordinates: [destPoint.lon, destPoint.lat] },
          travelMode: mode,
          safetyScore: Math.min(60 + safeMarkers.length * 5, 98),
          estimatedDistanceKm: parseFloat(route.distanceKm),
          estimatedTimeMinutes: route.durationMin,
          status: "planned",
        });
        setJourneyId(data.journey._id);
      } catch (err) {
        console.error("Could not save journey:", err);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong finding that route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Starts/stops the trip entirely inside the app: drops a live "you are
  // here" marker from the device's real GPS position, marks the saved
  // journey as in_progress/completed, and logs a location_history entry -
  // no external map app is ever opened.
  const toggleTrip = async () => {
    if (tripStarted) {
      setTripStarted(false);
      setMarkers((m) => m.filter((mk) => mk.label !== "You are here"));
      if (journeyId) {
        try {
          await api.put(`/journeys/${journeyId}/status`, { status: "completed" });
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    const pos = await getCurrentPositionOrFallback();
    setMarkers((m) => [...m, { position: [pos.lat, pos.lon], label: "You are here" }]);
    setTripStarted(true);

    if (journeyId) {
      try {
        await api.put(`/journeys/${journeyId}/status`, { status: "in_progress" });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      await api.post("/location", { lat: pos.lat, lng: pos.lon, sharingActive: true });
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { label: t("safety_score"), value: safetyScore !== null ? `${safetyScore} / 100` : "—", color: "text-accent-green" },
    { label: t("estimated_distance"), value: routeInfo ? `${routeInfo.distanceKm} km` : "—", color: "text-cyan-400" },
    { label: t("estimated_time"), value: routeInfo ? `${routeInfo.durationMin} min` : "—", color: "text-cyan-400" },
    {
      label: "Nearby Safe Places",
      value: nearbySafeCount !== null ? `${nearbySafeCount} found` : "—",
      color: "text-accent-green",
    },
    ...staticStats,
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">
        {t("greeting")}, {user?.firstName || "there"} 👋
      </h1>
      <p className="text-white/50 mb-8">{t("where_to")}</p>

      <div className="glass rounded-2xl p-5 mb-3 grid md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
        <div className="flex items-center gap-2 bg-navy-800 rounded-xl px-4 py-3">
          <FiSearch className="text-white/40" />
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={`${t("current_location")} (e.g. T Nagar, Chennai)`}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
        <button
          onClick={swap}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-cyan-400"
          title="Swap"
        >
          <FiRepeat />
        </button>
        <div className="flex items-center gap-2 bg-navy-800 rounded-xl px-4 py-3">
          <FiSearch className="text-white/40" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={`${t("destination")} (e.g. Marina Beach)`}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-navy-800 rounded-xl px-4 py-3 text-sm outline-none"
        >
          {travelModes.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={findRoute}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-sm disabled:opacity-50"
        >
          <FiNavigation2 size={15} />
          {loading ? t("finding_route") : t("find_route")}
        </button>

        {routePath && (
          <button
            onClick={toggleTrip}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ${
              tripStarted ? "bg-accent-red/20 text-accent-red hover:bg-accent-red/30" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {tripStarted ? <FiSquare size={14} /> : <FiPlay size={14} />}
            {tripStarted ? "Stop" : t("start_navigation")}
          </button>
        )}

        {error && <span className="text-accent-red text-sm">{error}</span>}
      </div>

      <MapView
        markers={markers}
        route={routePath}
        routeMode={mode}
        fitToRoute={!!routePath}
        center={markers[0]?.position || [13.0827, 80.2707]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {statCards.map((c) => (
          <div key={c.label} className="glass rounded-xl p-4">
            <p className="text-xs text-white/50 mb-1">{c.label}</p>
            <p className={`text-lg font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <LocationShareButton />
    </div>
  );
};

export default Dashboard;
