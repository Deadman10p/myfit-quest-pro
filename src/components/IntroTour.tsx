import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Dumbbell, UtensilsCrossed, MessageCircle, TrendingUp, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const KEY = "fitai_intro_done";

const steps = [
  { icon: Sparkles, title: "Welcome to FitAI 👋", body: "Your AI coach builds workouts and meals around your goal, budget, location and equipment — and re-adapts as you progress.", to: "/dashboard" },
  { icon: Home, title: "Home", body: "Your daily snapshot: today's workout, meals, streak and XP. Tap the card to jump straight in.", to: "/dashboard" },
  { icon: Dumbbell, title: "Workouts", body: "Switch between Home and Gym mode. Start a session for a guided player with demo videos, rest countdowns and a voice coach.", to: "/workouts" },
  { icon: UtensilsCrossed, title: "Nutrition", body: "Weekly meal plans using foods available where you live, with calories, macros and estimated cost.", to: "/nutrition" },
  { icon: MessageCircle, title: "AI Coach", body: "Ask anything — form checks, swaps, motivation. Your coach knows your plan and progress.", to: "/coach" },
  { icon: TrendingUp, title: "Progress", body: "Log your weight and measurements. Every session you finish makes the next plan smarter.", to: "/progress" },
  { icon: MapPin, title: "Find a gym", body: "Search real gyms near you on the map from Settings > Find gyms whenever you train away from home.", to: "/dashboard" },
];

const IntroTour: React.FC = () => {
  const [visible, setVisible] = useState(() => localStorage.getItem(KEY) !== "1");
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const finish = () => { localStorage.setItem(KEY, "1"); setVisible(false); };

  const go = (n: number) => {
    setStep(n);
    if (steps[n]?.to) navigate(steps[n].to);
  };

  if (!visible) return null;
  const s = steps[step];
  const Icon = s.icon;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-label="App introduction">
        <motion.div key={step} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 mb-20 sm:mb-0">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
          <p className="text-sm text-muted-foreground mb-5">{s.body}</p>

          <div className="flex items-center gap-1.5 mb-5" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-secondary"}`} />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 touch-target text-xs" onClick={finish}>Skip tour</Button>
            {step > 0 && <Button variant="outline" className="touch-target text-xs" onClick={() => go(step - 1)}>Back</Button>}
            <Button className="flex-1 touch-target btn-primary-gradient text-primary-foreground font-semibold"
              onClick={() => (step === steps.length - 1 ? finish() : go(step + 1))}>
              {step === steps.length - 1 ? "Start training" : "Next"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroTour;
