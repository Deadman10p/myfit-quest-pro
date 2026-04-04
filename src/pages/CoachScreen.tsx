import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff, Bot, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "coach";
  text: string;
}

const CoachScreen: React.FC = () => {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "coach", text: "Hey! 👋 I'm your AI fitness coach. Ask me anything about your workouts, nutrition, or fitness goals!" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const coachMsg: Message = { id: (Date.now() + 1).toString(), role: "coach", text: "Great question! Based on your current plan, I'd recommend focusing on progressive overload this week. Try adding 5% more weight to your compound lifts. Remember, consistency beats intensity! 💪" };
      setMessages(prev => [...prev, coachMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (mode === "voice") {
    return (
      <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">Voice Coach</h2>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> Premium Feature
          </div>
        </div>
        <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center mb-6 animate-pulse-glow">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
            <Mic className="w-10 h-10 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">Upgrade to Premium to unlock voice coaching during workouts and real-time audio guidance</p>
        <Button className="btn-primary-gradient text-primary-foreground font-semibold touch-target">Upgrade to Premium</Button>
        <Button variant="outline" className="mt-3 touch-target" onClick={() => setMode("text")}>Switch to Text</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <h2 className="text-lg font-bold text-foreground">AI Coach</h2>
        <Button variant="outline" size="sm" onClick={() => setMode("voice")} className="text-xs touch-target">
          <Mic className="w-3 h-3 mr-1" /> Voice Mode
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "coach" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border text-foreground rounded-bl-md")}>
              {msg.text}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="px-4 py-3 border-t border-border flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your coach..." className="flex-1 touch-target bg-secondary" aria-label="Message" />
        <Button type="submit" className="btn-primary-gradient text-primary-foreground touch-target" disabled={!input.trim()} aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default CoachScreen;
