import React from "react";
import { Users, TrendingUp, DollarSign, Activity, Target, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

const stats = [
  { label: "Total Users", value: "12,458", icon: Users, change: "+12%" },
  { label: "Active Today", value: "3,291", icon: Activity, change: "+5%" },
  { label: "Revenue", value: "$24,580", icon: DollarSign, change: "+18%" },
  { label: "Conversion", value: "8.4%", icon: TrendingUp, change: "+2.1%" },
];

const userGrowth = [
  { month: "Jan", users: 2100 }, { month: "Feb", users: 3200 }, { month: "Mar", users: 5100 },
  { month: "Apr", users: 7200 }, { month: "May", users: 9800 }, { month: "Jun", users: 12458 },
];

const goalDist = [
  { goal: "Bodybuilding", count: 3200 }, { goal: "Weight Loss", count: 2800 },
  { goal: "General", count: 2400 }, { goal: "Calisthenics", count: 1800 },
  { goal: "Martial Arts", count: 1200 }, { goal: "Tai Chi", count: 1058 },
];

const AdminDashboard: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <s.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-xl font-bold text-foreground">{s.value}</p>
          <span className="text-xs text-primary">{s.change}</span>
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={userGrowth}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Popular Goals</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={goalDist}>
            <XAxis dataKey="goal" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
