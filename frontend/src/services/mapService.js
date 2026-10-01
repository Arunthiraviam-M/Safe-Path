// ---------------------------------------------------------------------------
// Geocoding - turn typed text into coordinates (case-insensitive, fuzzy)
// ---------------------------------------------------------------------------
export const geocodeAddress = async (query) => {
  if (!query || !query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Geocoding request failed");

  const results = await res.json();
  if (!results.length) return null;

  const { lat, lon, display_name } = results[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), label: display_name };
};

// ---------------------------------------------------------------------------
// Routing - real road/path routing, mode-aware, drawn entirely on OUR OWN
// map (no external redirects). Uses free OSRM instances - one profile per
// travel mode, same way Google Maps calculates a different path for walking
// vs driving.
// ---------------------------------------------------------------------------
const OSRM_HOSTS = {
  walking: "https://routing.openstreetmap.de/routed-foot/route/v1/foot",
  bicycle: "https://routing.openstreetmap.de/routed-bike/route/v1/bike",
  // No free public OSRM instance distinguishes two-wheeler/motorcycle from
  // car, and true public-transport (bus/train timetable) routing needs a
  // paid GTFS-based engine - both fall back to the car road network as the
  // closest free approximation.
  two_wheeler: "https://routing.openstreetmap.de/routed-car/route/v1/car",
  car: "https://routing.openstreetmap.de/routed-car/route/v1/car",
  public_transport: "https://routing.openstreetmap.de/routed-car/route/v1/car",
};

export const getRoute = async (originLatLon, destinationLatLon, mode = "walking") => {
  const { lat: lat1, lon: lon1 } = originLatLon;
  const { lat: lat2, lon: lon2 } = destinationLatLon;

  const base = OSRM_HOSTS[mode] || OSRM_HOSTS.walking;
  const url = `${base}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing request failed");

  const data = await res.json();
  if (!data.routes || !data.routes.length) return null;

  const route = data.routes[0];
  const path = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    path,
    distanceKm: (route.distance / 1000).toFixed(1),
    durationMin: Math.round(route.duration / 60),
  };
};

// ---------------------------------------------------------------------------
// Live nearby-places search via Overpass API (OpenStreetMap's free query
// engine) - real police stations, hospitals, bus stands etc. across the
// whole city (not a hardcoded sample list), centered on wherever the user
// currently is or is searching around.
// ---------------------------------------------------------------------------

// Maps our category keys to real OpenStreetMap tags. A couple are
// approximations since OSM has no exact equivalent tag (noted inline).
const CATEGORY_OSM_TAGS = {
  police_station: ['node["amenity"="police"]'],
  hospital: ['node["amenity"="hospital"]'],
  fire_station: ['node["amenity"="fire_station"]'],
  emergency_service: ['node["amenity"="hospital"]', 'node["amenity"="clinic"]'],
  shopping_mall: ['node["shop"="mall"]'],
  // OSM has no "well-lit" tag - parks/public squares are used as the closest
  // stand-in for open, publicly visible spaces.
  well_lit_public_place: ['node["leisure"="park"]', 'node["leisure"="square"]'],
  railway_station: ['node["railway"="station"]'],
  bus_stand: ['node["amenity"="bus_station"]', 'node["highway"="bus_stop"]'],
  pharmacy: ['node["amenity"="pharmacy"]'],
  petrol_station: ['node["amenity"="fuel"]'],
  government_office: ['node["office"="government"]'],
  // OSM has no "open 24x7" tag - general convenience stores are the closest
  // stand-in; opening_hours (when tagged) is used for the open/closed label.
  store_24x7: ['node["shop"="convenience"]'],
};

export const searchNearbyPlaces = async (categoryKey, center, radiusMeters = 6000) => {
  const tags = CATEGORY_OSM_TAGS[categoryKey];
  if (!tags || !center) return [];

  const around = `(around:${radiusMeters},${center.lat},${center.lon})`;
  const clauses = tags.map((tag) => `${tag}${around};`).join("\n");

  const query = `[out:json][timeout:25];(${clauses});out body 40;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  if (!res.ok) throw new Error("Nearby places search failed");

  const data = await res.json();

  return (data.elements || [])
    .filter((el) => el.lat && el.lon)
    .map((el) => ({
      id: el.id,
      name: el.tags?.name || "Unnamed place",
      position: [el.lat, el.lon],
      openStatus: el.tags?.opening_hours ? "See listed hours" : null,
    }));
};

// Haversine distance in km - used to sort/label results by distance from center
export const distanceKm = (a, b) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return (2 * R * Math.asin(Math.sqrt(h))).toFixed(1);
};

// Wraps the browser Geolocation API in a promise, with a Chennai-center
// fallback if permission is denied - used so features degrade gracefully.
export const getCurrentPositionOrFallback = (fallback = { lat: 13.0827, lon: 80.2707 }) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(fallback);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
