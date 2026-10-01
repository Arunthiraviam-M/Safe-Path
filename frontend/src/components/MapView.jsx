import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FlyToController = ({ focus, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1 });
    } else if (focus) {
      map.flyTo(focus, 15, { duration: 1 });
    }
  }, [focus, bounds, map]);
  return null;
};

/**
 * markers: [{ position: [lat, lng], label: string }]
 * route:   [[lat, lng], ...] - the path to draw
 * routeMode: "walking" draws a dotted line (like Google Maps walking directions),
 *            anything else draws a solid line.
 * focus:   [lat, lng] - pan/fly the map here on demand
 * fitToRoute: auto zoom to fit the whole route once it's drawn
 */
const MapView = ({
  center = [13.0827, 80.2707],
  markers = [],
  route = null,
  routeMode = "car",
  focus = null,
  fitToRoute = false,
  height = "420px",
}) => {
  const bounds = fitToRoute && route && route.length >= 2 ? [route[0], route[route.length - 1]] : null;

  const routeStyle =
    routeMode === "walking"
      ? { color: "#22D3EE", weight: 5, opacity: 0.9, dashArray: "2, 12", lineCap: "round" }
      : { color: "#22D3EE", weight: 5, opacity: 0.85 };

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={i} position={m.position}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
        {route && route.length >= 2 && <Polyline positions={route} pathOptions={routeStyle} />}
        <FlyToController focus={focus} bounds={bounds} />
      </MapContainer>
    </div>
  );
};

export default MapView;
