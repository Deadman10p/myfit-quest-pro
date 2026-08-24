import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Check, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  new: "bg-primary/20 text-primary",
  in_progress: "bg-yellow-500/20 text-yellow-500",
  resolved: "bg-green-500/20 text-green-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  new: <Eye className="w-3 h-3" />,
  in_progress: <Clock className="w-3 h-3" />,
  resolved: <Check className="w-3 h-3" />,
};

const AdminFeedback: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : items.filter(f => f.status === filter);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(prev => prev.map(f => (f.id === id ? { ...f, status } : f)));
  };

  const sendReply = async (fb: any) => {
    if (!reply.trim()) return;
    const { error } = await supabase.from("feedback").update({ admin_reply: reply.trim(), status: "resolved" }).eq("id", fb.id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: fb.user_id,
      title: "Reply to your feedback",
      body: reply.trim(),
      type: "feedback",
    });
    toast.success("Reply sent to the user's notifications");
    setReply(""); setReplyTo(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-foreground">Feedback Center</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px] bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(fb => (
            <div key={fb.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{fb.user_id.slice(0, 8)}…</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{fb.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded flex items-center gap-1", statusColors[fb.status])}>
                    {statusIcons[fb.status]} {String(fb.status).replace("_", " ")}
                  </span>
                  <Select value={fb.status} onValueChange={v => setStatus(fb.id, v)}>
                    <SelectTrigger className="h-7 w-[130px] text-xs bg-secondary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-foreground mb-2">{fb.message}</p>
              {fb.admin_reply && <p className="text-xs text-muted-foreground mb-2 border-l-2 border-primary pl-2">{fb.admin_reply}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</span>
                <Button variant="outline" size="sm" className="text-xs touch-target" onClick={() => setReplyTo(replyTo === fb.id ? null : fb.id)}>
                  <MessageSquare className="w-3 h-3 mr-1" /> Reply
                </Button>
              </div>
              {replyTo === fb.id && (
                <div className="mt-3 flex gap-2">
                  <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-secondary min-h-[60px]" />
                  <Button onClick={() => sendReply(fb)} className="btn-primary-gradient text-primary-foreground touch-target self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
