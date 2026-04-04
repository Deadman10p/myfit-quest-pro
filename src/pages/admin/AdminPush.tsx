import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bell } from "lucide-react";
import { toast } from "sonner";

const AdminPush: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  const handleSend = () => {
    if (!title || !message) { toast.error("Fill all fields"); return; }
    toast.success("Push notification sent!");
    setTitle(""); setMessage("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground">Push Notifications</h2>

      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">New Push Notification</h3>
        </div>

        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary" />
        <Textarea placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} className="min-h-[100px] bg-secondary" />

        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="free">Free Users</SelectItem>
            <SelectItem value="premium">Premium Users</SelectItem>
            <SelectItem value="country">By Country</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          <Button onClick={handleSend} className="btn-primary-gradient text-primary-foreground font-semibold touch-target flex-1">
            <Send className="w-4 h-4 mr-2" /> Send Now
          </Button>
          <Button variant="outline" className="touch-target">Schedule</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Recent Notifications</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between py-2 border-b border-border">
            <span>Welcome to FitAI v2.0!</span>
            <span className="text-xs">Sent • 98% delivered</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span>New workout challenges available</span>
            <span className="text-xs">Sent • 95% delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPush;
