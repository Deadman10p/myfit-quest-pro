import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Flame, Trophy, Star, Award, Lock, Plus, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const workoutData = [
  { day: "Mon", count: 1 }, { day: "Tue", count: 1 }, { day: "Wed", count: 0 },
  { day: "Thu", count: 1 }, { day: "Fri", count: 1 }, { day: "Sat", count: 0 }, { day: "Sun", count: 1 },
];

const xpData = [
  { week: "W1", xp: 200 }, { week: "W2", xp: 450 }, { week: "W3", xp: 700 },
  { week: "W4", xp: 1000 }, { week: "W5", xp: 1250 },
];

const badges = [
  { name: "First Workout", icon: "💪", earned: true },
  { name: "7-Day Streak", icon: "🔥", earned: true },
  { name: "100 Push-ups", icon: "🏆", earned: true },
  { name: "30-Day Streak", icon: "⭐", earned: false },
  { name: "1000 XP", icon: "🎯", earned: true },
  { name: "Perfect Week", icon: "👑", earned: false },
];

const personalBests = [
  { exercise: "Bench Press", weight: "80kg", date: "Mar 15" },
  { exercise: "Squat", weight: "100kg", date: "Mar 10" },
  { exercise: "Deadlift", weight: "120kg", date: "Mar 8" },
];

const ProgressScreen: React.FC = () => {
  const [weight, setWeight] = useState("");

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Progress</h2>

      {/* Streak Calendar */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">This Week</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {workoutData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${d.count > 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {d.count > 0 ? "✓" : ""}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* XP Chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">XP Progression</h3>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={xpData}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
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

      {/* Personal Bests */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Personal Bests</h3>
        </div>
        <div className="space-y-2">
          {personalBests.map((pb, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{pb.exercise}</span>
              <div className="text-right">
                <span className="text-sm font-bold text-primary">{pb.weight}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{pb.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Tracking */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Log Weight</h3>
        <div className="flex gap-2">
          <Input placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} type="number" className="flex-1 touch-target bg-secondary" aria-label="Weight in kg" />
          <Button className="btn-primary-gradient text-primary-foreground touch-target"><Plus className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
