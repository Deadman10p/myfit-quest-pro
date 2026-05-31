import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, Flame, Swords, Wind, Scale, Heart, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const goals = [
  { id: "bodybuilding", label: "Bodybuilding", icon: Dumbbell },
  { id: "calisthenics", label: "Calisthenics", icon: Flame },
  { id: "martial-arts", label: "Martial Arts", icon: Swords },
  { id: "tai-chi", label: "Tai Chi", icon: Wind },
  { id: "weight-loss", label: "Weight Loss", icon: Scale },
  { id: "general", label: "General Fitness", icon: Heart },
];

const levels = ["Beginner", "Intermediate", "Advanced"];

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "Kosher", "Keto", "Nut Allergy", "Shellfish Allergy"];

const notifOptions = ["Workout reminders", "Meal reminders", "Achievement alerts", "Weekly reports", "Motivational quotes"];

const steps = [
  "name", "dob", "goal", "level", "location", "budget", "meals", "dietary", "notifications"
] as const;

type Step = typeof steps[number];

const OnboardingScreen: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({
    name: "", dob: undefined as Date | undefined, goal: "", level: "",
    country: "", city: "", budget: "", mealsPerDay: "3",
    dietary: [] as string[], dietaryOther: "",
    notifs: ["Workout reminders", "Meal reminders", "Achievement alerts"] as string[],
  });
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const canNext = () => {
    switch (step) {
      case "name": return data.name.trim().length > 0;
      case "dob": return !!data.dob;
      case "goal": return !!data.goal;
      case "level": return !!data.level;
      case "location": return data.country.trim().length > 0;
      case "budget": return data.budget.trim().length > 0;
      case "meals": return !!data.mealsPerDay;
      case "dietary": return true;
      case "notifications": return true;
    }
  };

  const next = () => {
    if (stepIndex < steps.length - 1) setStepIndex(i => i + 1);
    else finish();
  };

  const back = () => { if (stepIndex > 0) setStepIndex(i => i - 1); };

  const finish = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    const dietary = data.dietaryOther
      ? [...data.dietary, data.dietaryOther]
      : data.dietary;
    const { error } = await supabase.from("profiles").update({
      display_name: data.name,
      goal: data.goal,
      country: data.country,
      budget: data.budget,
      dietary,
      onboarded: true,
    }).eq("id", user.id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    // Kick off initial AI plan generation (workout + meal plan). Wait so first dashboard load has data.
    try {
      await supabase.functions.invoke("ai-generate-plan", { body: { adapt: false } });
    } catch (e) {
      console.warn("Initial plan generation failed, will retry on dashboard", e);
    }
    await refreshProfile();
    navigate("/dashboard");
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 200 : -200, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const handleNext = () => { setDirection(1); next(); };
  const handleBack = () => { setDirection(-1); back(); };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{stepIndex + 1} of {steps.length}</span>
          <span className="text-xs text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === "name" && (
              <StepWrapper title="What's your name?" subtitle="We'll use this to personalize your experience">
                <Input placeholder="Full name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="touch-target bg-secondary text-lg" aria-label="Full name" autoFocus />
              </StepWrapper>
            )}

            {step === "dob" && (
              <StepWrapper title="When were you born?" subtitle="This helps us tailor workouts to your age">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full touch-target justify-start text-left bg-secondary", !data.dob && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.dob ? format(data.dob, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar mode="single" selected={data.dob} onSelect={d => setData({ ...data, dob: d })} disabled={d => d > new Date() || d < new Date("1920-01-01")} initialFocus className="p-3 pointer-events-auto" captionLayout="dropdown-buttons" fromYear={1940} toYear={new Date().getFullYear()} />
                  </PopoverContent>
                </Popover>
              </StepWrapper>
            )}

            {step === "goal" && (
              <StepWrapper title="What's your fitness goal?" subtitle="Choose what drives you most">
                <div className="grid grid-cols-2 gap-3">
                  {goals.map(g => (
                    <button key={g.id} onClick={() => setData({ ...data, goal: g.id })}
                      className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all touch-target",
                        data.goal === g.id ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/50")}
                      aria-pressed={data.goal === g.id} aria-label={g.label}>
                      <g.icon className={cn("w-6 h-6", data.goal === g.id ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm font-medium", data.goal === g.id ? "text-primary" : "text-foreground")}>{g.label}</span>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {step === "level" && (
              <StepWrapper title="Your fitness level?" subtitle="Be honest — we'll meet you where you are">
                <div className="space-y-3">
                  {levels.map(l => (
                    <button key={l} onClick={() => setData({ ...data, level: l })}
                      className={cn("w-full p-4 rounded-xl border-2 text-left transition-all touch-target",
                        data.level === l ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/50")}
                      aria-pressed={data.level === l}>
                      <span className={cn("font-medium", data.level === l ? "text-primary" : "text-foreground")}>{l}</span>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {step === "location" && (
              <StepWrapper title="Where are you located?" subtitle="For local meal pricing and gym recommendations">
                <div className="space-y-3">
                  <Input placeholder="Country" value={data.country} onChange={e => setData({ ...data, country: e.target.value })} className="touch-target bg-secondary" aria-label="Country" />
                  <Input placeholder="City (optional)" value={data.city} onChange={e => setData({ ...data, city: e.target.value })} className="touch-target bg-secondary" aria-label="City" />
                </div>
              </StepWrapper>
            )}

            {step === "budget" && (
              <StepWrapper title="Daily meal budget?" subtitle="In your local currency — we'll plan meals to fit">
                <Input placeholder="e.g. 30" type="number" value={data.budget} onChange={e => setData({ ...data, budget: e.target.value })} className="touch-target bg-secondary text-lg" aria-label="Budget for meals per day" />
              </StepWrapper>
            )}

            {step === "meals" && (
              <StepWrapper title="Meals per day?" subtitle="How many meals do you prefer?">
                <div className="flex gap-3 justify-center">
                  {["2", "3", "4", "5"].map(n => (
                    <button key={n} onClick={() => setData({ ...data, mealsPerDay: n })}
                      className={cn("w-16 h-16 rounded-xl border-2 text-xl font-bold transition-all",
                        data.mealsPerDay === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground hover:border-primary/50")}
                      aria-pressed={data.mealsPerDay === n} aria-label={`${n} meals per day`}>{n}</button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {step === "dietary" && (
              <StepWrapper title="Dietary restrictions?" subtitle="Select all that apply or add your own">
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(d => (
                    <button key={d} onClick={() => setData({ ...data, dietary: toggleArrayItem(data.dietary, d) })}
                      className={cn("px-3 py-2 rounded-lg border text-sm transition-all touch-target",
                        data.dietary.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground")}
                      aria-pressed={data.dietary.includes(d)}>{d}</button>
                  ))}
                </div>
                <Input placeholder="Other (specify)" value={data.dietaryOther} onChange={e => setData({ ...data, dietaryOther: e.target.value })} className="touch-target bg-secondary mt-3" aria-label="Other dietary restrictions" />
              </StepWrapper>
            )}

            {step === "notifications" && (
              <StepWrapper title="Notification preferences" subtitle="Choose what you'd like to be reminded about">
                <div className="space-y-2">
                  {notifOptions.map(n => (
                    <button key={n} onClick={() => setData({ ...data, notifs: toggleArrayItem(data.notifs, n) })}
                      className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all touch-target",
                        data.notifs.includes(n) ? "border-primary bg-primary/10" : "border-border bg-secondary")}
                      aria-pressed={data.notifs.includes(n)}>
                      <div className={cn("w-5 h-5 rounded border flex items-center justify-center",
                        data.notifs.includes(n) ? "bg-primary border-primary" : "border-muted-foreground")}>
                        {data.notifs.includes(n) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm text-foreground">{n}</span>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="max-w-md mx-auto w-full flex gap-3 pt-4">
        {stepIndex > 0 && (
          <Button variant="outline" onClick={handleBack} className="touch-target flex-1" aria-label="Previous step">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canNext()} className="touch-target flex-1 btn-primary-gradient text-primary-foreground font-semibold" aria-label={stepIndex === steps.length - 1 ? "Finish onboarding" : "Next step"}>
          {stepIndex === steps.length - 1 ? "Finish" : "Continue"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

const StepWrapper: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div>
    <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
    <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>
    {children}
  </div>
);

const motivationalMessages = [
  "Analyzing your goals...",
  "Building your personalized plan...",
  "Customizing meal recommendations...",
  "Setting up your AI coach...",
  "Preparing your workout schedule...",
  "Almost ready to transform! 🔥",
];

const LoadingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % motivationalMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-full border-4 border-secondary border-t-primary mb-8"
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-foreground font-medium text-center"
        >
          {motivationalMessages[msgIndex]}
        </motion.p>
      </AnimatePresence>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingScreen;
