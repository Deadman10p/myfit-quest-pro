import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Palette, Home, Building2, Bell, UtensilsCrossed, Target, User, Globe, MessageSquare, LogOut, ChevronRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const themes = [
  { id: "red" as const, label: "Red & Black", color: "bg-red-500" },
  { id: "blue" as const, label: "Blue & Black", color: "bg-blue-500" },
  { id: "yellow" as const, label: "Yellow & Black", color: "bg-yellow-500" },
];

const SettingsScreen: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [gymPref, setGymPref] = useState(true);
  const [birthday, setBirthday] = useState(true);
  const [notifs, setNotifs] = useState({
    workouts: true, meals: true, achievements: true, streaks: true, challenges: true, weekly: true,
  });

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      {/* Theme */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Theme</h3>
        </div>
        <div className="flex gap-3">
          {themes.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={cn("flex-1 p-3 rounded-xl border-2 transition-all touch-target flex flex-col items-center gap-2",
                theme === t.id ? "border-primary" : "border-border")}
              aria-pressed={theme === t.id} aria-label={t.label}>
              <div className={cn("w-6 h-6 rounded-full", t.color)} />
              <span className="text-[10px] font-medium text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Preference */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {gymPref ? <Building2 className="w-4 h-4 text-primary" /> : <Home className="w-4 h-4 text-primary" />}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Workout Location</h3>
              <p className="text-xs text-muted-foreground">{gymPref ? "Gym workouts" : "Home workouts"}</p>
            </div>
          </div>
          <Switch checked={gymPref} onCheckedChange={setGymPref} aria-label="Toggle gym preference" />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        {Object.entries(notifs).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-foreground capitalize">{key}</span>
            <Switch checked={val} onCheckedChange={v => setNotifs({ ...notifs, [key]: v })} aria-label={`Toggle ${key} notifications`} />
          </div>
        ))}
      </div>

      {/* Birthday */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Birthday Rewards</h3>
              <p className="text-xs text-muted-foreground">Get special rewards on your birthday</p>
            </div>
          </div>
          <Switch checked={birthday} onCheckedChange={setBirthday} aria-label="Toggle birthday reminder" />
        </div>
      </div>

      {/* Goal / Meal plan adjustment */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between touch-target" role="button" onClick={() => toast.info("You can adjust your goals once per week")}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Adjust Goals & Meal Plan</h3>
              <p className="text-xs text-muted-foreground">Limited to once per week</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Language */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Language</h3>
            <p className="text-xs text-muted-foreground">English</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <Button variant="outline" className="w-full touch-target" onClick={() => navigate("/feedback")}>
        <MessageSquare className="w-4 h-4 mr-2" /> Send Feedback
      </Button>

      {/* Account */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full touch-target text-destructive border-destructive/30 hover:bg-destructive/10" onClick={logout}>
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default SettingsScreen;
