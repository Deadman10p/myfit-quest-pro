import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const empty = { name: "", address: "", city: "", country: "", phone: "", website: "", lat: "", lng: "" };

const AdminGyms: React.FC = () => {
  const [form, setForm] = useState({ ...empty });
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gyms").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("gyms").insert({
      name: form.name.trim(),
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      phone: form.phone || null,
      website: form.website || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Gym added");
    setForm({ ...empty });
    load();
  };

  const toggle = async (g: any) => {
    const { error } = await supabase.from("gyms").update({ is_published: !g.is_published }).eq("id", g.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("gyms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Gyms</h2>

      <div className="bg-card rounded-xl p-6 border border-border space-y-3">
        <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Add Gym</h3></div>
        {(["name", "address", "city", "country", "phone", "website", "lat", "lng"] as const).map(k => (
          <Input key={k} placeholder={k === "lat" ? "Latitude" : k === "lng" ? "Longitude" : k[0].toUpperCase() + k.slice(1)}
            value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="bg-secondary" />
        ))}
        <Button onClick={save} disabled={saving} className="btn-primary-gradient text-primary-foreground font-semibold touch-target">
          <Plus className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Add Gym"}
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No gyms added. Users still see live results from the open map database.</p> : items.map(g => (
          <div key={g.id} className="bg-card rounded-xl p-4 border border-border flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{g.name}</p>
              <p className="text-xs text-muted-foreground">{[g.address, g.city, g.country].filter(Boolean).join(", ")}</p>
              <p className="text-[10px] text-muted-foreground">{g.phone} {g.website}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="touch-target" onClick={() => toggle(g)} aria-label="Toggle visibility">
                {g.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" className="touch-target" onClick={() => remove(g.id)} aria-label="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGyms;
