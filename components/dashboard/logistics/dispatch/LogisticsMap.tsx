 "use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { type Courier } from "../utils"; // Siguraduhing tama ang import path ng iyong Courier type

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

type CourierWithGps = Courier & {
  latitude?: number | string | null;
  longitude?: number | string | null;
};

// 🟢 Tinatanggap na ngayon ang totoong 'couriers' array mula sa database bilang props
export default function LogisticsMap({ couriers = [] }: { couriers?: Courier[] }) {
  
  // 🟢 Filter: Pinapakita lang sa mapa ang mga riders na may nakuhang latitude at longitude sa database
  const ridersWithGps = (couriers as CourierWithGps[]).filter((rider) => {
    const latitude = Number(rider.latitude);
    const longitude = Number(rider.longitude);

    return !Number.isNaN(latitude) && !Number.isNaN(longitude);
  });

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <MapContainer
        center={[14.7550, 121.0400]} // 🟢 Naka-center na ngayon sa Caloocan / Towerville area mo imbis na Maynila
        zoom={13}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        {/* Libreng map tile layer mula sa OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pagpapakita ng mga pins ng mga TOTOONG Riders na may GPS coordinate */}
        {ridersWithGps.map((rider) => {
          const latitude = Number(rider.latitude);
          const longitude = Number(rider.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

          return (
            <Marker key={rider.id} position={[latitude, longitude]} icon={defaultIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-slate-900">{rider.name}</p>
                  <p className="text-xs text-slate-500">Vehicle: {rider.vehicleType || "Motorcycle"}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">Status: {rider.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
