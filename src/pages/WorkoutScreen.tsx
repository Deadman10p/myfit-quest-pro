import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Check, SkipForward, ThumbsDown, ThumbsUp, Pause, Mic, Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const exercises = [
  { name: "Barbell Bench Press", sets: 4, reps: 10, rest: 90, muscles: ["Chest", "Triceps"], form: "Grip slightly wider than shoulders, lower bar to mid-chest, press up." },
  { name: "Bent-Over Rows", sets: 4, reps: 10, rest: 90, muscles: ["Back", "Biceps"], form: "Hinge at hips, pull barbell to lower chest, squeeze shoulder blades." },
  { name: "Overhead Press", sets: 3, reps: 12, rest: 60, muscles: ["Shoulders", "Triceps"], form: "Press bar overhead, keep core tight, full lockout at top." },
  { name: "Dumbbell Curls", sets: 3, reps: 12, rest: 60, muscles: ["Biceps"], form: "Keep elbows pinned, curl with full range, control the negative." },
  { name: "Tricep Dips", sets: 3, reps: 15, rest: 60, muscles: ["Triceps", "Chest"], form: "Lean slightly forward, lower until elbows are 90°, push back up." },
  { name: "Plank Hold", sets: 3, reps: 1, rest: 45, muscles: ["Core"], form: "Hold rigid position from forearms and toes, engage abs throughout. 45s each." },
];

const WorkoutScreen: React.FC = () => {
  const [mode, setMode] = useState<"plan" | "active">("plan");
  const [gymMode, setGymMode] = useState(true);
  const [activeExercise, setActiveExercise] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({});

  const startRest = (seconds: number) => {
    setResting(true);
    setRestTime(seconds);
    const interval = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) { clearInterval(interval); setResting(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const markDone = () => {
    const ex = activeExercise;
    const done = (completedSets[ex] || 0) + 1;
    setCompletedSets({ ...completedSets, [ex]: done });
    if (done >= exercises[ex].sets) {
      if (activeExercise < exercises.length - 1) {
        startRest(exercises[ex].rest);
        setTimeout(() => setActiveExercise(a => a + 1), exercises[ex].rest * 1000);
      } else {
        setMode("plan");
      }
    } else {
      startRest(exercises[ex].rest);
    }
  };

  if (mode === "active") {
    const ex = exercises[activeExercise];
    const setsCompleted = completedSets[activeExercise] || 0;
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setMode("plan")} className="touch-target">End Workout</Button>
          <span className="text-xs text-muted-foreground">{activeExercise + 1}/{exercises.length}</span>
        </div>

        <AnimatePresence mode="wait">
          {resting ? (
            <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground mb-2">Rest</p>
              <p className="text-6xl font-bold text-primary">{restTime}s</p>
              <Button variant="outline" className="mt-6 touch-target" onClick={() => { setResting(false); setRestTime(0); }}>
                <SkipForward className="w-4 h-4 mr-1" /> Skip Rest
              </Button>
            </motion.div>
          ) : (
            <motion.div key={activeExercise} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-4">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-1">{ex.name}</h2>
                <div className="flex gap-2 mb-3">
                  {ex.muscles.map(m => <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary">{m}</span>)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{ex.form}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">Set {setsCompleted + 1} of {ex.sets}</span>
                  <span className="text-muted-foreground">{ex.reps} reps</span>
                </div>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(setsCompleted / ex.sets) * 100}%` }} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={markDone} className="flex-1 touch-target btn-primary-gradient text-primary-foreground font-semibold">
                  <Check className="w-4 h-4 mr-1" /> Done
                </Button>
                <Button variant="outline" className="touch-target" onClick={() => {
                  if (activeExercise < exercises.length - 1) setActiveExercise(a => a + 1);
                  else setMode("plan");
                }}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" className="text-xs touch-target"><ThumbsDown className="w-3 h-3 mr-1" /> Too Easy</Button>
                <Button variant="outline" size="sm" className="text-xs touch-target"><ThumbsUp className="w-3 h-3 mr-1" /> Too Hard</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice coach button */}
        <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full btn-primary-gradient flex items-center justify-center shadow-lg animate-pulse-glow z-30"
          aria-label="Voice coach">
          <Mic className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Today's Workout</h2>
        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          <button onClick={() => setGymMode(false)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", !gymMode ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="Home workout" aria-pressed={!gymMode}>
            <Home className="w-3 h-3" /> Home
          </button>
          <button onClick={() => setGymMode(true)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", gymMode ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="Gym workout" aria-pressed={gymMode}>
            <Building2 className="w-3 h-3" /> Gym
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Upper Body Strength • ~45 min • {exercises.length} exercises</p>

      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{ex.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{ex.sets} sets × {ex.reps} reps • {ex.rest}s rest</p>
              </div>
              <div className="flex gap-1">
                {ex.muscles.map(m => <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">{m}</span>)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{ex.form}</p>
          </motion.div>
        ))}
      </div>

      <Button onClick={() => { setMode("active"); setActiveExercise(0); setCompletedSets({}); }} className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold text-base">
        <Play className="w-5 h-5 mr-2" /> Start Workout
      </Button>
    </div>
  );
};

export default WorkoutScreen;
