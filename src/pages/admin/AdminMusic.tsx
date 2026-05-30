import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Music, Upload } from "lucide-react";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  bpm: number | null;
  audio_url: string;
  duration_seconds: number | null;
  is_published: boolean;
}

const AdminMusic: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", genre: "", bpm: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("music_tracks").select("*").order("created_at", { ascending: false });
    setTracks((data as Track[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Pick an audio file");
    if (!form.title) return toast.error("Title required");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("music").upload(path, file, { contentType: file.type });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("music").getPublicUrl(path);
    const { error } = await supabase.from("music_tracks").insert({
      title: form.title, artist: form.artist || null, genre: form.genre || null,
      bpm: form.bpm ? +form.bpm : null, audio_url: pub.publicUrl, is_published: true,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    setOpen(false); setForm({ title: "", artist: "", genre: "", bpm: "" });
    if (fileRef.current) fileRef.current.value = "";
    load();
  };

  const del = async (t: Track) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    const path = t.audio_url.split("/music/")[1];
    if (path) await supabase.storage.from("music").remove([path]);
    await supabase.from("music_tracks").delete().eq("id", t.id);
    load();
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Music Library</h1>
        <Button onClick={() => setOpen(true)} className="btn-primary-gradient text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Upload Track
        </Button>
      </div>

      {tracks.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Music className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tracks yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {tracks.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Music className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.artist || "Unknown"} • {t.genre || "—"} {t.bpm ? `• ${t.bpm} BPM` : ""}</p>
            </div>
            <audio src={t.audio_url} controls className="h-8" />
            <Button size="icon" variant="ghost" onClick={() => del(t)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Music Track</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Artist</Label><Input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Genre</Label><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="electronic, hip-hop..." /></div>
              <div><Label>BPM</Label><Input type="number" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} /></div>
            </div>
            <div>
              <Label>Audio file (.mp3, .m4a, .wav)</Label>
              <Input ref={fileRef} type="file" accept="audio/*" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={upload} disabled={uploading} className="btn-primary-gradient text-primary-foreground">
              <Upload className="w-4 h-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMusic;
