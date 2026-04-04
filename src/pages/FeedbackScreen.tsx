import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FeedbackScreen: React.FC = () => {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !message.trim()) { toast.error("Please fill all fields"); return; }
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
    <div className="px-4 py-4 space-y-4">
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

        <Button type="submit" className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold">
          <MessageSquare className="w-4 h-4 mr-2" /> Submit Feedback
        </Button>
      </form>
    </div>
  );
};

export default FeedbackScreen;
