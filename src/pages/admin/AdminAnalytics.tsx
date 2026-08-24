import React from "react";
import { Users, Clock, Target, Activity, Dumbbell, UtensilsCrossed, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminAnalytics: React.FC = () => {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading analytics…</div>;
  if (error || !stats) return <p className="text-sm text-destructive">Could not load analytics: {error}</p>;

  const t = stats.totals;
  const cards = [
    { label: "Total Users", value: t.users.toLocaleString(), icon: Users },
    { label: "Active (30d)", value: t.active30d.toLocaleString(), icon: Activity },
    { label: "Onboarding Rate", value: `${t.onboardingRate}%`, icon: Target },
    { label: "Avg Session", value: `${t.avgSessionMin}m`, icon: Clock },
    { label: "Workout Completion", value: `${t.completionRate}%`, icon: Dumbbell },
    { label: "AI Meal Plans", value: t.mealPlans.toLocaleString(), icon: UtensilsCrossed },
  ];
  const maxCountry = Math.max(1, ...stats.countries.map(c => c.value));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">App Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Active Users (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailyActive}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Users by Country</h3>
          {stats.countries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No country data yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.countries.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 truncate">{c.name}</span>
                  <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(c.value / maxCountry) * 100}%`, opacity: 1 - i * 0.12 }} />
                  </div>
                  <span className="text-xs text-foreground w-10 text-right">{c.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Perceived Difficulty Feedback</h3>
        {stats.difficulty.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed sessions with feedback yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.difficulty}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
