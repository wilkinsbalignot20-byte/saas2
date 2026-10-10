 "use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Kailangan ang CSS ng Leaflet para hindi magkahiwa-hiwalay ang itsura ng mapa
import "leaflet/dist/leaflet.css";

// ✅ Fix: provide valid Leaflet marker assets and dimensions
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RiderLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

// Temporary sample data ng mga riders habang nagse-setup ka pa lang
const sampleRiders: RiderLocation[] = [
  { id: "1", name: "Rider Juan", lat: 14.5995, lng: 120.9842, status: "Delivering" }, // Manila
  { id: "2", name: "Rider Pedro", lat: 14.6042, lng: 121.0234, status: "Available" }, // Sampaloc
];

export default function LogisticsMap() {
  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <MapContainer
        center={[14.5995, 120.9842]} // Naka-center sa Manila bilang panimula
        zoom={13}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        {/* Libreng map tile layer mula sa OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pagpapakita ng mga pins ng Riders */}
        {sampleRiders.map((rider) => (
          <Marker key={rider.id} position={[rider.lat, rider.lng]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-slate-900">{rider.name}</p>
                <p className="text-xs text-slate-500">Status: {rider.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
