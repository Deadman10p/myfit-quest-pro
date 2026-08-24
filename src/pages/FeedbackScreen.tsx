import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FeedbackScreen: React.FC = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [past, setPast] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadPast = async () => {
    if (!user) return;
    const { data } = await supabase.from("feedback").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setPast(data ?? []);
  };

  useEffect(() => { loadPast(); }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !message.trim()) { toast.error("Please fill all fields"); return; }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("feedback").insert({ user_id: user.id, category, message: message.trim() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">Thank You!</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Your feedback has been submitted. We'll review it and may respond via your notifications.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="touch-target">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="touch-target p-2 rounded-lg hover:bg-secondary" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-xl font-bold text-foreground">Send Feedback</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" id="category-label">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="touch-target bg-secondary" aria-labelledby="category-label">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="general">General Feedback</SelectItem>
              <SelectItem value="nutrition">Nutrition Issue</SelectItem>
              <SelectItem value="workout">Workout Issue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="fb-message" className="text-sm font-medium text-foreground">Message</label>
          <Textarea id="fb-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what's on your mind..." className="min-h-[120px] bg-secondary" />
        </div>

        <Button type="submit" disabled={saving} className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold">
          <MessageSquare className="w-4 h-4 mr-2" /> {saving ? "Submitting…" : "Submit Feedback"}
        </Button>
      </form>

      {past.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-semibold text-foreground">Your previous feedback</h3>
          {past.map(f => (
            <div key={f.id} className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{f.category}</span>
                <span className="text-[10px] text-primary">{String(f.status).replace("_", " ")}</span>
              </div>
              <p className="text-xs text-foreground mt-1">{f.message}</p>
              {f.admin_reply && <p className="text-xs text-muted-foreground mt-1 border-l-2 border-primary pl-2">{f.admin_reply}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackScreen;
