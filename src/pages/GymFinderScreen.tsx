import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const gyms = [
  { name: "Iron Paradise Gym", address: "123 Main St", distance: "0.5 km", phone: "+1 555-0101", website: "https://example.com", lat: 40.7128, lng: -74.006 },
  { name: "FitZone CrossFit", address: "456 Oak Ave", distance: "1.2 km", phone: "+1 555-0202", website: null, lat: 40.715, lng: -74.003 },
  { name: "Yoga & Wellness Center", address: "789 Pine Rd", distance: "1.8 km", phone: null, website: "https://example.com", lat: 40.718, lng: -74.008 },
  { name: "PowerLift Arena", address: "321 Elm Blvd", distance: "2.5 km", phone: "+1 555-0303", website: "https://example.com", lat: 40.72, lng: -74.001 },
];

const GymFinderScreen: React.FC = () => {
  const [filter, setFilter] = useState("all");

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-4 py-3">
        <h2 className="text-xl font-bold text-foreground mb-2">Nearby Gyms</h2>
        <div className="flex gap-2">
          {["all", "< 1km", "< 2km", "< 5km"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-target ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              aria-pressed={filter === f}>{f === "all" ? "All" : f}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="h-48 mx-4 rounded-xl overflow-hidden border border-border">
        <MapContainer center={[40.7128, -74.006]} zoom={14} style={{ height: "100%", width: "100%" }} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {gyms.map((gym, i) => (
            <Marker key={i} position={[gym.lat, gym.lng]}>
              <Popup>{gym.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {gyms.map((gym, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{gym.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {gym.address}
                </p>
              </div>
              <span className="text-xs font-medium text-primary flex items-center gap-1">
                <Navigation className="w-3 h-3" /> {gym.distance}
              </span>
            </div>
            <div className="flex gap-3 mt-2">
              {gym.phone && (
                <a href={`tel:${gym.phone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                  <Phone className="w-3 h-3" /> {gym.phone}
                </a>
              )}
              {gym.website && (
                <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GymFinderScreen;
