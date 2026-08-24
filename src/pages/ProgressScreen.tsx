import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Flame, Trophy, Award, Plus, Scale } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Session { id: string; started_at: string; completed_at: string | null; xp_earned: number; duration_seconds: number | null; }
interface Metric { id: string; recorded_at: string; weight_kg: number | null; waist_cm: number | null; body_fat_pct: number | null; }

const ProgressScreen: React.FC = () => {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from("workout_sessions").select("id, started_at, completed_at, xp_earned, duration_seconds").eq("user_id", user.id).order("started_at", { ascending: true }),
      supabase.from("body_metrics").select("id, recorded_at, weight_kg, waist_cm, body_fat_pct").eq("user_id", user.id).order("recorded_at", { ascending: true }),
    ]);
    setSessions((s ?? []) as Session[]);
    setMetrics((m ?? []) as Metric[]);
  };

  useEffect(() => { load(); }, [user?.id]);

  const logMetric = async () => {
    if (!user) return;
    if (!weight && !waist) { toast.error("Enter a weight or waist measurement"); return; }
    setSaving(true);
    const { error } = await supabase.from("body_metrics").insert({
      user_id: user.id,
      weight_kg: weight ? Number(weight) : null,
      waist_cm: waist ? Number(waist) : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Logged — your next plan will adapt to this.");
    setWeight(""); setWaist("");
    load();
  };

  const weekDays = useMemo(() => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
    return DAY_LABELS.map((label, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const count = sessions.filter(s => s.completed_at && new Date(s.started_at).toDateString() === d.toDateString()).length;
      return { label, count };
    });
  }, [sessions]);

  const xpData = useMemo(() => {
    let total = 0;
    const byDate = new Map<string, number>();
    sessions.forEach(s => {
      total += s.xp_earned ?? 0;
      byDate.set(new Date(s.started_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }), total);
    });
    return Array.from(byDate, ([label, xp]) => ({ label, xp })).slice(-10);
  }, [sessions]);

  const weightData = useMemo(
    () => metrics.filter(m => m.weight_kg != null).map(m => ({
      label: new Date(m.recorded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      kg: Number(m.weight_kg),
    })).slice(-12),
    [metrics]
  );

  const completed = sessions.filter(s => s.completed_at).length;
  const totalMinutes = Math.round(sessions.reduce((t, s) => t + (s.duration_seconds ?? 0), 0) / 60);
  const totalXp = profile?.xp ?? sessions.reduce((t, s) => t + (s.xp_earned ?? 0), 0);

  const badges = [
    { name: "First Workout", icon: "💪", earned: completed >= 1 },
    { name: "5 Workouts", icon: "🏆", earned: completed >= 5 },
    { name: "7-Day Streak", icon: "🔥", earned: (profile?.streak ?? 0) >= 7 },
    { name: "30-Day Streak", icon: "⭐", earned: (profile?.streak ?? 0) >= 30 },
    { name: "1000 XP", icon: "🎯", earned: totalXp >= 1000 },
    { name: "Body Logger", icon: "📏", earned: metrics.length >= 3 },
  ];

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-foreground">Progress</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Workouts", value: completed },
          { label: "Minutes", value: totalMinutes },
          { label: "XP", value: totalXp },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-lg font-bold text-primary">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Streak week */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">This Week</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${d.count > 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {d.count > 0 ? "✓" : ""}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* XP chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">XP Progression</h3>
        </div>
        {xpData.length < 2 ? (
          <p className="text-xs text-muted-foreground">Complete a couple of workouts to see your trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={xpData}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Body weight chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Body Weight</h3>
        </div>
        {weightData.length < 2 ? (
          <p className="text-xs text-muted-foreground">Log your weight at least twice to see the trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weightData}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Badges */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Badges</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${b.earned ? "bg-primary/10" : "bg-secondary opacity-50"}`}>
              <span className="text-2xl">{b.earned ? b.icon : "🔒"}</span>
              <span className="text-[10px] text-center font-medium text-foreground">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recent Sessions</h3>
        </div>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sessions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">+{s.xp_earned} XP</span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {s.completed_at ? `${Math.round((s.duration_seconds ?? 0) / 60)} min` : "incomplete"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log metrics */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Log Body Metrics</h3>
        <div className="flex gap-2">
          <Input placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} type="number" className="flex-1 touch-target bg-secondary" aria-label="Weight in kg" />
          <Input placeholder="Waist (cm)" value={waist} onChange={e => setWaist(e.target.value)} type="number" className="flex-1 touch-target bg-secondary" aria-label="Waist in cm" />
          <Button onClick={logMetric} disabled={saving} className="btn-primary-gradient text-primary-foreground touch-target" aria-label="Save metrics">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
