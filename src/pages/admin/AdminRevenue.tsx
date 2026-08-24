import React from "react";
import { DollarSign, TrendingUp, Users, ArrowUpRight, Activity, Loader2 } from "lucide-react";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { useAdminStats } from "@/hooks/useAdminStats";

const PREMIUM_PRICE = 9.99; // monthly premium price used for revenue estimates

const AdminRevenue: React.FC = () => {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading revenue…</div>;
  if (error || !stats) return <p className="text-sm text-destructive">Could not load revenue: {error}</p>;

  const t = stats.totals;
  const mrr = t.premium * PREMIUM_PRICE;
  const conversion = t.users ? ((t.premium / t.users) * 100).toFixed(1) : "0.0";
  const revenueSeries = stats.growth.map(g => ({
    month: g.month,
    revenue: Math.round(g.users * (t.users ? t.premium / t.users : 0) * PREMIUM_PRICE),
  }));

  const cards = [
    { label: "MRR (est.)", value: `$${mrr.toFixed(2)}`, icon: DollarSign },
    { label: "ARR (est.)", value: `$${(mrr * 12).toFixed(0)}`, icon: TrendingUp },
    { label: "Premium Users", value: t.premium.toLocaleString(), icon: Users },
    { label: "Free Users", value: t.free.toLocaleString(), icon: Users },
    { label: "Conversion Rate", value: `${conversion}%`, icon: ArrowUpRight },
    { label: "Active (30d)", value: t.active30d.toLocaleString(), icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Revenue Analytics</h2>
      <p className="text-xs text-muted-foreground">
        Estimates based on {t.premium} premium members at ${PREMIUM_PRICE}/month. Connect a payment provider for billed amounts.
      </p>

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

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Estimated Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={revenueSeries}>
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
};

export default AdminRevenue;
