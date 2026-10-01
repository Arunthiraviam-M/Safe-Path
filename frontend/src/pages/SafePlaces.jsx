import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMap, FiNavigation, FiLoader } from "react-icons/fi";
import MapView from "../components/MapView";
import { useLanguage } from "../context/LanguageContext";
import {
  searchNearbyPlaces,
  getCurrentPositionOrFallback,
  getRoute,
  distanceKm,
} from "../services/mapService";

const categories = [
  { key: "police_station", label: "Police Stations", icon: "🛡" },
  { key: "hospital", label: "Hospitals", icon: "🏥" },
  { key: "fire_station", label: "Fire Stations", icon: "🔥" },
  { key: "emergency_service", label: "Emergency Services", icon: "🚑" },
  { key: "shopping_mall", label: "Shopping Mall", icon: "🛍" },
  { key: "well_lit_public_place", label: "Well-Lit Public Places", icon: "💡" },
];

const otherCategories = [
  { key: "railway_station", label: "Railway Station", icon: "🚉" },
  { key: "bus_stand", label: "Bus Stand", icon: "🚌" },
  { key: "pharmacy", label: "Pharmacy", icon: "💊" },
  { key: "petrol_station", label: "Petrol Station", icon: "⛽" },
  { key: "government_office", label: "Government Office", icon: "🏛" },
  { key: "store_24x7", label: "24x7 Store", icon: "🏪" },
];

const allCategories = [...categories, ...otherCategories];

const SafePlaces = () => {
  const { t } = useLanguage();
  const [center, setCenter] = useState(null);
  const [query, setQuery] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [focusedPlace, setFocusedPlace] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routingPlaceId, setRoutingPlaceId] = useState(null);

  // Get the user's real location once on load (falls back to central Chennai
  // if permission is denied) - every search below is centered on this,
  // covering the whole surrounding city rather than a handful of fixed points.
  useEffect(() => {
    getCurrentPositionOrFallback().then(setCenter);
  }, []);

  useEffect(() => {
    if (!activeCategory || !center) return;
    setLoadingPlaces(true);
    setFetchError("");
    setRoutePath(null);
    setRouteInfo(null);

    searchNearbyPlaces(activeCategory, center, 7000)
      .then((results) => {
        const withDistance = results
          .map((p) => ({ ...p, distance: distanceKm([center.lat, center.lon], p.position) }))
          .sort((a, b) => a.distance - b.distance);
        setPlaces(withDistance);
      })
      .catch(() => setFetchError("Couldn't load nearby places right now. Please try again."))
      .finally(() => setLoadingPlaces(false));
  }, [activeCategory, center]);

  const filteredPlaces = useMemo(() => {
    if (!query.trim()) return places;
    return places.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [places, query]);

  const toggleCategory = (key) => {
    setActiveCategory((current) => (current === key ? null : key));
    setShowOther(false);
  };

  const viewOnMap = (place) => {
    setFocusedPlace(place.position);
    setRoutePath(null);
    setRouteInfo(null);
  };

  // Draws a real walking route from the user's current location to this
  // place directly on our own map - no external app is opened.
  const navigateTo = async (place) => {
    if (!center) return;
    setRoutingPlaceId(place.id);
    try {
      const route = await getRoute(center, { lat: place.position[0], lon: place.position[1] }, "walking");
      if (route) {
        setRoutePath(route.path);
        setRouteInfo({ ...route, placeName: place.name });
        setFocusedPlace(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoutingPlaceId(null);
    }
  };

  const markers = [
    ...(center ? [{ position: [center.lat, center.lon], label: "You are here" }] : []),
    ...filteredPlaces.map((p) => ({ position: p.position, label: p.name })),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div>
          <div className="glass rounded-2xl p-2 flex items-center gap-2 mb-4">
            <FiSearch className="text-white/40 ml-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search_safe_places")}
              className="bg-transparent outline-none w-full py-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleCategory(c.key)}
                className={`px-3 py-2 rounded-full text-xs flex items-center gap-1.5 transition-colors ${
                  activeCategory === c.key ? "bg-cyan-500 text-navy-950 font-medium" : "glass hover:bg-white/10"
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowOther((s) => !s)}
                className={`px-3 py-2 rounded-full text-xs transition-colors ${
                  showOther ? "bg-white/15" : "glass hover:bg-white/10"
                }`}
              >
                Other ▾
              </button>
              {showOther && (
                <div className="absolute mt-2 glass rounded-xl p-2 grid gap-1 z-20 w-56">
                  {otherCategories.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => toggleCategory(c.key)}
                      className={`text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        activeCategory === c.key ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-white/10"
                      }`}
                    >
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="px-3 py-2 rounded-full text-xs text-white/50 hover:text-white"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          <p className="text-xs text-white/40 mb-3 mt-4">
            {!activeCategory
              ? "Select a category above to search nearby"
              : `${allCategories.find((c) => c.key === activeCategory)?.label} · ${filteredPlaces.length} found`}
          </p>

          {loadingPlaces && (
            <div className="flex items-center gap-2 text-white/50 text-sm py-6 justify-center">
              <FiLoader className="animate-spin" /> Searching nearby...
            </div>
          )}
          {fetchError && <p className="text-accent-red text-sm text-center py-4">{fetchError}</p>}

          <div className="space-y-3">
            {!loadingPlaces &&
              filteredPlaces.map((p) => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-white/50">{p.distance} km away</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => viewOnMap(p)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      title="View on map"
                    >
                      <FiMap size={16} />
                    </button>
                    <button
                      onClick={() => navigateTo(p)}
                      disabled={routingPlaceId === p.id}
                      className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                      title="Show route on map"
                    >
                      {routingPlaceId === p.id ? <FiLoader className="animate-spin" size={16} /> : <FiNavigation size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            {!loadingPlaces && activeCategory && filteredPlaces.length === 0 && !fetchError && (
              <p className="text-sm text-white/40 text-center py-8">No places found nearby for this category.</p>
            )}
          </div>

          {routeInfo && (
            <div className="glass rounded-xl p-4 mt-4">
              <p className="text-sm font-medium mb-1">Route to {routeInfo.placeName}</p>
              <p className="text-xs text-white/50">
                {routeInfo.distanceKm} km · ~{routeInfo.durationMin} min walking
              </p>
            </div>
          )}
        </div>

        <div className="sticky top-24 self-start">
          <MapView
            height="640px"
            markers={markers}
            focus={focusedPlace}
            route={routePath}
            routeMode="walking"
            fitToRoute={!!routePath}
            center={center ? [center.lat, center.lon] : [13.0827, 80.2707]}
          />
        </div>
      </div>
    </div>
  );
};

export default SafePlaces;
