import React from "react";
import { Users, TrendingUp, Activity, Flame, Loader2, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboard: React.FC = () => {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading dashboard…</div>;
  if (error || !stats) return <p className="text-sm text-destructive">Could not load dashboard: {error}</p>;

  const t = stats.totals;
  const cards = [
    { label: "Total Users", value: t.users.toLocaleString(), icon: Users, sub: `${t.onboarded} onboarded` },
    { label: "Active Today", value: t.activeToday.toLocaleString(), icon: Activity, sub: `${t.active7d} this week` },
    { label: "Premium", value: t.premium.toLocaleString(), icon: TrendingUp, sub: `${t.free} free` },
    { label: "Total XP", value: t.totalXp.toLocaleString(), icon: Flame, sub: `${t.sessionsCompleted} sessions done` },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Workouts", value: t.workouts },
          { label: "Meals", value: t.meals },
          { label: "Gyms", value: t.gyms },
          { label: "Open Feedback", value: t.openFeedback },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-2"><MessageSquare className="w-3 h-3 text-primary" />{s.label}</span>
            <p className="text-lg font-bold text-foreground">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.growth}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Popular Goals</h3>
          {stats.goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goal data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.goals}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
