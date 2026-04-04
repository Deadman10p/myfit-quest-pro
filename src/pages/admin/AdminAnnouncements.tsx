import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Megaphone } from "lucide-react";
import { toast } from "sonner";

const AdminAnnouncements: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  const handleSend = () => {
    if (!title || !message) { toast.error("Fill all fields"); return; }
    toast.success("Announcement sent!");
    setTitle(""); setMessage("");
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
        <Textarea placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} className="min-h-[120px] bg-secondary" />

        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="free">Free Tier Only</SelectItem>
            <SelectItem value="premium">Premium Only</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSend} className="btn-primary-gradient text-primary-foreground font-semibold touch-target">
          <Send className="w-4 h-4 mr-2" /> Send Announcement
        </Button>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
