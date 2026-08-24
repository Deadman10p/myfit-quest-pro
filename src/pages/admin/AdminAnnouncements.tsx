import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Megaphone, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminAnnouncements: React.FC = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Fill all fields"); return; }
    setSaving(true);
    const { error } = await supabase.from("announcements").insert({ title: title.trim(), body: body.trim(), audience });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Announcement published");
    setTitle(""); setBody("");
    load();
  };

  const togglePublish = async (a: any) => {
    const { error } = await supabase.from("announcements").update({ is_published: !a.is_published }).eq("id", a.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Announcements</h2>

      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">New Announcement</h3>
        </div>

        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary" />
        <Textarea placeholder="Message..." value={body} onChange={e => setBody(e.target.value)} className="min-h-[120px] bg-secondary" />

        <Select value={audience} onValueChange={setAudience}>
          <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="free">Free Tier Only</SelectItem>
            <SelectItem value="premium">Premium Only</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSend} disabled={saving} className="btn-primary-gradient text-primary-foreground font-semibold touch-target">
          <Send className="w-4 h-4 mr-2" /> {saving ? "Publishing…" : "Send Announcement"}
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Published</h3>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing yet.</p> : items.map(a => (
          <div key={a.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{a.audience} • {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="touch-target" onClick={() => togglePublish(a)} aria-label="Toggle visibility">
                  {a.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" className="touch-target" onClick={() => remove(a.id)} aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
