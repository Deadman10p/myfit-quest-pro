import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Bot, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CoachScreen: React.FC = () => {
  const { user, profile, session } = useAuth();
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at").limit(50)
      .then(({ data }) => {
        const loaded: Message[] = (data ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content }));
        if (loaded.length === 0) {
          setMessages([{ id: "welcome", role: "assistant", content: "Hey! 👋 I'm your AI fitness coach. Ask me anything about workouts, nutrition, or your goals." }]);
        } else setMessages(loaded);
      });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming || !user || !session) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({ role: m.role, content: m.content })),
          profile,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        toast.error(err.error || "AI request failed");
        setStreaming(false);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: full } : m));
            }
          } catch {}
        }
      }

      if (full) await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: full });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStreaming(false);
    }
  };

  if (mode === "voice") {
    return (
      <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
        <h2 className="text-xl font-bold text-foreground mb-2">Voice Coach</h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-8"><Lock className="w-3 h-3" /> Premium Feature</div>
        <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center mb-6 animate-pulse-glow">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"><Mic className="w-10 h-10 text-primary" /></div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">Upgrade to Premium for real-time voice coaching</p>
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm prose prose-sm prose-invert max-w-none",
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border text-foreground rounded-bl-md")}>
              {msg.role === "assistant" ? (
                msg.content ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <span className="opacity-60">...</span>
              ) : msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="px-4 py-3 border-t border-border flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your coach..." className="flex-1 touch-target bg-secondary" aria-label="Message" disabled={streaming} />
        <Button type="submit" className="btn-primary-gradient text-primary-foreground touch-target" disabled={!input.trim() || streaming} aria-label="Send">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default CoachScreen;
