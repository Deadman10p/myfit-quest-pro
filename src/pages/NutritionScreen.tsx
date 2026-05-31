import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Meal {
  type: string; title: string; calories: number; protein_g: number;
  carbs_g: number; fat_g: number; ingredients: string[];
  cost_estimate?: number; currency?: string;
}
interface PlanDay { day: string; meals: Meal[]; }

const NutritionScreen: React.FC = () => {
  const { user } = useAuth();
  const [days, setDays] = useState<PlanDay[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay()]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [eaten, setEaten] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meal_plans").select("*").eq("user_id", user.id)
      .order("week_start", { ascending: false }).limit(1).maybeSingle();
    setDays(((data?.days as unknown) as PlanDay[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke("ai-generate-plan", { body: { adapt: true } });
      if (error) throw error;
      toast.success("Meal plan ready");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate plan");
    } finally { setGenerating(false); }
  };

  const todayMeals = days.find(d => d.day === activeDay)?.meals ?? [];
  const totalCal = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const totalCost = todayMeals.reduce((s, m) => s + (m.cost_estimate || 0), 0);
  const currency = todayMeals[0]?.currency ?? "USD";

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Nutrition</h2>
        <Button size="sm" variant="ghost" onClick={generate} disabled={generating} className="h-8 text-xs">
          <RefreshCw className={`w-3 h-3 mr-1 ${generating ? "animate-spin" : ""}`} />
          {days.length ? "Re-adapt" : "Generate"}
        </Button>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap touch-target",
              activeDay === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
            {d}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-lg font-bold text-foreground">{totalCal}</p><p className="text-[10px] text-muted-foreground">Calories</p></div>
          <div><p className="text-lg font-bold text-primary">{totalProtein}g</p><p className="text-[10px] text-muted-foreground">Protein</p></div>
          <div><p className="text-lg font-bold text-foreground">{totalCost ? `${totalCost.toFixed(1)} ${currency}` : "—"}</p><p className="text-[10px] text-muted-foreground">Est. Cost</p></div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading plan…</p>
      ) : todayMeals.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">No meals planned for {activeDay} yet.</p>
          <Button onClick={generate} disabled={generating}>
            <Sparkles className="w-4 h-4 mr-1" /> {generating ? "Generating…" : "Generate adaptive plan"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayMeals.map((m, i) => {
            const key = `${activeDay}-${i}`;
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-primary font-semibold">{m.type}</p>
                    <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                  </div>
                  <button onClick={() => setEaten(s => ({ ...s, [key]: !s[key] }))}
                    className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 touch-target",
                      eaten[key] ? "bg-primary border-primary" : "border-muted-foreground")}
                    aria-label={eaten[key] ? "Mark as not eaten" : "Mark as eaten"}>
                    {eaten[key] && <Check className="w-4 h-4 text-primary-foreground" />}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2 text-center">
                  <div><p className="text-xs font-semibold text-foreground">{m.calories}</p><p className="text-[9px] text-muted-foreground">cal</p></div>
                  <div><p className="text-xs font-semibold text-primary">{m.protein_g}g</p><p className="text-[9px] text-muted-foreground">protein</p></div>
                  <div><p className="text-xs font-semibold text-foreground">{m.carbs_g}g</p><p className="text-[9px] text-muted-foreground">carbs</p></div>
                  <div><p className="text-xs font-semibold text-foreground">{m.fat_g}g</p><p className="text-[9px] text-muted-foreground">fat</p></div>
                </div>
                {m.ingredients?.length > 0 && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{m.ingredients.join(" · ")}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NutritionScreen;
