import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminPush: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [country, setCountry] = useState("");
  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  const loadRecent = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("title, body, created_at, is_read")
      .eq("type", "push")
      .order("created_at", { ascending: false })
      .limit(50);
    // group by title+minute so a broadcast shows as one row with delivery counts
    const groups = new Map<string, { title: string; body: string | null; created_at: string; total: number; read: number }>();
    for (const n of data ?? []) {
      const key = `${n.title}|${n.created_at.slice(0, 16)}`;
      const g = groups.get(key) ?? { title: n.title, body: n.body, created_at: n.created_at, total: 0, read: 0 };
      g.total += 1;
      if (n.is_read) g.read += 1;
      groups.set(key, g);
    }
    setRecent([...groups.values()]);
  };
  useEffect(() => { loadRecent(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Fill in a title and message"); return; }
    if (target === "country" && !country.trim()) { toast.error("Enter a country"); return; }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("admin-broadcast", {
      body: { title: title.trim(), body: message.trim(), target, country: country.trim() || null },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Failed to send");
      return;
    }
    toast.success(`Sent to ${(data as any).sent} user(s)`);
    setTitle(""); setMessage(""); setCountry("");
    loadRecent();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Push Notifications</h2>

      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">New Push Notification</h3>
        </div>

        <Input placeholder="Title" value={title} maxLength={200} onChange={e => setTitle(e.target.value)} className="bg-secondary" />
        <Textarea placeholder="Message..." value={message} maxLength={2000} onChange={e => setMessage(e.target.value)} className="min-h-[100px] bg-secondary" />

        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="free">Free Users</SelectItem>
            <SelectItem value="premium">Premium Users</SelectItem>
            <SelectItem value="country">By Country</SelectItem>
          </SelectContent>
        </Select>

        {target === "country" && (
          <Input placeholder="Country (e.g. Uganda)" value={country} onChange={e => setCountry(e.target.value)} className="bg-secondary" />
        )}

        <Button onClick={handleSend} disabled={sending} className="btn-primary-gradient text-primary-foreground font-semibold touch-target w-full">
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {sending ? "Sending…" : "Send Now"}
        </Button>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Recent Notifications</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No push notifications sent yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {recent.map((r, i) => (
              <div key={i} className="flex justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.body}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.total} sent • {Math.round((r.read / r.total) * 100)}% read
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPush;
