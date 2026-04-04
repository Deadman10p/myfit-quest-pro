import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, Crown, Users, Globe, Lock, ChevronRight, Medal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const leaderboard = [
  { rank: 1, name: "FitnessPro", xp: 15200, level: 25, streak: 45 },
  { rank: 2, name: "IronMike", xp: 14800, level: 24, streak: 30 },
  { rank: 3, name: "GymQueen", xp: 13500, level: 22, streak: 28 },
  { rank: 4, name: "You", xp: 1250, level: 5, streak: 7, isUser: true },
  { rank: 5, name: "NewbieFit", xp: 900, level: 3, streak: 4 },
];

const GamificationScreen: React.FC = () => {
  const [tab, setTab] = useState<"global" | "friends">("global");

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>

      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        <button onClick={() => setTab("global")} className={cn("flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors touch-target", tab === "global" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={tab === "global"}>
          <Globe className="w-3 h-3" /> Global
        </button>
        <button onClick={() => setTab("friends")} className={cn("flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors touch-target", tab === "friends" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={tab === "friends"}>
          <Users className="w-3 h-3" /> Friends
        </button>
      </div>

      {/* Top 3 */}
      <div className="flex items-end justify-center gap-4 py-4">
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((p, i) => (
          <div key={p.rank} className={cn("flex flex-col items-center", i === 1 ? "order-2" : i === 0 ? "order-1" : "order-3")}>
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-1", i === 1 ? "bg-primary/30 ring-2 ring-primary" : "bg-secondary")}>
              <span className="text-lg font-bold">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{p.name}</span>
            <span className="text-[10px] text-primary">{p.xp.toLocaleString()} XP</span>
            <div className={cn("mt-2 rounded-t-lg", i === 1 ? "w-16 h-20 bg-primary/20" : i === 0 ? "w-16 h-14 bg-secondary" : "w-16 h-10 bg-secondary")} />
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard.map((p, i) => (
          <motion.div key={p.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={cn("bg-card rounded-xl p-3 border flex items-center gap-3 touch-target",
              (p as any).isUser ? "border-primary/50 glow-border" : "border-border")}>
            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              p.rank <= 3 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground")}>
              {p.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold truncate", (p as any).isUser ? "text-primary" : "text-foreground")}>{p.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" /> Lv.{p.level}</span>
                <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" /> {p.streak}d</span>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">{p.xp.toLocaleString()} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GamificationScreen;
