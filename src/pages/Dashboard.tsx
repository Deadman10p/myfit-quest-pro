import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Dumbbell, UtensilsCrossed, MessageCircle, MapPin, Trophy, Flame, Zap, Star, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MealPlan {
  id: string;
  week_start: string;
  days: any[];
  notes: string | null;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [adapting, setAdapting] = useState(false);
  const [loading, setLoading] = useState(true);

  const xp = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const level = Math.floor(xp / 500) + 1;
  const xpForNext = level * 500;

  const loadPlan = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    setPlan(data as MealPlan | null);
    setLoading(false);
  };

  useEffect(() => { loadPlan(); }, [user?.id]);

  // Auto-adapt if plan is older than 7 days
  useEffect(() => {
    if (!plan) return;
    const ageDays = (Date.now() - new Date(plan.week_start).getTime()) / 86_400_000;
    if (ageDays >= 7) adaptPlan(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  const adaptPlan = async (silent = false) => {
    setAdapting(true);
    try {
      const { error } = await supabase.functions.invoke("ai-generate-plan", { body: { adapt: true } });
      if (error) throw error;
      if (!silent) toast.success("Plan adapted to your recent progress");
      await loadPlan();
    } catch (e: any) {
      if (!silent) toast.error(e.message || "Failed to adapt plan");
    } finally {
      setAdapting(false);
    }
  };

  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const todayMeals = (plan?.days ?? []).find((d: any) => d.day === today)?.meals ?? [];
  const totalCals = todayMeals.reduce((s: number, m: any) => s + (m.calories ?? 0), 0);

  return (
    <div className="px-4 py-4 space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground">Hey {profile?.display_name || "there"}! 💪</h2>
        <p className="text-sm text-muted-foreground">Ready to crush today's goals?</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3">
        <div className="flex-1 bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Level {level}</span>
          </div>
          <p className="text-lg font-bold text-foreground">{xp} XP</p>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(xp / xpForNext) * 100}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{xpForNext - xp} XP to Level {level + 1}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center min-w-[100px]">
          <Flame className="w-6 h-6 text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
      </motion.div>

      {/* Adaptive plan card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-xl p-4 border border-primary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Your Adaptive Plan</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={() => adaptPlan(false)} disabled={adapting} className="h-7 text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${adapting ? "animate-spin" : ""}`} />
            {adapting ? "Adapting…" : "Re-adapt"}
          </Button>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : plan ? (
          <>
            <p className="text-xs text-muted-foreground mb-1">
              Week of {new Date(plan.week_start).toLocaleDateString()} · {plan.days.length} days planned
            </p>
            {plan.notes && <p className="text-xs text-foreground/80 italic">"{plan.notes}"</p>}
          </>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-2">No plan yet. Generate your first adaptive plan.</p>
            <Button size="sm" onClick={() => adaptPlan(false)} disabled={adapting} className="w-full">
              <Sparkles className="w-3 h-3 mr-1" /> Generate now
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link to="/workouts" className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Workout</h3>
                <p className="text-xs text-muted-foreground">Tap to start your session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Link to="/nutrition" className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Meals</h3>
                <p className="text-xs text-muted-foreground">
                  {todayMeals.length > 0 ? `${totalCals} cal · ${todayMeals.length} meals` : "Generate plan to see meals"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3">
        <Link to="/coach" className="bg-card rounded-xl p-3 border border-border flex flex-col items-center gap-2 hover:border-primary/50 transition-colors touch-target">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">AI Coach</span>
        </Link>
        <Link to="/gyms" className="bg-card rounded-xl p-3 border border-border flex flex-col items-center gap-2 hover:border-primary/50 transition-colors touch-target">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Nearby Gyms</span>
        </Link>
        <Link to="/progress" className="bg-card rounded-xl p-3 border border-border flex flex-col items-center gap-2 hover:border-primary/50 transition-colors touch-target">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Progress</span>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="bg-card rounded-xl p-4 border border-primary/30 glow-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Weekly Challenge</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Complete 5 workouts to earn 500 XP</p>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
