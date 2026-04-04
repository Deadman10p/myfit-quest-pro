import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Check, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockFeedback = [
  { id: "1", user: "user1@example.com", category: "Feature Request", message: "Would love a dark mode calendar view!", date: "2024-06-15", status: "new" },
  { id: "2", user: "user2@example.com", category: "Bug Report", message: "Timer doesn't stop when I switch apps", date: "2024-06-14", status: "in_progress" },
  { id: "3", user: "user3@example.com", category: "General Feedback", message: "Love the app! AI coach is amazing", date: "2024-06-13", status: "resolved" },
  { id: "4", user: "user4@example.com", category: "Nutrition Issue", message: "Meal costs seem inaccurate for my region", date: "2024-06-12", status: "new" },
  { id: "5", user: "user5@example.com", category: "Workout Issue", message: "Need more stretching exercises", date: "2024-06-11", status: "new" },
];

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
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const filtered = filter === "all" ? mockFeedback : mockFeedback.filter(f => f.status === filter);

  const sendReply = (id: string) => {
    if (!reply.trim()) return;
    toast.success("Reply sent to user's notifications");
    setReply(""); setReplyTo(null);
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

      <div className="space-y-3">
        {filtered.map(fb => (
          <div key={fb.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground">{fb.user}</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{fb.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] px-2 py-0.5 rounded flex items-center gap-1", statusColors[fb.status])}>
                  {statusIcons[fb.status]} {fb.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <p className="text-sm text-foreground mb-2">{fb.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{fb.date}</span>
              <Button variant="outline" size="sm" className="text-xs touch-target" onClick={() => setReplyTo(replyTo === fb.id ? null : fb.id)}>
                <MessageSquare className="w-3 h-3 mr-1" /> Reply
              </Button>
            </div>
            {replyTo === fb.id && (
              <div className="mt-3 flex gap-2">
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-secondary min-h-[60px]" />
                <Button onClick={() => sendReply(fb.id)} className="btn-primary-gradient text-primary-foreground touch-target self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
