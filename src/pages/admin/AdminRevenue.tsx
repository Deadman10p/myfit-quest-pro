import React from "react";
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, MousePointerClick } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 8200 }, { month: "Feb", revenue: 12400 }, { month: "Mar", revenue: 15800 },
  { month: "Apr", revenue: 18200 }, { month: "May", revenue: 21500 }, { month: "Jun", revenue: 24580 },
];

const stats = [
  { label: "Total Revenue", value: "$24,580", icon: DollarSign, change: "+18%", up: true },
  { label: "MRR", value: "$4,230", icon: TrendingUp, change: "+12%", up: true },
  { label: "Free vs Premium", value: "76/24%", icon: Users, change: "", up: true },
  { label: "Conversion Rate", value: "8.4%", icon: ArrowUpRight, change: "+2.1%", up: true },
  { label: "Churn Rate", value: "3.2%", icon: ArrowDownRight, change: "-0.5%", up: false },
  { label: "Gym Referral Clicks", value: "1,847", icon: MousePointerClick, change: "+23%", up: true },
];

const AdminRevenue: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Revenue Analytics</h2>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <s.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-xl font-bold text-foreground">{s.value}</p>
          {s.change && <span className={`text-xs ${s.up ? "text-green-500" : "text-primary"}`}>{s.change}</span>}
        </div>
      ))}
    </div>

    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AdminRevenue;
