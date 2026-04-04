import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Dumbbell, UtensilsCrossed, MessageCircle, MapPin, Trophy, Flame, Zap, Star, ChevronRight } from "lucide-react";

const Dashboard: React.FC = () => {
  const xp = 1250;
  const level = 5;
  const streak = 7;
  const xpForNext = 2000;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground">Good morning! 💪</h2>
        <p className="text-sm text-muted-foreground">Ready to crush today's goals?</p>
      </motion.div>

      {/* XP & Streak */}
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

      {/* Today's Workout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link to="/workouts" className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Workout</h3>
                <p className="text-xs text-muted-foreground">Upper Body • 45 min</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            {["Bench Press", "Rows", "Shoulder Press", "+3 more"].map((ex, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-secondary text-muted-foreground">{ex}</span>
            ))}
          </div>
        </Link>
      </motion.div>

      {/* Today's Meals */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Link to="/nutrition" className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Today's Meals</h3>
                <p className="text-xs text-muted-foreground">2,100 cal • 3 meals planned</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
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

      {/* Active Challenge */}
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
          <p className="text-[10px] text-muted-foreground mt-1">3/5 completed</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
