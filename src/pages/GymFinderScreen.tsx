import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Navigation, LocateFixed, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Gym {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  lat: number;
  lng: number;
  source: "osm" | "admin";
  distanceKm?: number;
}

const haversine = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const Recenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center[0], center[1]]);
  return null;
};

const FALLBACK: [number, number] = [40.7128, -74.006];

const GymFinderScreen: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [center, setCenter] = useState<[number, number]>(FALLBACK);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const fetchOsm = async ([lat, lng]: [number, number]): Promise<Gym[]> => {
    const query = `[out:json][timeout:25];(
      node["leisure"="fitness_centre"](around:6000,${lat},${lng});
      way["leisure"="fitness_centre"](around:6000,${lat},${lng});
      node["leisure"="sports_centre"]["sport"~"fitness|gym|yoga|crossfit"](around:6000,${lat},${lng});
    );out center 40;`;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query }),
    });
    if (!res.ok) throw new Error("Map service unavailable");
    const json = await res.json();
    return (json.elements ?? [])
      .map((el: any): Gym | null => {
        const glat = el.lat ?? el.center?.lat;
        const glng = el.lon ?? el.center?.lon;
        if (!glat || !glng) return null;
        const t = el.tags ?? {};
        const address = [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean).join(" ") || null;
        return {
          id: `osm-${el.type}-${el.id}`,
          name: t.name || "Unnamed gym",
          address,
          phone: t.phone ?? t["contact:phone"] ?? null,
          website: t.website ?? t["contact:website"] ?? null,
          lat: glat,
          lng: glng,
          source: "osm",
        };
      })
      .filter(Boolean) as Gym[];
  };

  const load = async (pos: [number, number]) => {
    setLoading(true);
    const [{ data: adminRows }, osm] = await Promise.all([
      supabase.from("gyms").select("*").eq("is_published", true),
      fetchOsm(pos).catch((e) => { toast.error(e.message); return [] as Gym[]; }),
    ]);
    const adminGyms: Gym[] = (adminRows ?? [])
      .filter((g: any) => g.lat != null && g.lng != null)
      .map((g: any) => ({
        id: g.id, name: g.name, address: g.address, phone: g.phone, website: g.website,
        lat: Number(g.lat), lng: Number(g.lng), source: "admin" as const,
      }));
    const all = [...adminGyms, ...osm].map((g) => ({ ...g, distanceKm: haversine(pos, [g.lat, g.lng]) }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    setGyms(all);
    setLoading(false);
  };

  const locate = () => {
    if (!navigator.geolocation) { load(center); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        setCenter(pos);
        setLocating(false);
        load(pos);
      },
      () => { setLocating(false); load(center); toast.info("Using default location — enable location access for nearby gyms."); },
      { timeout: 8000 }
    );
  };

  useEffect(() => { locate(); }, []);

  const visible = useMemo(() => {
    const max = filter === "< 1km" ? 1 : filter === "< 2km" ? 2 : filter === "< 5km" ? 5 : Infinity;
    return gyms.filter((g) => (g.distanceKm ?? 0) <= max);
  }, [gyms, filter]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">Nearby Gyms</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={locate} disabled={locating}>
              <LocateFixed className="w-3 h-3 mr-1" /> {locating ? "Locating…" : "My location"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => load(center)} disabled={loading}>
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
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
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Recenter center={center} />
          {visible.map((gym) => (
            <Marker key={gym.id} position={[gym.lat, gym.lng]}>
              <Popup>{gym.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Finding gyms around you…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gyms found in this range.</p>
        ) : visible.map((gym, i) => (
          <motion.div key={gym.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}
            className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{gym.name}</h3>
                {gym.address && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {gym.address}
                  </p>
                )}
                {gym.source === "admin" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary mt-1 inline-block">Partner</span>}
              </div>
              <span className="text-xs font-medium text-primary flex items-center gap-1 whitespace-nowrap">
                <Navigation className="w-3 h-3" /> {(gym.distanceKm ?? 0).toFixed(1)} km
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
              <a href={`https://www.openstreetmap.org/?mlat=${gym.lat}&mlon=${gym.lng}#map=17/${gym.lat}/${gym.lng}`}
                target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <Navigation className="w-3 h-3" /> Directions
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GymFinderScreen;
