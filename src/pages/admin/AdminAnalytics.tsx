import React from "react";
import { Users, Clock, Target, Activity, Globe, Dumbbell, UtensilsCrossed } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const dailyActive = [
  { day: "Mon", users: 2800 }, { day: "Tue", users: 3100 }, { day: "Wed", users: 2900 },
  { day: "Thu", users: 3200 }, { day: "Fri", users: 3500 }, { day: "Sat", users: 2400 }, { day: "Sun", users: 2100 },
];

const countries = [
  { name: "USA", value: 4200 }, { name: "UK", value: 2100 }, { name: "India", value: 1800 },
  { name: "Uganda", value: 1500 }, { name: "Germany", value: 1200 }, { name: "Other", value: 1658 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent))", "hsl(var(--ring))", "hsl(var(--border))", "hsl(var(--secondary))"];

const stats = [
  { label: "Total Users", value: "12,458", icon: Users },
  { label: "Monthly Active", value: "8,234", icon: Activity },
  { label: "Onboarding Rate", value: "87%", icon: Target },
  { label: "Avg Session", value: "12m", icon: Clock },
  { label: "Workout Completion", value: "72%", icon: Dumbbell },
  { label: "Meal Adherence", value: "65%", icon: UtensilsCrossed },
];

const AdminAnalytics: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">App Analytics</h2>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map(s => (
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
        <h3 className="text-sm font-semibold text-foreground mb-4">Daily Active Users</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyActive}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Users by Country</h3>
        <div className="space-y-2">
          {countries.map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">{c.name}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(c.value / 4200) * 100}%`, opacity: 1 - i * 0.12 }} />
              </div>
              <span className="text-xs text-foreground w-12 text-right">{c.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminAnalytics;
